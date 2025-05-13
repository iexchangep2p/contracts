// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import IExchangeP2PModule from "../IExchangeP2P";
import SenderModule from "../DummySender";

const TestTokenModule = buildModule("TestTokenModule", (m) => {
  const { managerProxy } = m.useModule(IExchangeP2PModule);
  const { dummySender } = m.useModule(SenderModule);
  const oneMil = BigInt(1e24);
  const oneGrand = BigInt(1e21);
  const orderFeeBasis = 100;
  const usdc = m.contract("TokenCutter", ["IX USDC", "USDC"], {
    id: "IXUSDC",
  });
  const usdt = m.contract("TokenCutter", ["IX USDT", "USDT"], {
    id: "IXUSDT",
  });

  m.call(
    managerProxy,
    "addTradeToken",
    [usdc, dummySender, orderFeeBasis],
    { id: "IXUSDCTradeToken" }
  );
  m.call(
    managerProxy,
    "addTradeToken",
    [usdt, dummySender, orderFeeBasis],
    { id: "IXUSDTTradeToken" }
  );

  return {
    usdt,
    usdc,
  };
});

export default TestTokenModule;
