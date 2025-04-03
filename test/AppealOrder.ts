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
  sameChainOrder,
  signOrder,
  AppealDecision,
  signOrderMethod,
  PreparedOrderMethod,
} from "../client";

describe("Appeal Order - Appeal", function () {
  it("Should [Appeal]", async function () {
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
      appealProxy,
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

    //Passing appeal order
    await expect(
      (appealProxy.connect(kofiMerchant) as any).appealOrder(orderHash)
    )
      .to.emit(orderSigProxy, "OrderAppealed")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        AppealDecision.unvoted,
        OrderState.appealed,
        anyValue
      );
    const [appealsHash] = await viewProxy.appeal(orderHash);
    expect(appealsHash).to.equal(orderHash);
  });
  it("Should [Reverts for Appeal]", async function () {
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
      appealProxy,
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
    //revert for OrderPaidRequired
    await expect(
      (appealProxy.connect(kofiMerchant) as any).appealOrder(orderHash)
    ).to.be.revertedWithCustomError(appealProxy, "OrderPaidRequired");

    await expect(orderSigProxy.payOrder(payOrderMethod, payOrderSig))
      .to.emit(orderSigProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    //revert for OrderDoesNotExists
    const nonExistentOrderHash = ethers.ZeroHash;
    await expect(
      (appealProxy.connect(kofiMerchant) as any).appealOrder(
        nonExistentOrderHash
      )
    ).to.be.revertedWithCustomError(appealProxy, "OrderDoesNotExists");

    //revert for MustBeMerchantOrTrader
    await expect(
      (appealProxy.connect(yaaBrokie) as any).appealOrder(orderHash)
    ).to.be.revertedWithCustomError(appealProxy, "MustBeMerchantOrTrader");
    //Passing appeal order
    await expect(
      (appealProxy.connect(kofiMerchant) as any).appealOrder(orderHash)
    )
      .to.emit(orderSigProxy, "OrderAppealed")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        AppealDecision.unvoted,
        OrderState.appealed,
        anyValue
      );
    const [appealsHash] = await viewProxy.appeal(orderHash);
    expect(appealsHash).to.equal(orderHash);

    //revert for AppealExists
    await expect(
      (appealProxy.connect(kofiMerchant) as any).appealOrder(orderHash)
    ).to.be.revertedWithCustomError(appealProxy, "AppealExists");
  });

  it("Should [Settle Appeal]", async function () {
    const {
      owner,
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderSigProxy,
      appealProxy,
      viewProxy,
      iExchangeP2P,
    } = await loadFixture(deployIExchange);

    //createOrder → acceptOrder → payOrder → appealOrder - settleAppeal

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

    //Passing appeal order
    await expect(
      (appealProxy.connect(kofiMerchant) as any).appealOrder(orderHash)
    )
      .to.emit(orderSigProxy, "OrderAppealed")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        AppealDecision.unvoted,
        OrderState.appealed,
        anyValue
      );
    const [appealsHash] = await viewProxy.appeal(orderHash);
    expect(appealsHash).to.equal(orderHash);

    //settleAppeal
    await expect(appealProxy.settleAppeal(orderHash, AppealDecision.release))
      .to.emit(appealProxy, "AppealSettled")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        owner.address,
        AppealDecision.release,
        OrderState.released,
        anyValue
      );
  });
  it("Should [Reverts for Settle Appeal]", async function () {
    const {
      owner,
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderSigProxy,
      appealProxy,
      viewProxy,
      iExchangeP2P,
    } = await loadFixture(deployIExchange);

    //createOrder → acceptOrder → payOrder → appealOrder - settleAppeal

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

    // revert for OrderAppealedRequired
    await expect(
      appealProxy.settleAppeal(orderHash, AppealDecision.release)
    ).to.be.revertedWithCustomError(appealProxy, "OrderAppealedRequired");

    //Passing appeal order
    await expect(
      (appealProxy.connect(kofiMerchant) as any).appealOrder(orderHash)
    )
      .to.emit(orderSigProxy, "OrderAppealed")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        AppealDecision.unvoted,
        OrderState.appealed,
        anyValue
      );
    const [appealsHash] = await viewProxy.appeal(orderHash);
    expect(appealsHash).to.equal(orderHash);

    //revert for InvalidAppealDecision
    await expect(
      appealProxy.settleAppeal(orderHash, AppealDecision.unvoted)
    ).to.be.revertedWithCustomError(appealProxy, "InvalidAppealDecision");

    //revert for non-existent order
    const nonExistentOrderHash = ethers.ZeroHash;
    await expect(
      appealProxy.settleAppeal(nonExistentOrderHash, AppealDecision.release)
    ).to.be.revertedWithCustomError(appealProxy, "OrderDoesNotExists");

    //settleAppeal
    await expect(appealProxy.settleAppeal(orderHash, AppealDecision.release))
      .to.emit(appealProxy, "AppealSettled")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        owner.address,
        AppealDecision.release,
        OrderState.released,
        anyValue
      );
  });

  it("Should [Cancel Appeal]", async function () {
    const {
      owner,
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderSigProxy,
      appealProxy,
      viewProxy,
      iExchangeP2P,
    } = await loadFixture(deployIExchange);

    //createOrder → acceptOrder → payOrder → appealOrder - cancelAppeal

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

    //Passing appeal order
    await expect(
      (appealProxy.connect(kofiMerchant) as any).appealOrder(orderHash)
    )
      .to.emit(orderSigProxy, "OrderAppealed")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        AppealDecision.unvoted,
        OrderState.appealed,
        anyValue
      );
    const [appealsHash] = await viewProxy.appeal(orderHash);
    expect(appealsHash).to.equal(orderHash);

    //cancelAppeal
    await expect(
      (appealProxy.connect(kofiMerchant) as any).cancelAppeal(orderHash)
    )
      .to.emit(appealProxy, "AppealCancelled")
      .withArgs(
        orderHash,
        kofiMerchant.address,
        AppealDecision.unvoted,
        OrderState.paid,
        anyValue
      );
  });
});
