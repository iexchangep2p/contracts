import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { testChains, testKeys, testNetworks } from "./configs/testnets";


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
    ...testNetworks
  },
  etherscan: {
    apiKey: {
      ...testKeys
    },
    customChains: [
      ...testChains
    ],
  },
  mocha: {
    timeout: 100000000,
  },
};

export default config;
