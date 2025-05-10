import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, ignition } from "hardhat";

import IgniteTestModule from "../ignition/modules/test/IgniteTest";

export async function deployIExchange() {
  const [owner, kofiMerchant, amaTrader, yaaBrokie] = await ethers.getSigners();

  const {
    orderProxy,
    appealProxy,
    managerProxy,
    viewProxy,
    iExchangeP2P,
    cutProxy,
    acProxy,
    orderSigProxy,
    oProxy,
  } = await ignition.deploy(IgniteTestModule, {
    displayUi: false,
  });
  const TokenMultiSend = await ethers.getContractFactory("TokenMultiSend");
  const tokenMulti = await TokenMultiSend.deploy();
  const IXToken = await ethers.getContractFactory("IXToken");
  const ixToken = await IXToken.deploy();
  const minStakeAmount = BigInt(1 * 1e18);
  const oneBil = BigInt(minStakeAmount * BigInt(1e9));
  const oneMil = BigInt(minStakeAmount * BigInt(1e6));
  const oneGrand = BigInt(minStakeAmount * BigInt(1e3));
  const orderFeeBasis = 100;
  const currency = ethers.toUtf8Bytes("ECO");
  const paymentMethod = ethers.toUtf8Bytes("ECOPAY");
  const currency2 = ethers.toUtf8Bytes("GHS");
  const paymentMethod2 = ethers.toUtf8Bytes("GHSPAY");
  const oneGrandNumber = 1000;
  const hardhatNetwork = await ethers.provider.getNetwork();
  const chainId = Number(hardhatNetwork.chainId);

  const USDT = await ethers.getContractFactory("TokenCutter");
  const usdt = await USDT.deploy("IX USDT", "USDT");

  await usdt.approve(await tokenMulti.getAddress(), oneBil);
  await ixToken.approve(await tokenMulti.getAddress(), oneBil);

  await tokenMulti.send(
    [await usdt.getAddress(), await ixToken.getAddress()],
    oneMil,
    kofiMerchant
  );
  await tokenMulti.send(
    [await usdt.getAddress(), await ixToken.getAddress()],
    oneMil,
    amaTrader
  );

  const DummySender = await ethers.getContractFactory("DummySender");
  const dummySender = await DummySender.deploy();

  await managerProxy.addTradeToken(
    await usdt.getAddress(),
    await dummySender.getAddress(),
    orderFeeBasis
  );
  return {
    owner,
    kofiMerchant,
    amaTrader,
    yaaBrokie,
    orderProxy,
    orderSigProxy,
    appealProxy,
    managerProxy,
    viewProxy,
    iExchangeP2P,
    cutProxy,
    acProxy,
    oProxy,
    ixToken,
    oneMil,
    oneGrand,
    currency,
    paymentMethod,
    usdt,
    oneGrandNumber,
    chainId,
    currency2,
    paymentMethod2,
  };
}

describe("IExchange", function () {
  it("Should Deploy", async function () {
    await loadFixture(deployIExchange);
  });
});
