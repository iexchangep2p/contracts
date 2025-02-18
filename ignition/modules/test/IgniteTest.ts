// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import {
  functionSigsSelectors,
  functionSelectors,
  FacetCutAction,
  INIT_SIG,
} from "../../lib";

const IgniteTestModule = buildModule("IgniteTestModule", (m) => {
  const owner = m.getAccount(0);
  const dc = m.contract("DiamondCutFacet");
  const iExchangeP2P = m.contract("IExchangeP2P", [owner, dc]);

  const diS = functionSigsSelectors("DiamondInit");
  const di = m.contract("DiamondInit");
  const diInit = { contract: di, selector: diS[INIT_SIG] };

  const oS = functionSelectors("OwnershipFacet");
  const o = m.contract("OwnershipFacet");
  const oC = [o, FacetCutAction.Add, Object.values(oS)];

  const dlS = functionSelectors("DiamondLoupeFacet");
  const dl = m.contract("DiamondLoupeFacet");
  const dlC = [dl, FacetCutAction.Add, Object.values(dlS)];

  const cutProxy = m.contractAt("DiamondCutFacet", iExchangeP2P, {
    id: "IExchangeP2PDiamondCutFacet",
  });

  m.call(cutProxy, "diamondCut", [[oC, dlC], diInit.contract, diInit.selector]);

  const aciS = functionSigsSelectors("AccessControlInit");
  const aci = m.contract("AccessControlInit");
  const aciInit = { contract: aci, selector: aciS[INIT_SIG] };

  const acS = functionSelectors("AccessControlFacet");
  const ac = m.contract("AccessControlFacet");
  const acC = [ac, FacetCutAction.Add, Object.values(acS)];

  m.call(cutProxy, "diamondCut", [[acC], aciInit.contract, aciInit.selector], {
    id: "AccessControlDiamondCut",
  });

  const acProxy = m.contractAt("AccessControlFacet", iExchangeP2P, {
    id: "IExchangeP2PAccessControl",
  });

  const cpiS = functionSigsSelectors("IExchangeP2PInit");
  const cpi = m.contract("IExchangeP2PInit");
  const cpiInit = { contract: cpi, selector: cpiS[INIT_SIG] };

  const mS = functionSelectors("Merchant");
  const mt = m.contract("Merchant");
  const mC = [mt, FacetCutAction.Add, Object.values(mS)];

  const odS = functionSelectors("Order");
  const od = m.contract("Order");
  const odC = [od, FacetCutAction.Add, Object.values(odS)];

  const osS = functionSelectors("OrderSig");
  const os = m.contract("OrderSig");
  const osC = [os, FacetCutAction.Add, Object.values(osS)];

  const aS = functionSelectors("Appeal");
  const a = m.contract("Appeal");
  const aC = [a, FacetCutAction.Add, Object.values(aS)];

  const emS = functionSelectors("ExchangeManager");
  const em = m.contract("ExchangeManager");
  const emC = [em, FacetCutAction.Add, Object.values(emS)];

  const evS = functionSelectors("ExchangeView");
  const ev = m.contract("ExchangeView");
  const evC = [ev, FacetCutAction.Add, Object.values(evS)];

  const amS = functionSelectors("AML");
  const am = m.contract("AML");
  const amC = [am, FacetCutAction.Add, Object.values(amS)];

  const kyS = functionSelectors("KYC");
  const ky = m.contract("KYC");
  const kyC = [ky, FacetCutAction.Add, Object.values(kyS)];

  m.call(
    cutProxy,
    "diamondCut",
    [
      [odC, aC, emC, evC, mC, amC, kyC, osC],
      cpiInit.contract,
      cpiInit.selector,
    ],
    { id: "IExchangeP2PDiamondCut" }
  );

  const merchantProxy = m.contractAt("Merchant", iExchangeP2P, {
    id: "IExchangeP2PMerchant",
  });

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

  const amlProxy = m.contractAt("AML", iExchangeP2P, {
    id: "IExchangeP2PAML",
  });

  const kycProxy = m.contractAt("KYC", iExchangeP2P, {
    id: "IExchangeP2PKYC",
  });

  return {
    merchantProxy,
    orderProxy,
    orderSigProxy,
    appealProxy,
    managerProxy,
    viewProxy,
    amlProxy,
    kycProxy,
    iExchangeP2P,
    cutProxy,
    acProxy,
  };
});

export default IgniteTestModule;
