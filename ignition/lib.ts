import { ethers, artifacts } from "hardhat";

export function functionSelectors(contractName: string): Array<string> {
  const abi = artifacts.readArtifactSync(contractName).abi;
  const face = ethers.Interface.from(abi);
  const funcs: string[] = [];
  for (const frag of face.fragments) {
    if (frag.type == "function") {
      funcs.push((frag as any).selector);
    }
  }
  return funcs;
}

export function functionSigs(contractName: string): Array<string> {
  const abi = artifacts.readArtifactSync(contractName).abi;
  const face = ethers.Interface.from(abi);
  const funcs: string[] = [];
  for (const frag of face.fragments) {
    if (frag.type == "function") {
      funcs.push(frag.format("minimal"));
    }
  }
  return funcs;
}

export function functionSigsSelectors(contractName: string): {
  [key: string]: string;
} {
  const abi = artifacts.readArtifactSync(contractName).abi;
  const face = ethers.Interface.from(abi);
  const funcs: { [key: string]: string } = {};
  for (const frag of face.fragments) {
    if (frag.type == "function") {
      funcs[frag.format("sighash")] = (frag as any).selector;
    }
  }
  return funcs;
}

export const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

export const INIT_SIG: string = "init()";
