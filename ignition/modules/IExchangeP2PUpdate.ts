// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import {
  functionSigsSelectors,
  functionSelectors,
  FacetCutAction,
  INIT_SIG,
} from "../lib";
import IExchange from "./IExchangeDiamond";

const IExchangeP2PUpdateModule = buildModule("IExchangeP2PUpdateModule", (m) => {
  const iExchange = m.useModule(IExchange);

  const cpiS = functionSigsSelectors("IExchangeP2PUpdateInit");
  const cpi = m.contract("IExchangeP2PUpdateInit");
  const cpiInit = { contract: cpi, selector: cpiS[INIT_SIG] };

  m.call(
    iExchange.cutProxy,
    "diamondCut",
    [[], cpiInit.contract, cpiInit.selector],
    { id: "IExchangeP2PUpdateDiamondCut" }
  );

  return {};
});

export default IExchangeP2PUpdateModule;
