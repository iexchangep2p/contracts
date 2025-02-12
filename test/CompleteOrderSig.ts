import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, ignition } from "hardhat";

import { deployIExchange } from "./IExchangeDeployFixture";

describe("Complete OrderSig", function () {
  it("Create, Pay, Release", async function () {
    await loadFixture(deployIExchange);
  });
});
