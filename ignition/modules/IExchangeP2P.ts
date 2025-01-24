// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import {
  functionSigsSelectors,
  functionSelectors,
  FacetCutAction,
  INIT_SIG,
} from "../lib";
import IExchangeDiamondModule from "./IExchangeDiamond";

const IExchangeP2PModule = buildModule("IExchangeP2PModule", (m) => {
  const { iExchangeP2P, cutProxy } = m.useModule(IExchangeDiamondModule);

  const cpiS = functionSigsSelectors("IExchangeP2PInit");
  const cpi = m.contract("IExchangeP2PInit");
  const cpiInit = { contract: cpi, selector: cpiS[INIT_SIG] };

  const mS = functionSelectors("Merchant");
  const mt = m.contract("Merchant");
  const mC = [mt, FacetCutAction.Add, Object.values(mS)];

  const oS = functionSelectors("Order");
  const o = m.contract("Order");
  const oC = [o, FacetCutAction.Add, Object.values(oS)];

  const aS = functionSelectors("Appeal");
  const a = m.contract("Appeal");
  const aC = [a, FacetCutAction.Add, Object.values(aS)];

  const emS = functionSelectors("ExchangeManager");
  const em = m.contract("ExchangeManager");
  const emC = [em, FacetCutAction.Add, Object.values(emS)];

  const evS = functionSelectors("ExchangeView");
  const ev = m.contract("ExchangeView");
  const evC = [ev, FacetCutAction.Add, Object.values(evS)];

  m.call(
    cutProxy,
    "diamondCut",
    [[oC, aC, emC, evC, mC], cpiInit.contract, cpiInit.selector],
    { id: "IExchangeP2PDiamondCut" }
  );

  const acMerchant = m.contractAt("Merchant", iExchangeP2P, {
    id: "IExchangeP2PMerchant",
  });

  const acOrder = m.contractAt("Order", iExchangeP2P, {
    id: "IExchangeP2POrder",
  });

  const acAppeal = m.contractAt("Appeal", iExchangeP2P, {
    id: "IExchangeP2PAppeal",
  });

  const acExchangeManager = m.contractAt("ExchangeManager", iExchangeP2P, {
    id: "IExchangeP2PExchangeManager",
  });

  const acExchangeView = m.contractAt("ExchangeView", iExchangeP2P, {
    id: "IExchangeP2PExchangeView",
  });

  return { acMerchant, acOrder, acAppeal, acExchangeManager, acExchangeView };
});

export default IExchangeP2PModule;
