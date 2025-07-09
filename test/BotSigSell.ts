import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { deployIExchange } from "./IExchangeDeployFixture";
import {
  computeOrderFee,
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

describe("Bots: Create OrderBot", function () {
  it("Sell[Create Order Bot]", async function () {
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
      OrderType.sell,
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

    await usdt.connect(amaTrader).approve(botSigchainAddress, oneGrand);
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

  it("Sell[Merchant Bot Pays, Trader Confirm and Release Order]", async function () {
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
      orderSigProxy,
      bot1,
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

    await usdt.connect(amaTrader).approve(botSigchainAddress, oneGrand);
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

    //Merchant pays order
    //trader confirms paid order for merchant
    const orderHash = createOrderTypedDataHash(order, domain);
    const payMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.pay,
      expiry: Number(order.expiry),
    };
    const payOrderMethod: PreparedOrderMethod =
      makeOrderMethod(payMethodPayload);

    const botSigForPay = await signOrderMethod(
      bot1,
      payOrderMethod,
      domain
    );

    await expect(
      (orderBotSigProxy.connect(bot1) as any).payOrderBot(
        payOrderMethod,
        botSigForPay
      )
    )
      .to.emit(orderBotSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    //trader releases order
    const releaseMethodPayload: OrderMethodPayload = {
      orderHash,
      method: OrderMethod.release,
      expiry: Number(order.expiry),
    };
    const releaseOrderMethod: PreparedOrderMethod =
      makeOrderMethod(releaseMethodPayload);

    const traderSigForRelease = await signOrderMethod(
      amaTrader,
      releaseOrderMethod,
      domain
    );

    //trader release
    const oldMerchantBalance = await usdt.balanceOf(kofiMerchant.address);
    await expect(
      (orderSigProxy.connect(amaTrader) as any).releaseOrder(
        releaseOrderMethod,
        traderSigForRelease
      )
    )
      .to.emit(orderBotSigProxy, "OrderReleased")
      .withArgs(orderHash, OrderState.released);
    const fees = computeOrderFee(oneGrand);
    expect(await usdt.balanceOf(kofiMerchant.address)).to.be.equal(
      oldMerchantBalance + (oneGrand - fees)
    );
  });
});
