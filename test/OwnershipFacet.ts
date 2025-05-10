import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { deployIExchange } from "./IExchangeDeployFixture";

describe("OwnershipFacet", async function () {
  it("Ownership: Should Check Owner, Transfer Ownership", async function () {
    const { oProxy, owner, kofiMerchant } = await loadFixture(deployIExchange);
    const actualOwner = await oProxy.owner();
    expect(actualOwner).to.equal(await owner.getAddress());

    // Transfer ownership
    await expect(
      (oProxy.connect(owner) as any).transferOwnership(
        await kofiMerchant.getAddress()
      )
    )
      .to.emit(oProxy, "OwnershipTransferred")
      .withArgs(await owner.getAddress(), await kofiMerchant.getAddress());

    //revert user is owner
    await expect(
      (oProxy.connect(owner) as any).transferOwnership(await owner.getAddress())
    ).to.be.revertedWith("LibDiamond: Must be contract owner");
  });
});
