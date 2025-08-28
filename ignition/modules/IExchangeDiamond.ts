// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import {
  functionSigsSelectors,
  functionSelectors,
  FacetCutAction,
  INIT_SIG,
} from "../lib";

const IExchangeDiamondModule = buildModule("IExchangeDiamondModule", (m) => {
  const owner = m.getAccount(0);
  const diamondCutFacet = m.contract("DiamondCutFacet");
  const iExchangeP2P = m.contract("IExchangeP2P", [owner, diamondCutFacet]);

  const diamondInitSelectors = functionSigsSelectors("DiamondInit");
  const diamondInitContract = m.contract("DiamondInit");
  const diamondInit = { contract: diamondInitContract, selector: diamondInitSelectors[INIT_SIG] };

  const ownershipSelectors = functionSelectors("OwnershipFacet");
  const ownershipContract = m.contract("OwnershipFacet");
  const ownershipCut = [ownershipContract, FacetCutAction.Add, Object.values(ownershipSelectors)];

  const loupeSelectors = functionSelectors("DiamondLoupeFacet");
  const loupeContract = m.contract("DiamondLoupeFacet");
  const loupeCut = [loupeContract, FacetCutAction.Add, Object.values(loupeSelectors)];

  const cutProxy = m.contractAt("DiamondCutFacet", iExchangeP2P, {
    id: "IExchangeP2PDiamondCutFacet",
  });

  m.call(cutProxy, "diamondCut", [[ownershipCut, loupeCut], diamondInit.contract, diamondInit.selector]);

  const accessControlInitSelectors = functionSigsSelectors("AccessControlInit");
  const accessControlInitContract = m.contract("AccessControlInit");
  const accessControlInit = { contract: accessControlInitContract, selector: accessControlInitSelectors[INIT_SIG] };

  const accessControlSelectors = functionSelectors("AccessControlFacet");
  const accessControlContract = m.contract("AccessControlFacet");
  const accessControlCut = [accessControlContract, FacetCutAction.Add, Object.values(accessControlSelectors)];

  m.call(cutProxy, "diamondCut", [[accessControlCut], accessControlInit.contract, accessControlInit.selector], {
    id: "AccessControlDiamondCut",
  });

  const accessControlProxy = m.contractAt("AccessControlFacet", iExchangeP2P, {
    id: "IExchangeP2PAccessControl",
  });

  return { iExchangeP2P, cutProxy, accessControlProxy };
});

export default IExchangeDiamondModule;
