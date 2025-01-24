// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import {
  functionSigsSelectors,
  functionSelectors,
  FacetCutAction,
  INIT_SIG,
} from "../lib";

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

  return { iExchangeP2P, cutProxy, acProxy };
});

export default IgniteTestModule;
