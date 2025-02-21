import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers, ignition } from "hardhat";
import { expect } from "chai";
import { deployIExchange } from "./IExchangeDeployFixture";
import {
  createOrderMethodTypedDataHash,
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
  signOrderMethod,
} from "../client";

describe("Pay Order - OrderSig", function () {
  it("Buy[Pay Order]", async function () {
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
      orderProxy,
      iExchangeP2P,
    } = await loadFixture(deployIExchange);

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

    const payOrderMethod: OrderMethodPayload = makeOrderMethod(
      orderHash,
      OrderMethod.pay
    );
    const payOrderSig = await signOrderMethod(
      amaTrader,
      payOrderMethod,
      domain
    );
    await expect(orderSigProxy.payOrder(payOrderMethod, payOrderSig))
      .to.emit(orderSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);
  });

  it("Buy[Reverts for Pay Order]", async function () {
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
      orderProxy,
      iExchangeP2P,
    } = await loadFixture(deployIExchange);

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

    //revert for expired sig
    const expiredPayOrderMethod: OrderMethodPayload = makeOrderMethod(
      orderHash,
      OrderMethod.pay
    );
    expiredPayOrderMethod.expiry = BigInt(
      Math.floor(Date.now() / 1000) - 60 * 15
    );
    const expiredPayOrderSig = await signOrderMethod(
      amaTrader,
      expiredPayOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.payOrder(expiredPayOrderMethod, expiredPayOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "SignatureExpired");

    //revert for non-existing order
    const nonExistentOrder = { ...order };
    nonExistentOrder.merchant = ethers.Wallet.createRandom().address;

    const nonExistentOrderHash = createOrderTypedDataHash(
      nonExistentOrder,
      domain
    );
    const nonExistentPayOrderMethod: OrderMethodPayload = makeOrderMethod(
      nonExistentOrderHash,
      OrderMethod.pay
    );
    const nonExistentPayOrderSig = await signOrderMethod(
      amaTrader,
      nonExistentPayOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.payOrder(nonExistentPayOrderMethod, nonExistentPayOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "OrderDoesNotExists");

    //revert for not trader
    const notTraderPayOrderMethod: OrderMethodPayload = makeOrderMethod(
      orderHash,
      OrderMethod.pay
    );
    const notTraderPayOrderSig = await signOrderMethod(
      yaaBrokie,
      notTraderPayOrderMethod,
      domain
    );
    await expect(
      orderSigProxy.payOrder(notTraderPayOrderMethod, notTraderPayOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "MustBeTrader");

    //passing paid order
    const payOrderMethod: OrderMethodPayload = makeOrderMethod(
      orderHash,
      OrderMethod.pay
    );
    const payOrderSig = await signOrderMethod(
      amaTrader,
      payOrderMethod,
      domain
    );
    await expect(orderSigProxy.payOrder(payOrderMethod, payOrderSig))
      .to.emit(orderSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);
  });
});
