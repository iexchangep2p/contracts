import { HardhatUserConfig, vars } from "hardhat/config";
const DEPLOY_KEY_MAIN = vars.get("DEPLOY_KEY_MAIN");
export const mainNetworks: any = {
  base: {
    url: "https://mainnet.base.org",
    accounts: [DEPLOY_KEY_MAIN],
  },
  arbitrum: {
    url: "https://arb1.arbitrum.io/rpc",
    accounts: [DEPLOY_KEY_MAIN],
  }
};

export const mainChains: any[] = [
  {
    network: "arbitrum",
    chainId: 42161,
    urls: {
      apiURL: "https://arbitrum.blockscout.com/api",
      browserURL: "https://arbitrum.blockscout.com",
    },
  },
  {
    network: "base",
    chainId: 8453,
    urls: {
      apiURL: "https://base.blockscout.com/api",
      browserURL: "https://base.blockscout.com",
    },
  }
];

export const mainKeys = {
  base: "anything",
  arbitrum: "anything",
};
