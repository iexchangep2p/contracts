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

describe("Accept OrderSig", function () {
  it("Buy[Accept, Reverts for Accept]", async function () {
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

    await expect(
      (orderSigProxy.connect(kofiMerchant) as any).acceptOrder(
        invalidOrderMethod,
        invalidMerchantSigForAccept
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "InvalidOrderMethodCall");

    //_acceptOrder: revert for OrderDoesNotExist
    const nonExistentOrder = {...order};
    nonExistentOrder.quantity = 1n;

    const nonExistentOderHash = createOrderTypedDataHash(nonExistentOrder, domain);

    const nonExistentAcceptOrderMethod: OrderMethodPayload = makeOrderMethod(
      nonExistentOderHash,
      OrderMethod.accept
    );
    await expect(
      (orderSigProxy.connect(kofiMerchant) as any).acceptOrder(
        nonExistentAcceptOrderMethod,
        merchantSigForAccept
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "OrderDoesNotExists");

    //pass acceptOrder
    await expect(
      (orderSigProxy.connect(kofiMerchant) as any).acceptOrder(
        acceptOrderMethod,
        merchantSigForAccept
      )
    ).to.not.be.reverted;

    //_acceptOrder: revert OrderPendingRequired
    await expect(
      (orderSigProxy.connect(kofiMerchant) as any).acceptOrder(
        acceptOrderMethod,
        merchantSigForAccept
      )
    ).to.be.revertedWithCustomError(orderSigProxy, "OrderPendingRequired");
  });
});
