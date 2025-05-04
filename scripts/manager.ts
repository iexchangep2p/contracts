import "dotenv/config";
import { ethers } from "hardhat";

async function main() {
  const p2pContracts: { [key: number]: string } = {
    421614: "0x39a7f0a342a0509C1aC248F379ba283e99c36Ae5",
    2810: "0x87c6346E3074373C41B9654875A6bA8716e8C2B9",
    4202: "0xDB4D2DE11712db36c6d702B27c9a3933174b1167",
    84532: "0x1216d8b0483493F40727ef6a95038D77062c0C35",
    534351: "0xE602737E67439C9bC7eFd7E1716fdb6bc631be0C",
    44787: "0x0089326cF33fF85f9AA39e02F4557B454327A17F",
    1301: "0x3d63fEc287aD7963B614eD873690A745E635D5Fa",
    296: "0x392E10c23E6000910f7785a076FA7B8BC41F315D",
    56: "0x92ba0d7Ae56c902A574117712E12ef1E94BFedeC",
    42220: "0x72b998C0DD2034FD83fE624972a076AEeAC51b5c"
  };
  const crossChain: { [key: number]: string } = {
    56: "0x9aE7e92505d98b39a082531bE86C69DAC4F0fEF6",
    42220: "0x95C2160BbB91118C2a1007B9676Ba05659156bD6",
  };
  const chain = Number((await ethers.provider.getNetwork()).chainId);

  const p2pManager = await ethers.getContractAt(
    "ExchangeManager",
    p2pContracts[chain]
  );

  let tx = await p2pManager.addTradeToken(
    "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    crossChain[chain],
    BigInt(50)
  );
  console.log(`set trade token ${tx.hash} ...`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
