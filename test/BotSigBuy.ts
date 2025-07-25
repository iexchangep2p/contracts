import { OrderBotSigInterface } from './../typechain-types/contracts/modules/OrderBotSig';
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { toUtf8Bytes } from "ethers";
import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { deployIExchange } from "./IExchangeDeployFixture";
import {
  AppealDecision,
  computeOrderFee,
  createOrderTypedDataHash,
  encodedCreateOrder,
  iexDomain,
  iexDomainHash,
  makeOrder,
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

describe("Bots: Create OrderBot", function () {
  it("Buy[Create Order Bot]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      iExchangeP2P,
      orderBotSigProxy,
      bot1,
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
    const botSigchainAddress = await orderBotSigProxy.getAddress();
    const domain = iexDomain(sigchain, botSigchainAddress);

    const domainHash = iexDomainHash(domain);

    const sigchainDomainHash = await iExchangeP2P.domainSeparator();
    expect(domainHash).to.equal(sigchainDomainHash);
    const traderSig = await signOrder(amaTrader, order, domain);
    //merchant's bot
    const bot1Sig = await signOrder(bot1, order, domain);

    const traderAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      traderSig
    );
    expect(amaTrader.address).to.equal(traderAddress);

    const bot1Address = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      bot1Sig
    );
    expect(bot1.address).to.equal(bot1Address);

    await usdt.connect(kofiMerchant).approve(botSigchainAddress, oneGrand);
    //botSig = merchantSig
    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        bot1Sig
      )
    ).to.be.revertedWithCustomError(orderBotSigProxy, "NoBotSet");

    //kofiMerchant set bot1
    await expect(
      (orderBotSigProxy.connect(kofiMerchant) as any).setBot(
        await bot1.getAddress()
      )
    )
      .to.emit(orderBotSigProxy, "BotSet")
      .withArgs(kofiMerchant.address, bot1.address);

    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        bot1Sig
      )
    ).to.emit(orderBotSigProxy, "NewOrder");
  });

  it("Buy[Create Order Bot] - Revert SignatureExpired", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      iExchangeP2P,
      orderBotSigProxy,
      bot1,
    } = await loadFixture(deployIExchange);

    const orderExpired = sameChainOrder(
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
    //expired order
    orderExpired.expiry = BigInt(Math.floor(Date.now() / 1000) - 60 * 60);

    const sigchain = orderSigChain(orderExpired);
    const botSigchainAddress = await orderBotSigProxy.getAddress();
    const domain = iexDomain(sigchain, botSigchainAddress);

    const domainHash = iexDomainHash(domain);

    const sigchainDomainHash = await iExchangeP2P.domainSeparator();
    expect(domainHash).to.equal(sigchainDomainHash);
    const traderSig = await signOrder(amaTrader, orderExpired, domain);
    //merchant's bot
    const bot1Sig = await signOrder(bot1, orderExpired, domain);

    await usdt.connect(kofiMerchant).approve(botSigchainAddress, oneGrand);

    //kofiMerchant set bot1
    await expect(
      (orderBotSigProxy.connect(kofiMerchant) as any).setBot(
        await bot1.getAddress()
      )
    )
      .to.emit(orderBotSigProxy, "BotSet")
      .withArgs(kofiMerchant.address, bot1.address);

    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        orderExpired,
        traderSig,
        bot1Sig
      )
    ).to.revertedWithCustomError(orderBotSigProxy, "SignatureExpired");
  });

  it("Buy[Create Order Bot] - Revert invalid signer, invalid bot", async function () {
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
      iExchangeP2P,
      orderBotSigProxy,
      bot1,
      bot2,
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
    const botSigchainAddress = await orderBotSigProxy.getAddress();
    const domain = iexDomain(sigchain, botSigchainAddress);

    const domainHash = iexDomainHash(domain);

    const sigchainDomainHash = await iExchangeP2P.domainSeparator();
    expect(domainHash).to.equal(sigchainDomainHash);
    //invalid signer
    const invalidTaderSig = await signOrder(yaaBrokie, order, domain);

    //merchant's bot
    const bot1Sig = await signOrder(bot1, order, domain);
    await usdt.connect(kofiMerchant).approve(botSigchainAddress, oneGrand);

    //kofiMerchant set bot1
    await expect(
      (orderBotSigProxy.connect(kofiMerchant) as any).setBot(
        await bot1.getAddress()
      )
    )
      .to.emit(orderBotSigProxy, "BotSet")
      .withArgs(kofiMerchant.address, bot1.address);

    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        invalidTaderSig,
        bot1Sig
      )
    ).to.revertedWithCustomError(orderBotSigProxy, "InvalidSigner");

    const traderSig = await signOrder(amaTrader, order, domain);
    const invalidBotSig = await signOrder(bot2, order, domain);

    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        invalidBotSig
      )
    ).to.be.revertedWithCustomError(orderBotSigProxy, "InvalidBotSigner");
  });

  it("Buy[Trader Pays, Bot Confirm and Release Order]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      iExchangeP2P,
      orderBotSigProxy,
      bot1,
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
    const botSigchainAddress = await orderBotSigProxy.getAddress();
    const domain = iexDomain(sigchain, botSigchainAddress);

    const domainHash = iexDomainHash(domain);

    const sigchainDomainHash = await iExchangeP2P.domainSeparator();
    expect(domainHash).to.equal(sigchainDomainHash);
    const traderSig = await signOrder(amaTrader, order, domain);
    //merchant's bot
    const bot1Sig = await signOrder(bot1, order, domain);

    const traderAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      traderSig
    );
    expect(amaTrader.address).to.equal(traderAddress);

    const bot1Address = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      bot1Sig
    );
    expect(bot1.address).to.equal(bot1Address);

    await usdt.connect(kofiMerchant).approve(botSigchainAddress, oneGrand);
    //botSig = merchantSig
    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        bot1Sig
      )
    ).to.be.revertedWithCustomError(orderBotSigProxy, "NoBotSet");

    //kofiMerchant set bot1
    await expect(
      (orderBotSigProxy.connect(kofiMerchant) as any).setBot(
        await bot1.getAddress()
      )
    )
      .to.emit(orderBotSigProxy, "BotSet")
      .withArgs(kofiMerchant.address, bot1.address);

    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        bot1Sig
      )
    ).to.emit(orderBotSigProxy, "NewOrder");

    //Trader pays order (offchain)
    //bot confirms paid order for merchant
    const orderHash = createOrderTypedDataHash(order, domain);
    const confirmMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.confirm,
      expiry: Number(order.expiry),
    };
    const confirmOrderMethod: PreparedOrderMethod =
      makeOrderMethod(confirmMethodPayload);

    const botSigForConfirm = await signOrderMethod(
      bot1,
      confirmOrderMethod,
      domain
    );

    await expect(
      (orderBotSigProxy.connect(bot1) as any).confirmOrderBot(
        confirmOrderMethod,
        botSigForConfirm
      )
    )
      .to.emit(orderBotSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    //merchant bot releases order
    const releaseMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.release,
      expiry: Number(order.expiry),
    };
    const releaseOrderMethod: PreparedOrderMethod =
      makeOrderMethod(releaseMethodPayload);

    const botSigForRelease = await signOrderMethod(
      bot1,
      releaseOrderMethod,
      domain
    );

    //release
    const oldTraderBalance = await usdt.balanceOf(amaTrader.address);
    await expect(
      (orderBotSigProxy.connect(bot1) as any).releaseOrderBot(
        releaseOrderMethod,
        botSigForRelease
      )
    )
      .to.emit(orderBotSigProxy, "OrderReleased")
      .withArgs(orderHash, OrderState.released);
    const fees = computeOrderFee(oneGrand);
    expect(await usdt.balanceOf(amaTrader.address)).to.be.equal(
      oldTraderBalance + (oneGrand - fees)
    );
  });

  it("Buy[Trader Pays, Bot Confirm and Release Order - Reverts]", async function () {
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
      iExchangeP2P,
      orderBotSigProxy,
      bot1,
      bot2,
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
    const botSigchainAddress = await orderBotSigProxy.getAddress();
    const domain = iexDomain(sigchain, botSigchainAddress);

    const domainHash = iexDomainHash(domain);

    const sigchainDomainHash = await iExchangeP2P.domainSeparator();
    expect(domainHash).to.equal(sigchainDomainHash);
    const traderSig = await signOrder(amaTrader, order, domain);
    //merchant's bot
    const bot1Sig = await signOrder(bot1, order, domain);

    const traderAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      traderSig
    );
    expect(amaTrader.address).to.equal(traderAddress);

    const bot1Address = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      bot1Sig
    );
    expect(bot1.address).to.equal(bot1Address);

    await usdt.connect(kofiMerchant).approve(botSigchainAddress, oneGrand);
    //botSig = merchantSig
    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        bot1Sig
      )
    ).to.be.revertedWithCustomError(orderBotSigProxy, "NoBotSet");

    //kofiMerchant set bot1
    await expect(
      (orderBotSigProxy.connect(kofiMerchant) as any).setBot(
        await bot1.getAddress()
      )
    )
      .to.emit(orderBotSigProxy, "BotSet")
      .withArgs(kofiMerchant.address, bot1.address);

    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        bot1Sig
      )
    ).to.emit(orderBotSigProxy, "NewOrder");

    //Trader pays order (offchain)
    //bot confirms paid order for merchant
    const orderHash = createOrderTypedDataHash(order, domain);
    const confirmMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.confirm,
      expiry: Number(order.expiry),
    };
    const confirmOrderMethod: PreparedOrderMethod =
      makeOrderMethod(confirmMethodPayload);

    const botSigForConfirm = await signOrderMethod(
      bot1,
      confirmOrderMethod,
      domain
    );
    //revert invalid bot signer
    const invalidBotSigForConfirm = await signOrderMethod(
      bot2,
      confirmOrderMethod,
      domain
    );

    await expect(
      (orderBotSigProxy.connect(bot1) as any).confirmOrderBot(
        confirmOrderMethod,
        invalidBotSigForConfirm
      )
    ).to.be.revertedWithCustomError(orderBotSigProxy, "InvalidBotSigner");

    //revert invalid OrderMethod
    const invalidConfirmMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.appeal,
      expiry: Number(order.expiry),
    };
    const invalidConfirmOrderMethod: PreparedOrderMethod = makeOrderMethod(
      invalidConfirmMethodPayload
    );

    await expect(
      (orderBotSigProxy.connect(bot1) as any).confirmOrderBot(
        invalidConfirmOrderMethod,
        botSigForConfirm
      )
    ).to.be.revertedWithCustomError(orderBotSigProxy, "InvalidOrderMethodCall");

    //pass confirm
    await expect(
      (orderBotSigProxy.connect(bot1) as any).confirmOrderBot(
        confirmOrderMethod,
        botSigForConfirm
      )
    )
      .to.emit(orderBotSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    //revert OrderAcceptedRequired
    await expect(
      (orderBotSigProxy.connect(bot1) as any).confirmOrderBot(
        confirmOrderMethod,
        botSigForConfirm
      )
    ).to.be.revertedWithCustomError(orderBotSigProxy, "OrderAcceptedRequired");
  });

  it("Buy[Appeal Order, Cancel Appeal]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      iExchangeP2P,
      orderBotSigProxy,
      bot1,
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
    const botSigchainAddress = await orderBotSigProxy.getAddress();
    const domain = iexDomain(sigchain, botSigchainAddress);

    const domainHash = iexDomainHash(domain);

    const sigchainDomainHash = await iExchangeP2P.domainSeparator();
    expect(domainHash).to.equal(sigchainDomainHash);
    const traderSig = await signOrder(amaTrader, order, domain);
    //merchant's bot
    const bot1Sig = await signOrder(bot1, order, domain);

    const traderAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      traderSig
    );
    expect(amaTrader.address).to.equal(traderAddress);

    const bot1Address = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      bot1Sig
    );
    expect(bot1.address).to.equal(bot1Address);

    await usdt.connect(kofiMerchant).approve(botSigchainAddress, oneGrand);
    //botSig = merchantSig
    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        bot1Sig
      )
    ).to.be.revertedWithCustomError(orderBotSigProxy, "NoBotSet");

    //kofiMerchant set bot1
    await expect(
      (orderBotSigProxy.connect(kofiMerchant) as any).setBot(
        await bot1.getAddress()
      )
    )
      .to.emit(orderBotSigProxy, "BotSet")
      .withArgs(kofiMerchant.address, bot1.address);

    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        bot1Sig
      )
    ).to.emit(orderBotSigProxy, "NewOrder");

    //Trader pays order (offchain)
    //bot confirms paid order for merchant
    const orderHash = createOrderTypedDataHash(order, domain);
    const confirmMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.confirm,
      expiry: Number(order.expiry),
    };
    const confirmOrderMethod: PreparedOrderMethod =
      makeOrderMethod(confirmMethodPayload);

    const botSigForConfirm = await signOrderMethod(
      bot1,
      confirmOrderMethod,
      domain
    );

    await expect(
      (orderBotSigProxy.connect(bot1) as any).confirmOrderBot(
        confirmOrderMethod,
        botSigForConfirm
      )
    )
      .to.emit(orderBotSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    //merchant appeals
    const appealMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.appeal,
      expiry: Number(order.expiry),
    };
    const appealOrderMethod: PreparedOrderMethod =
      makeOrderMethod(appealMethodPayload);
    const botSigForAppeal = signOrderMethod(bot1, appealOrderMethod, domain);

    await expect(
      (orderBotSigProxy.connect(bot1) as any).appealOrderBot(
        appealOrderMethod,
        botSigForAppeal
      )
    )
      .to.emit(orderBotSigProxy, "OrderAppealed")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        AppealDecision.unvoted,
        OrderState.appealed,
        anyValue
      );

    //cancel appeal
    const cancelAppealMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.cancelAppeal,
      expiry: Number(order.expiry),
    };
    const cancelAppealOrderMethod: PreparedOrderMethod = makeOrderMethod(
      cancelAppealMethodPayload
    );
    const botSigForCancelAppeal = signOrderMethod(
      bot1,
      cancelAppealOrderMethod,
      domain
    );

    await expect(
      (orderBotSigProxy.connect(bot1) as any).cancelAppealBot(
        cancelAppealOrderMethod,
        botSigForCancelAppeal
      )
    )
      .to.emit(orderBotSigProxy, "AppealCancelled")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        AppealDecision.unvoted,
        OrderState.paid,
        anyValue
      );

    //merchant bot releases order
    const releaseMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.release,
      expiry: Number(order.expiry),
    };
    const releaseOrderMethod: PreparedOrderMethod =
      makeOrderMethod(releaseMethodPayload);

    const botSigForRelease = await signOrderMethod(
      bot1,
      releaseOrderMethod,
      domain
    );

    //release
    const oldTraderBalance = await usdt.balanceOf(amaTrader.address);
    await expect(
      (orderBotSigProxy.connect(bot1) as any).releaseOrderBot(
        releaseOrderMethod,
        botSigForRelease
      )
    )
      .to.emit(orderBotSigProxy, "OrderReleased")
      .withArgs(orderHash, OrderState.released);
    const fees = computeOrderFee(oneGrand);
    expect(await usdt.balanceOf(amaTrader.address)).to.be.equal(
      oldTraderBalance + (oneGrand - fees)
    );
  });

  it("Buy[Cancel OrderBot]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      iExchangeP2P,
      orderBotSigProxy,
      bot1,
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
    const botSigchainAddress = await orderBotSigProxy.getAddress();
    const domain = iexDomain(sigchain, botSigchainAddress);

    const domainHash = iexDomainHash(domain);

    const sigchainDomainHash = await iExchangeP2P.domainSeparator();
    expect(domainHash).to.equal(sigchainDomainHash);
    const traderSig = await signOrder(amaTrader, order, domain);
    //merchant's bot
    const bot1Sig = await signOrder(bot1, order, domain);

    const traderAddress = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      traderSig
    );
    expect(amaTrader.address).to.equal(traderAddress);

    const bot1Address = ethers.verifyTypedData(
      domain,
      encodedCreateOrder().types,
      order,
      bot1Sig
    );
    expect(bot1.address).to.equal(bot1Address);

    await usdt.connect(kofiMerchant).approve(botSigchainAddress, oneGrand);
    //botSig = merchantSig
    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        bot1Sig
      )
    ).to.be.revertedWithCustomError(orderBotSigProxy, "NoBotSet");

    //kofiMerchant set bot1
    await expect(
      (orderBotSigProxy.connect(kofiMerchant) as any).setBot(
        await bot1.getAddress()
      )
    )
      .to.emit(orderBotSigProxy, "BotSet")
      .withArgs(kofiMerchant.address, bot1.address);

    await expect(
      (orderBotSigProxy.connect(bot1) as any).createOrderBot(
        order,
        traderSig,
        bot1Sig
      )
    ).to.emit(orderBotSigProxy, "NewOrder");

    //Buy Order: cancelBeforeDeadline -> only trader
    //revert for MustBeTrader
    const orderHash = createOrderTypedDataHash(order, domain);
    const cancelMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.cancel,
      expiry: Number(order.expiry),
    };
    const cancelOrderMethod: PreparedOrderMethod =
      makeOrderMethod(cancelMethodPayload);
    const botSigForCancel = signOrderMethod(bot1, cancelOrderMethod, domain);
    await expect(
      (orderBotSigProxy.connect(bot1) as any).cancelOrderBot(
        cancelOrderMethod,
        botSigForCancel
      )
    ).to.be.revertedWithCustomError(orderBotSigProxy, "MustBeTrader");
    
    //cancelAfterDeadline
    await time.increaseTo(Number(order.expiry) + 3600);
    //new sig
    cancelOrderMethod.expiry = BigInt(Number(order.expiry) + 3605);
    const botSigForCancelAfterDeadline = signOrderMethod(bot1, cancelOrderMethod, domain);
    await expect(
      (orderBotSigProxy.connect(bot1) as any).cancelOrderBot(
        cancelOrderMethod,
        botSigForCancelAfterDeadline
      )
    ).to.emit(orderBotSigProxy, "OrderCancelled").withArgs(orderHash, OrderState.cancelled);

    //remove merchant bot
    await expect(
      (orderBotSigProxy.connect(kofiMerchant) as any).removeBot()
    ).to.emit(orderBotSigProxy, "BotRemoved").withArgs(kofiMerchant.address, bot1.address);
  });
});
