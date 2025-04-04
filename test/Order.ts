import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { deployIExchange } from "./IExchangeDeployFixture";
import {
  createOrderTypedDataHash,
  encodedCreateOrder,
  iexDomain,
  iexDomainHash,
  orderSigChain,
  OrderState,
  OrderType,
  sameChainOrder,
  signOrder,
} from "../client";
import { inits } from "../typechain-types/contracts";

describe("Order", function () {
  it("[Create Order, Revert for Create Order]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderProxy,
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
    //passing createOrder
    await expect((orderProxy.connect(amaTrader) as any).createOrder(order)).to
      .not.be.reverted;

    //revert for InvalidSigner
    await expect(
      (orderProxy.connect(kofiMerchant) as any).createOrder(order)
    ).to.be.revertedWithCustomError(orderProxy, "InvalidSigner");

    //revert for zeroAddress
    const zeroMerchantAddressOrder = { ...order, merchant: ethers.ZeroAddress };
    await expect(
      (orderProxy.connect(amaTrader) as any).createOrder(
        zeroMerchantAddressOrder
      )
    ).to.be.revertedWithCustomError(orderProxy, "ZeroAddress");

    //revert for InvalidQuantity
    const invalidQuantityOrder = { ...order, quantity: BigInt(0) };
    await expect(
      (orderProxy.connect(amaTrader) as any).createOrder(invalidQuantityOrder)
    ).to.be.revertedWithCustomError(orderProxy, "InvalidQuantity");

    //revert for InvalidChainId - Trader
    const invalidTraderChainIdOrder = { ...order, traderChain: 0n };
    await expect(
      (orderProxy.connect(amaTrader) as any).createOrder(
        invalidTraderChainIdOrder
      )
    ).to.be.revertedWithCustomError(orderProxy, "InvalidChainId");

    //revert for InvalidChainId - Merchant
    const invalidMerchantChainIdOrder = { ...order, merchantChain: 0n };
    await expect(
      (orderProxy.connect(amaTrader) as any).createOrder(
        invalidMerchantChainIdOrder
      )
    ).to.be.revertedWithCustomError(orderProxy, "InvalidChainId");

    //revert for OrderExpired
    const expiredOrder = {
      ...order,
      expiry: BigInt(Math.floor(Date.now() / 1000) - 60 * 15),
    };
    await expect(
      (orderProxy.connect(amaTrader) as any).createOrder(expiredOrder)
    ).to.be.revertedWithCustomError(orderProxy, "OrderExpired");

    //revert for OrderExists
    await expect(
      (orderProxy.connect(amaTrader) as any).createOrder(order)
    ).to.be.revertedWithCustomError(orderProxy, "OrderExists");

    //revert for InvalidTradeToken
    const invalidTradeTokenOrder = {
      ...order,
      token: ethers.Wallet.createRandom().address,
    };
    await expect(
      (orderProxy.connect(amaTrader) as any).createOrder(invalidTradeTokenOrder)
    ).to.be.revertedWithCustomError(orderProxy, "InvalidTradeToken");

    //revert for InvalidDuration
    const invalidDurationOrder = { ...order, duration: 0n };
    await expect(
      (orderProxy.connect(amaTrader) as any).createOrder(invalidDurationOrder)
    ).to.be.revertedWithCustomError(orderProxy, "InvalidDuration");
  });
  it("[Accept Order, Revert for Accept Order]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderProxy,
    } = await loadFixture(deployIExchange);

    //createOrder - AcceptOrder
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
    //passing createOrder
    await expect((orderProxy.connect(amaTrader) as any).createOrder(order)).to
      .not.be.reverted;

    const sigchain = orderSigChain(order);
    const sigchainAddress = await orderProxy.getAddress();
    const domain = iexDomain(sigchain, sigchainAddress);
    const orderHash = createOrderTypedDataHash(order, domain);
    await usdt.connect(kofiMerchant).approve(sigchainAddress, oneGrand);

    //revert for MustBeMerchant
    await expect(
      (orderProxy.connect(amaTrader) as any).acceptOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "MustBeMerchant");

    //pass acceptOrder
    await expect(
      (orderProxy.connect(kofiMerchant) as any).acceptOrder(orderHash)
    )
      .to.emit(orderProxy, "OrderAccepted")
      .withArgs(orderHash, OrderState.accepted);

    //revert OrderDoesNotExists
    const invalidOrder = {
      ...order,
      trader: await ethers.Wallet.createRandom().getAddress(),
    };
    const invalidOrderHash = createOrderTypedDataHash(invalidOrder, domain);
    await expect(
      (orderProxy.connect(kofiMerchant) as any).acceptOrder(invalidOrderHash)
    ).to.be.revertedWithCustomError(orderProxy, "OrderDoesNotExists");

    //revert for OrderPendingRequired
    await expect(
      (orderProxy.connect(amaTrader) as any).acceptOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "OrderPendingRequired");
  });
  it("[Pay Order, Revert for Pay Order]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderProxy,
    } = await loadFixture(deployIExchange);

    //createOrder - AcceptOrder
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
    //passing createOrder
    await expect((orderProxy.connect(amaTrader) as any).createOrder(order)).to
      .not.be.reverted;

    const sigchain = orderSigChain(order);
    const sigchainAddress = await orderProxy.getAddress();
    const domain = iexDomain(sigchain, sigchainAddress);
    const orderHash = createOrderTypedDataHash(order, domain);
    await usdt.connect(kofiMerchant).approve(sigchainAddress, oneGrand);

    //revert for OrderAcceptedRequired
    await expect(
      (orderProxy.connect(amaTrader) as any).payOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "OrderAcceptedRequired");

    //pass acceptOrder
    await expect(
      (orderProxy.connect(kofiMerchant) as any).acceptOrder(orderHash)
    )
      .to.emit(orderProxy, "OrderAccepted")
      .withArgs(orderHash, OrderState.accepted);

    //revert for MustBeTrader - OrderType.buy
    await expect(
      (orderProxy.connect(kofiMerchant) as any).payOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "MustBeTrader");

    //revert for OrderDoesNotExists
    const nonExistingOrder = {
      ...order,
      merchant: await ethers.Wallet.createRandom().getAddress(),
    };
    const nonExistingOrderHash = createOrderTypedDataHash(
      nonExistingOrder,
      domain
    );

    await expect(
      (orderProxy.connect(amaTrader) as any).payOrder(nonExistingOrderHash)
    ).to.be.revertedWithCustomError(orderProxy, "OrderDoesNotExists");

    //pass payOrder
    await expect((orderProxy.connect(amaTrader) as any).payOrder(orderHash))
      .to.emit(orderProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);
  });

  it("[Release Order, Revert for Release Order]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderProxy,
    } = await loadFixture(deployIExchange);

    //createOrder - AcceptOrder
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
    //passing createOrder
    await expect((orderProxy.connect(amaTrader) as any).createOrder(order)).to
      .not.be.reverted;

    const sigchain = orderSigChain(order);
    const sigchainAddress = await orderProxy.getAddress();
    const domain = iexDomain(sigchain, sigchainAddress);
    const orderHash = createOrderTypedDataHash(order, domain);
    await usdt.connect(kofiMerchant).approve(sigchainAddress, oneGrand);

    //pass acceptOrder
    await expect(
      (orderProxy.connect(kofiMerchant) as any).acceptOrder(orderHash)
    )
      .to.emit(orderProxy, "OrderAccepted")
      .withArgs(orderHash, OrderState.accepted);

    //revert for OrderPaidRequired
    await expect(
      (orderProxy.connect(kofiMerchant) as any).releaseOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "OrderPaidRequired");

    //pass payOrder
    await expect((orderProxy.connect(amaTrader) as any).payOrder(orderHash))
      .to.emit(orderProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    //revert for OrderDoesNotExists
    const nonExistingOrder = {
      ...order,
      trader: await ethers.Wallet.createRandom().getAddress(),
    };
    const nonExistentOrderHash = createOrderTypedDataHash(
      nonExistingOrder,
      domain
    );
    await expect(
      (orderProxy.connect(kofiMerchant) as any).releaseOrder(
        nonExistentOrderHash
      )
    ).to.be.revertedWithCustomError(orderProxy, "OrderDoesNotExists");

    //revert for MustBeMerchant
    await expect(
      (orderProxy.connect(amaTrader) as any).releaseOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "MustBeMerchant");

    //pass releaseOrder - Buy Order
    await expect(
      (orderProxy.connect(kofiMerchant) as any).releaseOrder(orderHash)
    )
      .to.emit(orderProxy, "OrderReleased")
      .withArgs(orderHash, OrderState.released);
  });

  it("[Cancel Order, Revert for Cancel Order]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderProxy,
    } = await loadFixture(deployIExchange);

    //createOrder - acceptOrder - cancelOrder
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
    //passing createOrder
    await expect((orderProxy.connect(amaTrader) as any).createOrder(order)).to
      .not.be.reverted;

    const sigchain = orderSigChain(order);
    const sigchainAddress = await orderProxy.getAddress();
    const domain = iexDomain(sigchain, sigchainAddress);
    const orderHash = createOrderTypedDataHash(order, domain);
    await usdt.connect(kofiMerchant).approve(sigchainAddress, oneGrand);

    //revert OrderAcceptedRequired - cancelBeforeDeadline
    await expect(
      (orderProxy.connect(amaTrader) as any).cancelOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "OrderAcceptedRequired");

    //pass acceptOrder
    await expect(
      (orderProxy.connect(kofiMerchant) as any).acceptOrder(orderHash)
    )
      .to.emit(orderProxy, "OrderAccepted")
      .withArgs(orderHash, OrderState.accepted);

    //revert for OrderDoesNotExists
    const nonExistingOrder = {
      ...order,
      trader: await ethers.Wallet.createRandom().getAddress(),
    };
    const nonExistentOrderHash = createOrderTypedDataHash(
      nonExistingOrder,
      domain
    );
    await expect(
      (orderProxy.connect(kofiMerchant) as any).cancelOrder(
        nonExistentOrderHash
      )
    ).to.be.revertedWithCustomError(orderProxy, "OrderDoesNotExists");

    //revert for MustBeTrader - cancelBeforeDeadline
    await expect(
      (orderProxy.connect(kofiMerchant) as any).cancelOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "MustBeTrader");

    const deadline = Math.floor(Date.now() / 1000) + 60 * 15;
    await time.increaseTo(deadline + 3600);

    //pass cancelOrder
    await expect((orderProxy.connect(amaTrader) as any).cancelOrder(orderHash))
      .to.emit(orderProxy, "OrderCancelled")
      .withArgs(orderHash, OrderState.cancelled);

    //revert for OrderPendingOrAcceptedRequired - cancelAfterDeadline
    await expect(
      (orderProxy.connect(amaTrader) as any).cancelOrder(orderHash)
    ).to.be.revertedWithCustomError(
      orderProxy,
      "OrderPendingOrAcceptedRequired"
    );
  });

  it("Sell Order[Create, Accept, Pay, Release, Reverts]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderProxy,
    } = await loadFixture(deployIExchange);

    //Sell: createOrder - AcceptOrder
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
    const sigchainAddress = await orderProxy.getAddress();
    const domain = iexDomain(sigchain, sigchainAddress);
    const orderHash = createOrderTypedDataHash(order, domain);
    await usdt.connect(amaTrader).approve(sigchainAddress, oneGrand);

    //passing createOrder
    await expect((orderProxy.connect(amaTrader) as any).createOrder(order)).to
      .not.be.reverted;

    //pass acceptOrder
    await expect(
      (orderProxy.connect(kofiMerchant) as any).acceptOrder(orderHash)
    )
      .to.emit(orderProxy, "OrderAccepted")
      .withArgs(orderHash, OrderState.accepted);

    //payOrder: revert for MustBeMerchant
    await expect(
      (orderProxy.connect(amaTrader) as any).payOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "MustBeMerchant");

    //pass payOrder
    await expect((orderProxy.connect(kofiMerchant) as any).payOrder(orderHash))
      .to.emit(orderProxy, "OrderPaid")
      .withArgs(orderHash, OrderState.paid);

    //payOrder: revert for OrderPendingOrAcceptedRequired
    await expect(
      (orderProxy.connect(kofiMerchant) as any).payOrder(orderHash)
    ).to.be.revertedWithCustomError(
      orderProxy,
      "OrderPendingOrAcceptedRequired"
    );

    //releaseOrder: revert for MustBeTrader
    await expect(
      (orderProxy.connect(kofiMerchant) as any).releaseOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "MustBeTrader");

    //pass releaseOrder
    await expect((orderProxy.connect(amaTrader) as any).releaseOrder(orderHash))
      .to.emit(orderProxy, "OrderReleased")
      .withArgs(orderHash, OrderState.released);
  });

  it("Sell Order[Cancel Order, Reverts for Cancel Order]", async function () {
    const {
      kofiMerchant,
      amaTrader,
      oneGrand,
      usdt,
      currency,
      paymentMethod,
      oneGrandNumber,
      chainId,
      orderProxy,
    } = await loadFixture(deployIExchange);

    //Sell: createOrder - AcceptOrder
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
    const sigchainAddress = await orderProxy.getAddress();
    const domain = iexDomain(sigchain, sigchainAddress);
    const orderHash = createOrderTypedDataHash(order, domain);
    await usdt.connect(amaTrader).approve(sigchainAddress, oneGrand);

    //passing createOrder
    await expect((orderProxy.connect(amaTrader) as any).createOrder(order)).to
      .not.be.reverted;

    //pass acceptOrder
    await expect(
      (orderProxy.connect(kofiMerchant) as any).acceptOrder(orderHash)
    )
      .to.emit(orderProxy, "OrderAccepted")
      .withArgs(orderHash, OrderState.accepted);

    //revert for MustBeMerchant
    await expect(
      (orderProxy.connect(amaTrader) as any).cancelOrder(orderHash)
    ).to.be.revertedWithCustomError(orderProxy, "MustBeMerchant");

  });
});
