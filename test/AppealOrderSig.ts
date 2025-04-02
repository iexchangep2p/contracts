import {
  loadFixture
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";
import { expect } from "chai";
import { deployIExchange } from "./IExchangeDeployFixture";
import {
  createOrderTypedDataHash,
  encodedCreateOrder,
  iexDomain,
  iexDomainHash,
  makeOrderMethod,
  OrderMethod,
  OrderMethodPayload,
  orderSigChain,
  OrderState,
  OrderType,
  sameChainOrder,
  signOrder,
  AppealDecision,
  signOrderMethod,
  PreparedOrderMethod,
} from "../client";

describe("Appeal Order - OrderSig", function () {
  it("Should[Appeal]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderSigProxy,
      viewProxy,
      iExchangeP2P,
    } = await loadFixture(deployIExchange);

    //createOrder → acceptOrder → payOrder → appealOrder

    const order = sameChainOrder(
      amaTrader.address,
      kofiMerchant.address,
      await usdt.getAddress(),
      ethers.keccak256(currency),
      ethers.keccak256(paymentMethod),
      oneGrandNumber,
      OrderType.buy,
      chainId,
      chainId
    );
    const expiry = Math.floor(Date.now() / 1000) + 60 * 15;

    const sigchain = orderSigChain(order);
    const sigchainAddress = await orderSigProxy.getAddress();
    const domain = iexDomain(sigchain, sigchainAddress);

    const domainHash = iexDomainHash(domain);

    const orderHash = createOrderTypedDataHash(order, domain);

    const sigchainDomainHash = await iExchangeP2P.domainSeparator();
    expect(domainHash).to.equal(sigchainDomainHash);
    const traderSig = await signOrder(amaTrader, order, domain);
    const merchantSig = await signOrder(kofiMerchant, order, domain);

    const traderAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      traderSig
    );
    expect(amaTrader.address).to.equal(traderAddress);

    const merchantAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      merchantSig
    );

    expect(kofiMerchant.address).to.equal(merchantAddress);

    await usdt.connect(kofiMerchant).approve(sigchainAddress, oneGrand);

    await expect(orderSigProxy.createOrder(order, traderSig, merchantSig))
      .to.emit(usdt, "Transfer")
      .withArgs(
        kofiMerchant.address,
        await orderSigProxy.getAddress(),
        oneGrand
      );

    const payMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.pay,
      expiry,
    };

    const payOrderMethod: PreparedOrderMethod =
      makeOrderMethod(payMethodPayload);
    const payOrderSig = await signOrderMethod(
      amaTrader,
      payOrderMethod,
      domain
    );

    await expect(orderSigProxy.payOrder(payOrderMethod, payOrderSig))
      .to.emit(orderSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    const appealMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.pay,
      expiry,
    };

    const appealOrderMethod: PreparedOrderMethod =
      makeOrderMethod(appealMethodPayload);
    const appealOrderSig = await signOrderMethod(
      kofiMerchant,
      appealOrderMethod,
      domain
    );

    //Passing appeal order
    await expect(orderSigProxy.appealOrder(appealOrderMethod, appealOrderSig))
      .to.emit(orderSigProxy, "OrderAppealed")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        AppealDecision.unvoted,
        OrderState.appealed,
        anyValue
      );
    //console.log("Appeals: ", await viewProxy.appeals(orderHash));
    const [appealsHash] = await viewProxy.appeals(
      orderHash
    );
    expect(appealsHash).to.equal(orderHash);
  });
  it("Should[Reverts for Appeal]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      yaaBrokie,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderSigProxy,
      viewProxy,
      iExchangeP2P,
    } = await loadFixture(deployIExchange);

    //createOrder → acceptOrder → payOrder → appealOrder

    const order = sameChainOrder(
      amaTrader.address,
      kofiMerchant.address,
      await usdt.getAddress(),
      ethers.keccak256(currency),
      ethers.keccak256(paymentMethod),
      oneGrandNumber,
      OrderType.buy,
      chainId,
      chainId
    );
    const expiry = Math.floor(Date.now() / 1000) + 60 * 15;

    const sigchain = orderSigChain(order);
    const sigchainAddress = await orderSigProxy.getAddress();
    const domain = iexDomain(sigchain, sigchainAddress);

    const domainHash = iexDomainHash(domain);

    const orderHash = createOrderTypedDataHash(order, domain);

    const sigchainDomainHash = await iExchangeP2P.domainSeparator();
    expect(domainHash).to.equal(sigchainDomainHash);
    const traderSig = await signOrder(amaTrader, order, domain);
    const merchantSig = await signOrder(kofiMerchant, order, domain);

    const traderAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      traderSig
    );
    expect(amaTrader.address).to.equal(traderAddress);

    const merchantAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      merchantSig
    );

    expect(kofiMerchant.address).to.equal(merchantAddress);

    await usdt.connect(kofiMerchant).approve(sigchainAddress, oneGrand);

    await expect(orderSigProxy.createOrder(order, traderSig, merchantSig))
      .to.emit(usdt, "Transfer")
      .withArgs(
        kofiMerchant.address,
        await orderSigProxy.getAddress(),
        oneGrand
      );

    const payMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.pay,
      expiry,
    };

    const payOrderMethod: PreparedOrderMethod =
      makeOrderMethod(payMethodPayload);
    const payOrderSig = await signOrderMethod(
      amaTrader,
      payOrderMethod,
      domain
    );

    await expect(orderSigProxy.payOrder(payOrderMethod, payOrderSig))
      .to.emit(orderSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    const appealMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.pay,
      expiry,
    };

    const appealOrderMethod: PreparedOrderMethod =
      makeOrderMethod(appealMethodPayload);
    const appealOrderSig = await signOrderMethod(
      kofiMerchant,
      appealOrderMethod,
      domain
    );

    //revert for expired sig
    const newExpiry = Math.floor(Date.now() / 1000) - 60 * 15;

    const expiryMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.pay,
      expiry: newExpiry,
    };
    const expiryOrderMethod: PreparedOrderMethod =
      makeOrderMethod(expiryMethodPayload);
    const expiredMerchantSigForAppeal = await signOrderMethod(
      kofiMerchant,
      expiryOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.appealOrder(expiryOrderMethod, expiredMerchantSigForAppeal)
    ).to.be.revertedWithCustomError(orderSigProxy, "SignatureExpired");

    //revert for invalid sig
    await expect(
      orderSigProxy.appealOrder(payOrderMethod, "0x")
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidSignature");

    //revert for invalid method
    const invalidMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.release,
      expiry,
    };
    const invalidOrderMethod: PreparedOrderMethod =
      makeOrderMethod(invalidMethodPayload);

    await expect(
      orderSigProxy.appealOrder(invalidOrderMethod, appealOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidOrderMethodCall");

    //revert for OrderDoesNotExists
    const nonExistentOrder = { ...order, trader: yaaBrokie.address };
    const nonExistentOrderHash = createOrderTypedDataHash(
      nonExistentOrder,
      domain
    );

    const nonExistentMethodPayload: OrderMethodPayload = {
      orderHash: nonExistentOrderHash,
      method: OrderMethod.pay,
      expiry,
    };
    const nonExistentOrderMethod: PreparedOrderMethod = makeOrderMethod(
      nonExistentMethodPayload
    );
    const nonExistentOrderSig = await signOrderMethod(
      kofiMerchant,
      nonExistentOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.appealOrder(nonExistentOrderMethod, nonExistentOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "OrderDoesNotExists");

    //revert for MustBeMerchantOrTrader
    const notMerchantMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.pay,
      expiry,
    };
    const notMerchantOrderMethod: PreparedOrderMethod = makeOrderMethod(
      notMerchantMethodPayload
    );
    const notMerchantOrderSig = await signOrderMethod(
      yaaBrokie,
      notMerchantOrderMethod,
      domain
    );
    await expect(
      orderSigProxy.appealOrder(notMerchantOrderMethod, notMerchantOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "MustBeMerchantOrTrader");

    //Passing appeal order
    await expect(orderSigProxy.appealOrder(appealOrderMethod, appealOrderSig))
      .to.emit(orderSigProxy, "OrderAppealed")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        AppealDecision.unvoted,
        OrderState.appealed,
        anyValue
      );
    //console.log("Appeals: ", await viewProxy.appeals(orderHash));
    const [appealsHash, caller, decision, createdAt] = await viewProxy.appeals(
      orderHash
    );
    expect(appealsHash).to.equal(orderHash);
  });
});
