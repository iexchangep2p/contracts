import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, ignition } from "hardhat";

import IgniteTestModule from "../ignition/modules/IgniteTest";

export async function deployIExchange() {
  const [owner, kofiMerchant, amaTrader, yaa] = await ethers.getSigners();

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
  } = await ignition.deploy(IgniteTestModule, {
    displayUi: false,
  });
  const IXToken = await ethers.getContractFactory("IXToken");
  const ixToken = await IXToken.deploy();
  const minStakeAmount = BigInt(1 * 1e18);
  const oneMil = BigInt(minStakeAmount * BigInt(1e6));
  const oneGrand = BigInt(minStakeAmount * BigInt(1e3));

  const USDT = await ethers.getContractFactory("TokenCutter");
  const usdt = await USDT.deploy("IX USDT", "USDT");

  await usdt.transfer(kofiMerchant, oneMil);
  await ixToken.transfer(kofiMerchant, oneMil);

  await usdt.transfer(amaTrader, oneMil);
  await ixToken.transfer(amaTrader, oneMil);

  return {
    owner,
    kofiMerchant,
    amaTrader,
    yaa,
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
    ixToken,
    oneMil,
    oneGrand,
  };
}

describe("IExchange", function () {
  it("Should Deploy", async function () {
    await loadFixture(deployIExchange);
  });
});
