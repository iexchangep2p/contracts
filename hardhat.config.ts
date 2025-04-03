import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { testChains, testKeys, testNetworks } from "./configs/testnets";
import { mainChains, mainKeys, mainNetworks } from "./configs/mainnets";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 999999,
      },
      evmVersion: "london",
    },
  },
  networks: {
    ...testNetworks,
    ...mainNetworks,
  },
  etherscan: {
    apiKey: {
      ...testKeys,
      ...mainKeys,
    },
    customChains: [...testChains, ...mainChains],
  },
  mocha: {
    timeout: 100000000,
  },
};

export default config;
