import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
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
  PreparedOrderMethod,
  sameChainOrder,
  signOrder,
  signOrderMethod,
} from "../client";

describe("Release Order - OrderSig", function () {
  it("Buy[Release, Reverts for Release]", async function () {
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

    const releaseMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.release,
      expiry,
    };
    const releaseOrderMethod: PreparedOrderMethod =
      makeOrderMethod(releaseMethodPayload);
    const releaseOrderSig = await signOrderMethod(
      kofiMerchant,
      releaseOrderMethod,
      domain
    );
    //revert for MustBeMerchant
    const notMerchantReleaseOrderSig = await signOrderMethod(
      amaTrader,
      releaseOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.releaseOrder(releaseOrderMethod, notMerchantReleaseOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "MustBeMerchant");

    //passing releaseOrder
    await expect(
      orderSigProxy.releaseOrder(releaseOrderMethod, releaseOrderSig)
    )
      .to.emit(usdt, "Transfer")
      .withArgs(await orderSigProxy.getAddress(), amaTrader.address, anyValue);
  });

  it("Sell[Reverts for Release]", async function () {
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
      OrderType.sell,
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

    await usdt.connect(amaTrader).approve(sigchainAddress, oneGrand);

    await expect(orderSigProxy.createOrder(order, traderSig, merchantSig))
      .to.emit(usdt, "Transfer")
      .withArgs(amaTrader.address, await orderSigProxy.getAddress(), oneGrand);

       const payMethodPayload: OrderMethodPayload = {
         orderHash,
         method: OrderMethod.pay,
         expiry,
       };
    const payOrderMethod: PreparedOrderMethod = makeOrderMethod(
      payMethodPayload
    );
    const payOrderSig = await signOrderMethod(
      kofiMerchant,
      payOrderMethod,
      domain
    );

    await expect(orderSigProxy.payOrder(payOrderMethod, payOrderSig))
      .to.emit(orderSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

     const releaseMethodPayload: OrderMethodPayload = {
       orderHash,
       method: OrderMethod.release,
       expiry,
     };

    const releaseOrderMethod: PreparedOrderMethod = makeOrderMethod(
      releaseMethodPayload
    );
    const releaseOrderSig = await signOrderMethod(
      amaTrader,
      releaseOrderMethod,
      domain
    );

    //revert for releaseOrder: expired sig
     const expiredReleaseMethodPayload: OrderMethodPayload = {
       orderHash,
       method: OrderMethod.release,
       expiry,
     };
    const expiredReleaseOrderMethod: PreparedOrderMethod = makeOrderMethod(
      expiredReleaseMethodPayload
    );
    expiredReleaseOrderMethod.expiry = BigInt(
      Math.floor(Date.now() / 1000 - 60 * 15)
    );

    await expect(
      orderSigProxy.releaseOrder(expiredReleaseOrderMethod, releaseOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "SignatureExpired");

    //revert for not Trader
    const notTraderReleaseOrderSig = await signOrderMethod(
      yaaBrokie,
      releaseOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.releaseOrder(releaseOrderMethod, notTraderReleaseOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "MustBeTrader");

    //revert for invalid sig
    await expect(
      orderSigProxy.releaseOrder(releaseOrderMethod, "0x")
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidSignature");

    //revert for InvalidOrderMethodCall
     const invalidReleaseMethodPayload: OrderMethodPayload = {
       orderHash,
       method: OrderMethod.pay,
       expiry,
     };
    const invalidReleaseOrderMethod: PreparedOrderMethod = makeOrderMethod(
      invalidReleaseMethodPayload
    );
    await expect(
      orderSigProxy.releaseOrder(invalidReleaseOrderMethod, releaseOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidOrderMethodCall");

    //revert for OrderDoesNotExists
    const nonExistentOrder = {
      ...order,
      merchant: ethers.Wallet.createRandom().address,
    };
    const nonExistentOrderHash = createOrderTypedDataHash(
      nonExistentOrder,
      domain
    );

     const nonExistentpayMethodPayload: OrderMethodPayload = {
       orderHash: nonExistentOrderHash,
       method: OrderMethod.release,
       expiry,
     };
    const nonExistentOrderMethod: PreparedOrderMethod = makeOrderMethod(
      nonExistentpayMethodPayload
    );

    await expect(
      orderSigProxy.releaseOrder(nonExistentOrderMethod, releaseOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "OrderDoesNotExists");

    //pass release
    await expect(
      orderSigProxy.releaseOrder(releaseOrderMethod, releaseOrderSig)
    )
      .to.emit(usdt, "Transfer")
      .withArgs(
        await orderSigProxy.getAddress(),
        kofiMerchant.address,
        anyValue
      );

    //revert for OrderPaidRequired
    await expect(
      orderSigProxy.releaseOrder(releaseOrderMethod, releaseOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "OrderPaidRequired");
  });
});
