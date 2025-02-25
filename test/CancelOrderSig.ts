import {
  loadFixture,
  setBalance,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
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
  AppealDecision,
  signOrderMethod,
  PreparedOrderMethod,
} from "../client";

describe("Cancel - OrderSig", function () {
  it("Should[Cancel]", async function () {
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

    //createOrder → acceptOrder → cancel

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

    //passing canceled
    const cancelMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.cancel,
      expiry,
    };

    const cancelOrderMethod: PreparedOrderMethod =
      makeOrderMethod(cancelMethodPayload);
    const cancelOrderSig = await signOrderMethod(
      amaTrader,
      cancelOrderMethod,
      domain
    );

    await expect(orderSigProxy.cancelOrder(cancelOrderMethod, cancelOrderSig))
      .to.emit(orderSigProxy, "OrderCancelled")
      .withArgs(orderHash, OrderState.cancelled);
  });
  it("Buy - Should[Reverts for Cancel]", async function () {
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

    //createOrder → acceptOrder → cancel
    //Buy -> Trader cancel
    //Sell -> Merchant cancel

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

    //Cancel method
    const cancelMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.cancel,
      expiry,
    };

    const cancelOrderMethod: PreparedOrderMethod =
      makeOrderMethod(cancelMethodPayload);
    const cancelOrderSig = await signOrderMethod(
      amaTrader,
      cancelOrderMethod,
      domain
    );
    //revert for expired sig
    const newExpiry = Math.floor(Date.now() / 1000) - 60 * 15;

    const expiryCancelMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.cancel,
      expiry: newExpiry,
    };
    const expiryCancelOrderMethod: PreparedOrderMethod = makeOrderMethod(
      expiryCancelMethodPayload
    );
    const expiredMerchantSigForCancel = await signOrderMethod(
      kofiMerchant,
      expiryCancelOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.cancelOrder(
        expiryCancelOrderMethod,
        expiredMerchantSigForCancel
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "SignatureExpired");

    //revert for invalid sig
    await expect(
      orderSigProxy.cancelOrder(cancelMethodPayload, "0x")
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidSignature");

    //revert for invalid method
    const invalidCancelMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.release,
      expiry,
    };
    const invalidCancelOrderMethod: PreparedOrderMethod = makeOrderMethod(
      invalidCancelMethodPayload
    );

    await expect(
      orderSigProxy.cancelOrder(invalidCancelOrderMethod, cancelOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidOrderMethodCall");

    //revert for OrderDoesNotExists
    const nonExistentOrder = { ...order, trader: yaaBrokie.address };
    const nonExistentOrderHash = createOrderTypedDataHash(
      nonExistentOrder,
      domain
    );

    const nonExistentMethodPayload: OrderMethodPayload = {
      orderHash: nonExistentOrderHash,
      method: OrderMethod.cancel,
      expiry,
    };
    const nonExistentOrderMethod: PreparedOrderMethod = makeOrderMethod(
      nonExistentMethodPayload
    );
    const nonExistentOrderSig = await signOrderMethod(
      amaTrader,
      nonExistentOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.cancelOrder(nonExistentOrderMethod, nonExistentOrderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "OrderDoesNotExists");

    //revert for MustBeTrader
    const notTraderSig = await signOrderMethod(
      kofiMerchant,
      cancelOrderMethod,
      domain
    );
    await expect(
      orderSigProxy.cancelOrder(cancelOrderMethod, notTraderSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "MustBeTrader");

    //Buy -> Trader cancel, send tokens back to merchant
    const merchantBalanceBefore = await usdt.balanceOf(kofiMerchant.address);

    //passing cancelOrder
    await expect(orderSigProxy.cancelOrder(cancelOrderMethod, cancelOrderSig))
      .to.emit(orderSigProxy, "OrderCancelled")
      .withArgs(orderHash, OrderState.cancelled);

    //check merchant usdt balance after()
    const merchantBalanceAfter = await usdt.balanceOf(kofiMerchant.address);
    expect(merchantBalanceAfter).to.equal(merchantBalanceBefore + oneGrand);
  });

  it("Sell - Should[Cancel, Reverts for Cancel]", async function () {
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

    //createOrder → acceptOrder → cancel

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

    //revert for MustBeMerchant
    const notMerchantCancelMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.cancel,
      expiry,
    };

    const notMerchantCancelOrderMethod: PreparedOrderMethod = makeOrderMethod(
      notMerchantCancelMethodPayload
    );
    const notMerchantCancelOrderSig = await signOrderMethod(
      amaTrader,
      notMerchantCancelOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.cancelOrder(
        notMerchantCancelOrderMethod,
        notMerchantCancelOrderSig
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "MustBeMerchant");

    //passing canceled
    const cancelMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.cancel,
      expiry,
    };

    const cancelOrderMethod: PreparedOrderMethod =
      makeOrderMethod(cancelMethodPayload);
    const cancelOrderSig = await signOrderMethod(
      kofiMerchant,
      cancelOrderMethod,
      domain
    );

    //check balances Sell -> Merchant cancel, send tokens back to Trader
    const traderBalanceBefore = await usdt.balanceOf(amaTrader.address);

    await expect(orderSigProxy.cancelOrder(cancelOrderMethod, cancelOrderSig))
      .to.emit(orderSigProxy, "OrderCancelled")
      .withArgs(orderHash, OrderState.cancelled);

    const traderBalanceAfter = await usdt.balanceOf(amaTrader.address);
    expect(traderBalanceAfter).to.equal(traderBalanceBefore + oneGrand);
  });
});
