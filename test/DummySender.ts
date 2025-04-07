import { ethers } from "hardhat";
import { expect } from "chai";
import { bigint } from "hardhat/internal/core/params/argumentTypes";

//Deploy IXToken - Approve - DummySender - Check Balances

describe("DummySender", function () {
  it("Should Deploy and Send Tokens", async function () {
    const [owner, amaTrader] =
      await ethers.getSigners();
    const DummySender = await ethers.getContractFactory("DummySender");
    const dummySender = await DummySender.deploy();

    const IXToken = await ethers.getContractFactory("IXToken");
    const ixToken = await IXToken.deploy();

    const oneGrand = BigInt(1e21);
    await ixToken.transfer(await dummySender.getAddress(), oneGrand);
    const dummySenderBalanceBefore = await ixToken.balanceOf(await dummySender.getAddress());

    expect(dummySenderBalanceBefore).to.be.equal(oneGrand);
    await expect(dummySender.send(await ixToken.getAddress(), oneGrand, amaTrader.address, BigInt(1))).to.not.be.reverted;

    const dummySenderAddressAfter = await ixToken.balanceOf(
      await dummySender.getAddress()
    );
    expect(dummySenderAddressAfter).to.be.equal(0);
    const amaTraderBalance = await ixToken.balanceOf(await amaTrader.getAddress());
    expect(amaTraderBalance).to.be.equal(oneGrand);

  });
});
