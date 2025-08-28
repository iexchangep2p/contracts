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

  const orderSelectors = functionSelectors("Order");
  const orderContract = m.contract("Order");
  const orderCut = [orderContract, FacetCutAction.Add, Object.values(orderSelectors)];

  const orderSigSelectors = functionSelectors("OrderSig");
  const orderSigContract = m.contract("OrderSig");
  const orderSigCut = [orderSigContract, FacetCutAction.Add, Object.values(orderSigSelectors)];

  const appealSelectors = functionSelectors("Appeal");
  const appealContract = m.contract("Appeal");
  const appealCut = [appealContract, FacetCutAction.Add, Object.values(appealSelectors)];

  const managerSelectors = functionSelectors("ExchangeManager");
  const managerContract = m.contract("ExchangeManager");
  const managerCut = [managerContract, FacetCutAction.Add, Object.values(managerSelectors)];

  const viewSelectors = functionSelectors("ExchangeView");
  const viewContract = m.contract("ExchangeView");
  const viewCut = [viewContract, FacetCutAction.Add, Object.values(viewSelectors)];

  m.call(
    cutProxy,
    "diamondCut",
    [[orderCut, appealCut, managerCut, viewCut, orderSigCut], cpiInit.contract, cpiInit.selector],
    { id: "IExchangeP2PDiamondCut" }
  );

  const orderProxy = m.contractAt("Order", iExchangeP2P, {
    id: "IExchangeP2POrder",
  });

  const orderSigProxy = m.contractAt("OrderSig", iExchangeP2P, {
    id: "IExchangeP2POrderSig",
  });

  const appealProxy = m.contractAt("Appeal", iExchangeP2P, {
    id: "IExchangeP2PAppeal",
  });

  const managerProxy = m.contractAt("ExchangeManager", iExchangeP2P, {
    id: "IExchangeP2PExchangeManager",
  });

  const viewProxy = m.contractAt("ExchangeView", iExchangeP2P, {
    id: "IExchangeP2PExchangeView",
  });

  return {
    orderProxy,
    orderSigProxy,
    appealProxy,
    managerProxy,
    viewProxy,
  };
});

export default IExchangeP2PModule;
