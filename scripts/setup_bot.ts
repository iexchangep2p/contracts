import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  const BOT_KEYS: { [key: number]: string } = {
    421614: process.env.ARB_BOT!,
    84532: process.env.BASE_BOT!,
    4202: process.env.LISK_BOT!,
    2810: process.env.MORPH_BOT!,
    534351: process.env.SCROLL_BOT!,
    44787: process.env.CELO_BOT!,
    1301: process.env.UNI_BOT!,
    296: process.env.H_BOT!,
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const testTokens: { [key: number]: string[] } = {
    421614: [
      "0xEd64A15A6223588794A976d344990001a065F3f1",
      "0x31556A6Fd2D2De4775B4df43c877cF7178499b49",
    ],
    2810: [
      "0x6805F4d4BAB919f4e1e9fa593A03E5d13CBeDfb2",
      "0x9bABB7c87eb0D2b39981D12e44196b52694ed7a5",
    ],
    4202: [
      "0x181D675e1d7958Aa0034A45fDeE619Fd345Fa71A",
      "0x4dCEDaf993965b63FFbA4A6f5bF666B6a8D3875D",
    ],
    84532: [
      "0x7FC7885B959040Ef1AAa869992EefCBe15BbFDFB",
      "0xA344177685bb29E42bbf10eD268aEC076282807D",
    ],
    534351: [
      "0xACBC1eC300bBea9A9FD0A661cD717d8519c5FCA5",
      "0x28cB409154beb695D5E9ffA85dA8f1564Aa3cD76",
    ],
    44787: [
      "0xa9cC3A357091ebeD23F475A0BbA140054E453887",
      "0x88F6cE7417699F1E3470c35eFe0BE660b2897474",
    ],
    1301: [
      "0xFB7E20739Fa2b8b4351c9F87a1C68b728E7aa614",
      "0xEd64A15A6223588794A976d344990001a065F3f1",
    ],
    296: [
      "0xFB7E20739Fa2b8b4351c9F87a1C68b728E7aa614",
      "0xEd64A15A6223588794A976d344990001a065F3f1",
    ],
  };
  const minStakeAmount = BigInt(5 * 1e18);
  const fiveMil = BigInt(minStakeAmount * BigInt(1e6));
  const oneTril = BigInt(minStakeAmount * BigInt(1e12));

  const p2pContracts: { [key: number]: string } = {
    421614: "0x39a7f0a342a0509C1aC248F379ba283e99c36Ae5",
    2810: "0x87c6346E3074373C41B9654875A6bA8716e8C2B9",
    4202: "0xDB4D2DE11712db36c6d702B27c9a3933174b1167",
    84532: "0x1216d8b0483493F40727ef6a95038D77062c0C35",
    534351: "0xE602737E67439C9bC7eFd7E1716fdb6bc631be0C",
    44787: "0x0089326cF33fF85f9AA39e02F4557B454327A17F",
    1301: "0x3d63fEc287aD7963B614eD873690A745E635D5Fa",
    296: "0x392E10c23E6000910f7785a076FA7B8BC41F315D",
  };
  const chain = Number((await ethers.provider.getNetwork()).chainId);
  const token1 = await ethers.getContractAt(
    "TokenCutter",
    testTokens[chain][0]
  );
  const token2 = await ethers.getContractAt(
    "TokenCutter",
    testTokens[chain][1]
  );

  const p2p = p2pContracts[chain];

  const w = new ethers.Wallet(BOT_KEYS[chain], ethers.provider);
  const [s] = await ethers.getSigners();
  let tx = await s.sendTransaction({
    to: w.address,
    value: ethers.parseEther("1"),
  });
  console.log(`Just transfered eth ${tx.hash} to ${w.address}`);

  await delay(5000);

  tx = await token1.connect(w).approve(p2p, oneTril);
  console.log(`Just approved token1 ${tx.hash} to ${p2p}`);

  await delay(5000);

  const txt = await token2.connect(w).approve(p2p, oneTril);
  console.log(`Just approved token2 ${txt.hash} to ${p2p}`);

  await delay(5000);
  tx = await token2.transfer(w.address, fiveMil);
  console.log(`Just transfered token1 ${tx.hash} to ${w.address}`);

  await delay(5000);

  tx = await token1.transfer(w.address, fiveMil);
  console.log(`Just transfered token2 ${tx.hash} to ${w.address}`);

  await delay(5000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
