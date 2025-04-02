# IExchange P2P Contracts

## Setup Test Network

### Deploy and Verify Contracts

1. `bun hardhat run scripts/setup_testnet.ts  --network [network]`
2. `bun hardhat ignition verify [chain] --include-unrelated-contracts`

### Setup Faucet

1. Add necessary config to `setup_faucet.ts` for network
2. `bun hardhat run scripts/setup_faucet.ts  --network [network]`

