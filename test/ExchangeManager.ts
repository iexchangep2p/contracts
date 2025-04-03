import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { ethers } from "hardhat";
import { expect } from "chai";
import { deployIExchange } from "./IExchangeDeployFixture";

describe("Exchange Manager", function () {
  it("Should [addTradeToken, Reverts for addTradeToken ]", async function () {
    const { owner, yaaBrokie, usdt, managerProxy } = await loadFixture(
      deployIExchange
    );

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

    //revert ZeroAddress - crossChainSender
    await expect(
      managerProxy.addTradeToken(mockToken, ethers.ZeroAddress, orderFee)
    ).to.be.revertedWithCustomError(managerProxy, "ZeroAddress");

    // revert ZeroNumber - orderFee
    await expect(
      managerProxy.addTradeToken(mockToken, crossChainSender, 0)
    ).to.be.revertedWithCustomError(managerProxy, "ZeroNumber");

    //passing addTradeToken
    await expect(
      managerProxy.addTradeToken(mockToken, crossChainSender, orderFee)
    )
      .to.emit(managerProxy, "TradeTokenAdded")
      .withArgs(owner, mockToken, crossChainSender, orderFee, 0);
  });

  it("Should [updateTradeToken, Reverts for updateTradeToken ]", async function () {
    const { owner, amaTrader, usdt, managerProxy, viewProxy } =
      await loadFixture(deployIExchange);

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

    //revert for onlyExchangeManager
    const invalidCaller = amaTrader.address.toLowerCase();
    const role = ethers.keccak256(ethers.toUtf8Bytes("IEXCHANGE_MANAGER"));
    const accessControlError =
      "AccessControl: account " + invalidCaller + " is missing role " + role;
    await expect(
      (managerProxy.connect(amaTrader) as any).updateTradeToken(
        mockToken,
        crossChainSender,
        orderFee
      )
    ).to.be.revertedWith(accessControlError);

    //revert ZeroAddress - crossChainSender
    await expect(
      managerProxy.updateTradeToken(mockToken, ethers.ZeroAddress, orderFee)
    ).to.be.revertedWithCustomError(managerProxy, "ZeroAddress");

    // revert ZeroNumber - orderFee
    await expect(
      managerProxy.updateTradeToken(mockToken, crossChainSender, 0)
    ).to.be.revertedWithCustomError(managerProxy, "ZeroNumber");

    // revert TradeTokenDoesNotExists
    const nonExistentToken = ethers.Wallet.createRandom().address;
    await expect(
      managerProxy.updateTradeToken(
        nonExistentToken,
        crossChainSender,
        orderFee
      )
    ).to.be.revertedWithCustomError(managerProxy, "TradeTokenDoesNotExists");

    //updateTradeToken
    const newOrderFee = BigInt(200);
    const newCrossChainSender = ethers.Wallet.createRandom().address;
    await expect(
      managerProxy.updateTradeToken(mockToken, newCrossChainSender, newOrderFee)
    )
      .to.emit(managerProxy, "TradeTokenUpdated")
      .withArgs(owner, mockToken, newCrossChainSender, newOrderFee, anyValue);
    const [active, collectedFees, updatedCrossChainSender, updatedOrderFee] =
      await viewProxy.tradeToken(mockToken);
    expect(active).to.be.true;
    expect(collectedFees).to.be.equal(0);
    expect(updatedCrossChainSender).to.be.equal(newCrossChainSender);
    expect(updatedOrderFee).to.be.equal(newOrderFee);
  });
  it("Should [removeTradeToken, Reverts for removeTradeToken ]", async function () {
    const { owner, amaTrader, managerProxy } = await loadFixture(
      deployIExchange
    );

    const mockToken = ethers.Wallet.createRandom().address;
    const orderFee = BigInt(100);
    const crossChainSender = ethers.Wallet.createRandom().address;

    //passing addTradeToken
    await expect(
      managerProxy.addTradeToken(mockToken, crossChainSender, orderFee)
    )
      .to.emit(managerProxy, "TradeTokenAdded")
      .withArgs(owner, mockToken, crossChainSender, orderFee, 0);

    //revert for onlyExchangeManager
    const invalidCaller = amaTrader.address.toLowerCase();
    const role = ethers.keccak256(ethers.toUtf8Bytes("IEXCHANGE_MANAGER"));
    const accessControlError =
      "AccessControl: account " + invalidCaller + " is missing role " + role;
    await expect(
      (managerProxy.connect(amaTrader) as any).removeTradeToken(mockToken)
    ).to.be.revertedWith(accessControlError);

    // revert TradeTokenDoesNotExists
    const nonExistentToken = ethers.Wallet.createRandom().address;
    await expect(
      managerProxy.removeTradeToken(nonExistentToken)
    ).to.be.revertedWithCustomError(managerProxy, "TradeTokenDoesNotExists");

    //removeTradeToken
    await expect(managerProxy.removeTradeToken(mockToken))
      .to.emit(managerProxy, "TradeTokenRemoved")
      .withArgs(owner, mockToken);
  });
  it("Should [setMinPaymentTimeLimit, Reverts for setMinPaymentTimeLimit]", async function () {
    const { owner, amaTrader, managerProxy, viewProxy } = await loadFixture(
      deployIExchange
    );

    const minPaymentTimeLimit = 15; //mins

    //revert for onlyExchangeManager
    const invalidCaller = amaTrader.address.toLowerCase();
    const role = ethers.keccak256(ethers.toUtf8Bytes("IEXCHANGE_MANAGER"));
    const accessControlError =
      "AccessControl: account " + invalidCaller + " is missing role " + role;
    await expect(
      (managerProxy.connect(amaTrader) as any).setMinPaymentTimeLimit(
        minPaymentTimeLimit
      )
    ).to.be.revertedWith(accessControlError);

    //revert for InvalidMinPaymentTimeLimit
    const invalidMinPaymentTimeLimit =
      (await viewProxy.maxPaymentTimeLimit()) + 1n;
    await expect(
      managerProxy.setMinPaymentTimeLimit(invalidMinPaymentTimeLimit)
    ).to.be.revertedWithCustomError(managerProxy, "InvalidMinPaymentTimeLimit");

    //revert for ZeroNumber
    await expect(
      managerProxy.setMinPaymentTimeLimit(0)
    ).to.be.revertedWithCustomError(managerProxy, "ZeroNumber");

    //pass setMinPaymentTimeLimit
    await expect(managerProxy.setMinPaymentTimeLimit(minPaymentTimeLimit))
      .to.emit(managerProxy, "MinPaymentTimeLimitSet")
      .withArgs(owner, minPaymentTimeLimit);

    const storedMinPaymentTimeLimit = await viewProxy.minPaymentTimeLimit();
    expect(storedMinPaymentTimeLimit).to.be.equal(minPaymentTimeLimit);
  });
  it("Should [setMaxPaymentTimeLimit, Reverts for setMaxPaymentTimeLimit]", async function () {
    const { owner, amaTrader, managerProxy, viewProxy } = await loadFixture(
      deployIExchange
    );

    const maxPaymentTimeLimit = 300; //mins
    console.log("min limit: ", await viewProxy.minPaymentTimeLimit());

    //revert for onlyExchangeManager
    const invalidCaller = amaTrader.address.toLowerCase();
    const role = ethers.keccak256(ethers.toUtf8Bytes("IEXCHANGE_MANAGER"));
    const accessControlError =
      "AccessControl: account " + invalidCaller + " is missing role " + role;
    await expect(
      (managerProxy.connect(amaTrader) as any).setMinPaymentTimeLimit(
        maxPaymentTimeLimit
      )
    ).to.be.revertedWith(accessControlError);

    //revert for InvalidMinPaymentTimeLimit
    //set minPaymentTimeLimit to 15
    await expect(managerProxy.setMinPaymentTimeLimit(15n))
      .to.emit(managerProxy, "MinPaymentTimeLimitSet")
      .withArgs(owner, 15n);

    const invalidMaxPaymentTimeLimit =
      (await viewProxy.minPaymentTimeLimit()) - 1n;

    await expect(
      managerProxy.setMaxPaymentTimeLimit(invalidMaxPaymentTimeLimit)
    ).to.be.revertedWithCustomError(managerProxy, "InvalidMaxPaymentTimeLimit");

    //revert for ZeroNumber
    await expect(
      managerProxy.setMaxPaymentTimeLimit(0)
    ).to.be.revertedWithCustomError(managerProxy, "ZeroNumber");

    //pass setMinPaymentTimeLimit
    await expect(managerProxy.setMaxPaymentTimeLimit(maxPaymentTimeLimit))
      .to.emit(managerProxy, "MaxPaymentTimeLimitSet")
      .withArgs(owner, maxPaymentTimeLimit);

    const storedMaxPaymentTimeLimit = await viewProxy.maxPaymentTimeLimit();
    expect(storedMaxPaymentTimeLimit).to.be.equal(maxPaymentTimeLimit);
  });
});
