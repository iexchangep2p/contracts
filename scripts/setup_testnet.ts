import { ignition } from "hardhat";
import IExchangeP2PModule from "../ignition/modules/IExchangeP2P";
import SenderModule from "../ignition/modules/Sender";
import PaymentCurrencyModule from "../ignition/modules/PaymentCurrency";
import TestTokenModule from "../ignition/modules/test/TestTokens";

async function main() {
  await ignition.deploy(IExchangeP2PModule, { displayUi: true });
  await ignition.deploy(SenderModule, { displayUi: true });
  await ignition.deploy(TestTokenModule, { displayUi: true });
  await ignition.deploy(PaymentCurrencyModule, { displayUi: true });
  console.log(`Deployments Successfull ...`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
