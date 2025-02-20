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

describe("Complete OrderSig", function () {
  it("Buy[Create, Pay, Release]", async function () {
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

    const releaseOrderMethod: OrderMethodPayload = makeOrderMethod(
      orderHash,
      OrderMethod.release
    );
    const releaseOrderSig = await signOrderMethod(
      kofiMerchant,
      releaseOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.releaseOrder(releaseOrderMethod, releaseOrderSig)
    )
      .to.emit(usdt, "Transfer")
      .withArgs(await orderSigProxy.getAddress(), amaTrader.address, anyValue);
  });

  it("Sell[Create, Pay, Release]", async function () {
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
      OrderType.sell,
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

    await usdt.connect(amaTrader).approve(sigchainAddress, oneGrand);

    await expect(orderSigProxy.createOrder(order, traderSig, merchantSig))
      .to.emit(usdt, "Transfer")
      .withArgs(amaTrader.address, await orderSigProxy.getAddress(), oneGrand);

    const payOrderMethod: OrderMethodPayload = makeOrderMethod(
      orderHash,
      OrderMethod.pay
    );
    const payOrderSig = await signOrderMethod(
      kofiMerchant,
      payOrderMethod,
      domain
    );

    await expect(orderSigProxy.payOrder(payOrderMethod, payOrderSig))
      .to.emit(orderSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    const releaseOrderMethod: OrderMethodPayload = makeOrderMethod(
      orderHash,
      OrderMethod.release
    );
    const releaseOrderSig = await signOrderMethod(
      amaTrader,
      releaseOrderMethod,
      domain
    );

    await expect(
      orderSigProxy.releaseOrder(releaseOrderMethod, releaseOrderSig)
    )
      .to.emit(usdt, "Transfer")
      .withArgs(
        await orderSigProxy.getAddress(),
        kofiMerchant.address,
        anyValue
      );
  });

  it("Buy[Reverts for Create]", async function () {
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
      viewProxy,
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

    //create Buy order without merchant sig: orderState = pending
    await expect(orderSigProxy.createOrder(order, traderSig, "0x")).to.not.be
      .reverted;

    //console.log("Order hash", await viewProxy.order(orderHash));
    const [
      trader,
      merchant,
      traderChain,
      merchantChain,
      token,
      oCurrency,
      oPaymentMethod,
      orderType,
      orderState,
      quantity,
      deadline,
      createdAt,
    ] = await viewProxy.order(orderHash);

    //orderState = pending; 0
    expect(orderState).to.equal(OrderState.pending);

    //revert for invalid trader
    const brokieSig = await signOrder(yaaBrokie, order, domain);
    await expect(
      orderSigProxy.createOrder(order, brokieSig, "0x")
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidSigner");

    //revert for invalid merchant
    await expect(
      orderSigProxy.createOrder(order, traderSig, brokieSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidSigner");

    //revert for invalid traderSig
    await expect(
      orderSigProxy.createOrder(order, "0x", merchantSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidSignature");
  });

  it("Buy[Reverts for Accept]", async function () {
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

    await expect(orderSigProxy.createOrder(order, traderSig, "0x")).to.not.be
      .reverted;

    const acceptOrderMethod: OrderMethodPayload = makeOrderMethod(
      orderHash,
      OrderMethod.accept
    );
    const merchantSigForAccept = await signOrderMethod(
      kofiMerchant,
      acceptOrderMethod,
      domain
    );

    //revert for invalid accept Sig
    await expect(
      (orderSigProxy.connect(kofiMerchant) as any).acceptOrder(
        acceptOrderMethod,
        traderSig
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "MustBeMerchant");

    //revert for expired sig
    const expiryOrderMethod: OrderMethodPayload = makeOrderMethod(
      orderHash,
      OrderMethod.accept
    );
    expiryOrderMethod.expiry = BigInt(Math.floor(Date.now() / 1000) - 60 * 15);

    const expiredMerchantSigForAccept = await signOrderMethod(
      kofiMerchant,
      expiryOrderMethod,
      domain
    );
    console.log("expiry: ", expiryOrderMethod.expiry);

    await expect(
      (orderSigProxy.connect(kofiMerchant) as any).acceptOrder(
        expiryOrderMethod,
        expiredMerchantSigForAccept
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "SignatureExpired");

    //revert for invalid accept Sig
    await expect(
      (orderSigProxy.connect(kofiMerchant) as any).acceptOrder(
        acceptOrderMethod,
        traderSig
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "MustBeMerchant");

    //revert for invalid method
    const invalidOrderMethod: OrderMethodPayload = makeOrderMethod(
      orderHash,
      OrderMethod.release
    );

    const invalidMerchantSigForAccept = await signOrderMethod(
      kofiMerchant,
      invalidOrderMethod,
      domain
    );
    console.log("expiry: ", expiryOrderMethod.expiry);

    await expect(
      (orderSigProxy.connect(kofiMerchant) as any).acceptOrder(
        invalidOrderMethod,
        invalidMerchantSigForAccept
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidOrderMethodCall");

    //pass acceptOrder
    await expect(
      (orderSigProxy.connect(kofiMerchant) as any).acceptOrder(
        acceptOrderMethod,
        merchantSigForAccept
      )
    ).to.not.be.reverted;

    console.log("New order status: ", await viewProxy.order(orderHash));
  });
});
