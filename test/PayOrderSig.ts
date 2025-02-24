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
  PreparedOrderMethod,
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

    const payOrderMethod: PreparedOrderMethod = makeOrderMethod(
      payMethodPayload
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

    //revert for expired sig
     const expiredPayMethodPayload: OrderMethodPayload = {
       orderHash,
       method: OrderMethod.pay,
       expiry,
     };
    const expiredPayOrderMethod: PreparedOrderMethod = makeOrderMethod(
      expiredPayMethodPayload
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
     const nonExistentPayMethodPayload: OrderMethodPayload = {
       orderHash: nonExistentOrderHash,
       method: OrderMethod.pay,
       expiry,
     };
    const nonExistentPayOrderMethod: PreparedOrderMethod = makeOrderMethod(
     nonExistentPayMethodPayload
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
     const notTraderPayMethodPayload: OrderMethodPayload = {
       orderHash,
       method: OrderMethod.pay,
       expiry,
     };
    const notTraderPayOrderMethod: PreparedOrderMethod = makeOrderMethod(
      notTraderPayMethodPayload
    );
    const notTraderPayOrderSig = await signOrderMethod(
      yaaBrokie,
      notTraderPayOrderMethod,
      domain
    );
    await expect(
      orderSigProxy.payOrder(notTraderPayOrderMethod, notTraderPayOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "MustBeTrader");

    //revert for invalid method call
     const invalidPayMethodPayload: OrderMethodPayload = {
       orderHash,
       method: OrderMethod.cancel,
       expiry,
     };
    const invalidTraderPayOrderMethod: PreparedOrderMethod = makeOrderMethod(
      invalidPayMethodPayload
    );
    const invalidTraderPayOrderSig = await signOrderMethod(
      amaTrader,
      invalidTraderPayOrderMethod,
      domain
    );
    await expect(
      orderSigProxy.payOrder(
        invalidTraderPayOrderMethod,
        invalidTraderPayOrderSig
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidOrderMethodCall");

    //passing paid order
     const payMethodPayload: OrderMethodPayload = {
       orderHash,
       method: OrderMethod.pay,
       expiry,
     };
    const payOrderMethod: PreparedOrderMethod = makeOrderMethod(
      payMethodPayload
    );
    const payOrderSig = await signOrderMethod(
      amaTrader,
      payOrderMethod,
      domain
    );
    await expect(orderSigProxy.payOrder(payOrderMethod, payOrderSig))
      .to.emit(orderSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    //revert for OrderAcceptedRequired
    await expect(
      orderSigProxy.payOrder(payOrderMethod, payOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "OrderAcceptedRequired");
  });

  it("Sell[Pay Order - Pending State, Merchant Pay]", async function () {
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

    //revert for MustBeMerchant
    const notMerchantpayOrderSig = await signOrderMethod(
      yaaBrokie,
      payOrderMethod,
      domain
    );
    await expect(
      orderSigProxy.payOrder(payOrderMethod, notMerchantpayOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "MustBeMerchant");

    const payOrderSig = await signOrderMethod(
      kofiMerchant,
      payOrderMethod,
      domain
    );
    //pass payorder
    await expect(orderSigProxy.payOrder(payOrderMethod, payOrderSig))
      .to.emit(orderSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    //revert for OrderPendingOrAcceptedRequired
    await expect(
      orderSigProxy.payOrder(payOrderMethod, payOrderSig)
    ).to.be.revertedWithCustomError(
      orderSigProxy,
      "OrderPendingOrAcceptedRequired"
    );
  });
});
