import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  const gasTanks: { [key: string]: string } = {
    "0xFD5029788f20687fC784a6839E872ded2Cf90855": process.env.T1!,
    "0xF95664c59cF73e7A240bD957Fe3F8D075373f3Cd": process.env.T2!,
    "0x750c0F0C7D309f4FcecEACDe514fd2e7B7656e27": process.env.T3!,
    "0xa7C8951b675843212fe46309bdE84737B5c005Cc": process.env.T4!,
    "0x0f927f11123df987E1023F430e1c8649A043c541": process.env.T5!,
    "0x30f69f61C76a2654df340E8bc7Dc019eD4d4b844": process.env.T6!,
    "0x4a21294887EEB3E84E759Ca519B7D4b460c6091e": process.env.T7!,
    "0x458D7D5dF9e1D3f125e8E4453e9098370ccae50f": process.env.T8!,
    "0x80f7d0135c37FFDBbE48999f016D0A9d747A7e24": process.env.T9!,
    "0x6b3899dcd4C2CeEbb0f2FE7E85e91f7AB9D333CD": process.env.T10!,
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
      '0xFB7E20739Fa2b8b4351c9F87a1C68b728E7aa614',
      '0xEd64A15A6223588794A976d344990001a065F3f1',
    ],
  };
  const minStakeAmount = BigInt(5 * 1e18);
  const fiveMil = BigInt(minStakeAmount * BigInt(1e6));
  const oneTril = BigInt(minStakeAmount * BigInt(1e12));

  const tokenMulti: { [key: number]: string } = {
    421614: "0x72e6102Ea4d2837C044D12423a6F2281aeBCD28B",
    2810: "0x65C69f8c9a871F790812D380b6150C921CB5610B",
    4202: "0x7e973D307BcBBD488Af2661b04d71c9841e75765",
    84532: "0xf35582f788c1853c75Fb0b9D9286BaC41133134b",
    534351: "0x3ED02478ecf2A46Dd95477270AefD016B7b99ed2",
    44787: "0x171B62C816798F825250d1f43eb5922b0cb9f9eF",
    1301: "0xa9cC3A357091ebeD23F475A0BbA140054E453887",
    296: "0xa9cC3A357091ebeD23F475A0BbA140054E453887"
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

  const tm = tokenMulti[chain];

  // for (const t of Object.keys(gasTanks)) {
  //   let tx = await token1.transfer(t, fiveMil);
  //   console.log(`Just transfered token1 ${tx.hash} to ${t}`);

  //   await delay(5000);

  //   tx = await token2.transfer(t, fiveMil);
  //   console.log(`Just transfered token2 ${tx.hash} to ${t}`);

  //   await delay(5000);
  // }

  for (const t of Object.keys(gasTanks)) {
    const [s] = await ethers.getSigners();
    const tx = await s.sendTransaction({
      to: t,
      value: ethers.parseEther("0.5"),
    });
    console.log(`Just transfered ${tx.hash} to ${t}`);

    await delay(5000);
  }

  for (const t of Object.keys(gasTanks)) {
    const w = new ethers.Wallet(gasTanks[t], ethers.provider);

    const tx = await token1.connect(w).approve(tm, oneTril);
    console.log(`Just approved token1 ${tx.hash} to ${t}`);

    await delay(5000);

    const txt = await token2.connect(w).approve(tm, oneTril);
    console.log(`Just approved token2 ${txt.hash} to ${t}`);

    await delay(5000);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
