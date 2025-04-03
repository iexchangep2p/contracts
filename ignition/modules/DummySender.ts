// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DummySenderModule = buildModule("DummySenderModule", (m) => {
  const dummySender = m.contract("DummySender");

  return {
    dummySender,
  };
});

export default DummySenderModule;
