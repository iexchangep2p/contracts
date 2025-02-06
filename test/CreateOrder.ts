import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, ignition } from "hardhat";

import {deployIExchange} from "./IExchangeDeployFixture";

describe("Create Order", function () {
  it("", async function () {
    await loadFixture(deployIExchange);
  });
});
