import { vars } from "hardhat/config";
const DEPLOY_KEY = vars.get("DEPLOY_KEY");
const ETHERSCAN_KEY = vars.get("ETHERSCAN_KEY");
const MANTLESCAN_KEY = vars.get("MANTLESCAN_KEY");
export const testNetworks: any = {
  liskTestnet: {
    url: "https://rpc.sepolia-api.lisk.com",
    accounts: [DEPLOY_KEY],
  },
  morphTestnet: {
    url: "https://rpc-quicknode-holesky.morphl2.io",
    accounts: [DEPLOY_KEY],
  },
  baseSepolia: {
    url: "https://sepolia.base.org",
    accounts: [DEPLOY_KEY],
  },
  arbitrumSepolia: {
    url: "https://sepolia-rollup.arbitrum.io/rpc",
    accounts: [DEPLOY_KEY],
  },
  scrollSepolia: {
    url: "https://sepolia-rpc.scroll.io",
    accounts: [DEPLOY_KEY],
  },
  celoAlfajores: {
    url: "https://alfajores-forno.celo-testnet.org",
    accounts: [DEPLOY_KEY],
  },
  uniSepolia: {
    url: "https://sepolia.unichain.org",
    accounts: [DEPLOY_KEY],
  },
  inkSepolia: {
    url: "https://rpc-qnd-sepolia.inkonchain.com",
    accounts: [DEPLOY_KEY],
  },
  bscTestnet: {
    url: "https://data-seed-prebsc-1-s1.binance.org:8545",
    accounts: [DEPLOY_KEY],
  },
  opTestnet: {
    url: "https://sepolia.optimism.io",
    accounts: [DEPLOY_KEY],
  },
  hederaTestnet: {
    url: "https://testnet.hashio.io/api",
    accounts: [DEPLOY_KEY],
    gas: "auto",
    gasPrice: "auto",
    gasMultiplier: 3,
  },
  mantleSepolia: {
    url: "https://rpc.sepolia.mantle.xyz",
    accounts: [DEPLOY_KEY]
  },
};

export const testChains: any[] = [
  {
    network: "liskTestnet",
    chainId: 4202,
    urls: {
      apiURL: "https://sepolia-blockscout.lisk.com/api",
      browserURL: "https://sepolia-blockscout.lisk.com",
    },
  },
  {
    network: "morphTestnet",
    chainId: 2810,
    urls: {
      apiURL: "https://explorer-api-holesky.morphl2.io/api ",
      browserURL: "https://explorer-holesky.morphl2.io",
    },
  },
  {
    network: "arbitrumSepolia",
    chainId: 421614,
    urls: {
      apiURL: "https://arbitrum-sepolia.blockscout.com/api",
      browserURL: "https://arbitrum-sepolia.blockscout.com",
    },
  },
  {
    network: "baseSepolia",
    chainId: 84532,
    urls: {
      apiURL: "https://base-sepolia.blockscout.com/api",
      browserURL: "https://base-sepolia.blockscout.com",
    },
  },
  {
    network: "scrollSepolia",
    chainId: 534351,
    urls: {
      apiURL: "https://scroll-sepolia.blockscout.com/api",
      browserURL: "https://scroll-sepolia.blockscout.com",
    },
  },
  {
    network: "celoAlfajores",
    chainId: 44787,
    urls: {
      apiURL: "https://celo-alfajores.blockscout.com/api",
      browserURL: "https://celo-alfajores.blockscout.com",
    },
  },
  {
    network: "uniSepolia",
    chainId: 1301,
    urls: {
      apiURL: "https://unichain-sepolia.blockscout.com/api",
      browserURL: "https://unichain-sepolia.blockscout.com",
    },
  },
  {
    network: "inkSepolia",
    chainId: 763373,
    urls: {
      apiURL: "https://explorer-sepolia.inkonchain.com/api",
      browserURL: "https://explorer-sepolia.inkonchain.com",
    },
  },
  {
    network: "bscTestnet",
    chainId: 97,
    urls: {
      apiURL: "https://testnet.bscscan.com/api",
      browserURL: "https://testnet.bscscan.com",
    },
  },
  {
    network: "opTestnet",
    chainId: 11155420,
    urls: {
      apiURL: "https://sepolia-optimistic.etherscan.io/api",
      browserURL: "https://sepolia-optimistic.etherscan.io",
    },
  },
  {
    network: "hederaTestnet",
    chainId: 296,
    urls: {
      apiURL: "https://testnet.hashio.io/api",
      browserURL: "https://hashscan.io/testnet",
    },
  },
  {
    network: 'mantleSepolia',
    chainId: 5003,
    urls: {
      apiURL: 'https://api-sepolia.mantlescan.xyz/api',
      browserURL: 'https://sepolia.mantlescan.xyz/',
    },
  },
];

export const testKeys = {
  baseSepolia: "anything",
  morphTestnet: "anything",
  arbitrumSepolia: ETHERSCAN_KEY,
  scrollSepolia: ETHERSCAN_KEY,
  bscTestnet: ETHERSCAN_KEY,
  opTestnet: ETHERSCAN_KEY,
  inkSepolia: "anything",
  liskTestnet: "anything",
  hederaTestnet: "anything",
  celoAlfajores: "anything",
  uniSepolia: "anything",
  mantleSepolia: MANTLESCAN_KEY
};
