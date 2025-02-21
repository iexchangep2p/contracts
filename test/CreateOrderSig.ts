import { CreateOrder } from "./../client/types";
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

describe("Create Order - OrderSig", function () {
  it("Buy[Create Order]", async function () {
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
  });

  it("Buy[Reverts for Create Order]", async function () {
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
    const [, , , , , , , , orderState] = await viewProxy.order(orderHash);
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

    //revert for expired sig
    const expiredOrder = {
      ...order,
      expiry: BigInt(Math.floor(Date.now() / 1000) - 60 * 15),
    };
    const expiredTraderSig = await signOrder(amaTrader, expiredOrder, domain);
    const expiredMerchantSig = await signOrder(
      kofiMerchant,
      expiredOrder,
      domain
    );

    await expect(
      orderSigProxy.createOrder(
        expiredOrder,
        expiredTraderSig,
        expiredMerchantSig
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "SignatureExpired");
  });

  it("Buy[Create Order - Library Reverts]", async function () {
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

    //revert for zeroAddress: INVALID, CANNOT GENERATE ZERO SIG
    //revert for invalid quantity
    const invalidQuantityOrder = { ...order, quantity: BigInt(0) };
    //sign
    const invalidTraderSig = await signOrder(
      amaTrader,
      invalidQuantityOrder,
      domain
    );
    const invalidMerchantSig = await signOrder(
      kofiMerchant,
      invalidQuantityOrder,
      domain
    );

    await expect(
      orderSigProxy.createOrder(
        invalidQuantityOrder,
        invalidTraderSig,
        invalidMerchantSig
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidQuantity");

    //revert invalid chainId
    const invalidChainIdOrder = { ...order, traderChain: 0n };

    const invalidChainIdTraderSig = await signOrder(
      amaTrader,
      invalidChainIdOrder,
      domain
    );
    const invalidChainIdMerchantSig = await signOrder(
      kofiMerchant,
      invalidChainIdOrder,
      domain
    );

    await expect(
      orderSigProxy.createOrder(
        invalidChainIdOrder,
        invalidChainIdTraderSig,
        invalidChainIdMerchantSig
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidChainId");

    //revert for unsupported currency
    const unsupportedCurrencyOrder = {
      ...order,
      currency: ethers.keccak256(ethers.toUtf8Bytes("USD")),
    };
    const unsupportedCurrencyTraderSig = await signOrder(amaTrader, unsupportedCurrencyOrder, domain);
    const unsupportedCurrencyMerchantSig = await signOrder(kofiMerchant, unsupportedCurrencyOrder, domain);

    await expect(
      orderSigProxy.createOrder(
        unsupportedCurrencyOrder,
        unsupportedCurrencyTraderSig,
        unsupportedCurrencyMerchantSig
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "UnsupportedCurrency");

    //pass createOrder
    await expect(orderSigProxy.createOrder(order, traderSig, merchantSig))
      .to.emit(usdt, "Transfer")
      .withArgs(
        kofiMerchant.address,
        await orderSigProxy.getAddress(),
        oneGrand
      );

    //revert for order exists
    await expect(
      orderSigProxy.createOrder(order, traderSig, merchantSig)
    ).to.be.revertedWithCustomError(orderSigProxy, "OrderExists");
  });
});
