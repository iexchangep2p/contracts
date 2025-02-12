import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, ignition } from "hardhat";

import IgniteTestModule from "../ignition/modules/IgniteTest";

export async function deployIExchange() {
  const [owner, kofiMerchant, amaTrader, yaaBrokie] = await ethers.getSigners();

  const {
    merchantProxy,
    orderProxy,
    appealProxy,
    managerProxy,
    viewProxy,
    amlProxy,
    kycProxy,
    iExchangeP2P,
    cutProxy,
    acProxy,
    orderSigProxy,
  } = await ignition.deploy(IgniteTestModule, {
    displayUi: false,
  });
  const IXToken = await ethers.getContractFactory("IXToken");
  const ixToken = await IXToken.deploy();
  const minStakeAmount = BigInt(1 * 1e18);
  const oneMil = BigInt(minStakeAmount * BigInt(1e6));
  const oneGrand = BigInt(minStakeAmount * BigInt(1e3));
  const orderFeeBasis = 100;
  const currency = ethers.toUtf8Bytes("ECO");
  const paymentMethod = ethers.toUtf8Bytes("ECOPAY");

  const USDT = await ethers.getContractFactory("TokenCutter");
  const usdt = await USDT.deploy("IX USDT", "USDT");

  await usdt.transfer(kofiMerchant, oneMil);
  await ixToken.transfer(kofiMerchant, oneMil);

  await usdt.transfer(amaTrader, oneMil);
  await ixToken.transfer(amaTrader, oneMil);

  const DummySender = await ethers.getContractFactory("DummySender");
  const dummySender = await DummySender.deploy();

  await managerProxy.addStakeToken(await ixToken.getAddress(), oneGrand);
  await managerProxy.addPaymentMethod(paymentMethod, oneMil, oneMil);
  await managerProxy.addCurrency(currency, oneMil, oneMil);

  await managerProxy.addTradeToken(
    await usdt.getAddress(),
    oneMil,
    oneMil,
    await dummySender.getAddress(),
    orderFeeBasis,
    oneGrand
  );
  return {
    owner,
    kofiMerchant,
    amaTrader,
    yaaBrokie,
    merchantProxy,
    orderProxy,
    orderSigProxy,
    appealProxy,
    managerProxy,
    viewProxy,
    amlProxy,
    kycProxy,
    iExchangeP2P,
    cutProxy,
    acProxy,
    ixToken,
    oneMil,
    oneGrand,
    currency,
    paymentMethod,
  };
}

describe("IExchange", function () {
  it("Should Deploy", async function () {
    await loadFixture(deployIExchange);
  });
});
