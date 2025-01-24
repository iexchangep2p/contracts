import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, ignition } from "hardhat";

import IgniteTestModule from "../ignition/modules/IgniteTest";

async function deployIExchange() {
  const [owner, kofi, ama, yaa] = await ethers.getSigners();

  const { iExchange } = await ignition.deploy(IgniteTestModule, {
    displayUi: false,
  });
  const IXToken = await ethers.getContractFactory("IXToken");
  const ixToken = await IXToken.deploy();
  const minStakeAmount = BigInt(1 * 1e18);
  const oneMil = BigInt(minStakeAmount * BigInt(1e6));
  const oneGrand = BigInt(minStakeAmount * BigInt(1e3));

  await ixToken.transfer(kofi, oneMil);
  return {
    owner,
    kofi,
    ama,
    yaa,
    iExchange,
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
