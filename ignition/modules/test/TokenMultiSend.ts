// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const TokenMultiSendModule = buildModule("TokenMultiSendModule", (m) => {
  const tokenMulti = m.contract("TokenMultiSend");
  return { tokenMulti };
});

export default TokenMultiSendModule;
