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

describe("Exchange Manager", function () {
  it("Should [addTradeToken, Reverts for addTradeToken ]", async function () {
    const {
      owner,
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
      managerProxy,
      viewProxy,
      iExchangeP2P,
    } = await loadFixture(deployIExchange);

    //add trade token
    const mockToken = ethers.Wallet.createRandom().address;
    const orderFee = BigInt(100);
    const crossChainSender = ethers.Wallet.createRandom().address;

    //revert TradeTokenExists
    const existingToken = await usdt.getAddress();
    await expect(
      managerProxy.addTradeToken(existingToken, crossChainSender, orderFee)
    ).to.be.revertedWithCustomError(managerProxy, "TradeTokenExists");

    //revert for onlyExchangeManager
    const invalidCaller = yaaBrokie.address.toLowerCase();
    const role = ethers.keccak256(ethers.toUtf8Bytes("IEXCHANGE_MANAGER"));
    const accessControlError =
      "AccessControl: account " + invalidCaller + " is missing role " + role;
    await expect(
      (managerProxy.connect(yaaBrokie) as any).addTradeToken(
        mockToken,
        crossChainSender,
        orderFee
      )
    ).to.be.revertedWith(accessControlError);

    //passing addTradeToken
    await expect(
      managerProxy.addTradeToken(mockToken, crossChainSender, orderFee)
    )
      .to.emit(managerProxy, "TradeTokenAdded")
      .withArgs(owner, mockToken, crossChainSender, orderFee, 0);
    console.log("trade token: ", await viewProxy.tradeToken(mockToken));
  });

  xit("Should [updateTradeToken, Reverts for updateTradeToken ]", async function () {
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
      managerProxy,
      viewProxy,
      iExchangeP2P,
    } = await loadFixture(deployIExchange);

    //add trade token
    const mockToken = ethers.Wallet.createRandom().address;
    const orderFee = BigInt(100);
    const crossChainSender = ethers.Wallet.createRandom().address;

    //revert TradeTokenExists
    const existingToken = await usdt.getAddress();
    await expect(
      managerProxy.addTradeToken(existingToken, crossChainSender, orderFee)
    ).to.be.revertedWithCustomError(managerProxy, "TradeTokenExists");

    //passing addTradeToken
    await expect(
      managerProxy.addTradeToken(mockToken, crossChainSender, orderFee)
    )
      .to.emit(managerProxy, "TradeTokenAdded")
      .withArgs(owner, mockToken, crossChainSender, orderFee, 0);
    console.log("trade token: ", await viewProxy.tradeToken(mockToken));
  });
});
