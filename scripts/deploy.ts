import { ignition } from "hardhat";
import IExchangeModule from "../ignition/modules/IExchange";

async function main() {
  await ignition.deploy(IExchangeModule, { displayUi: true });
  console.log(`Deployments Successfull ...`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
