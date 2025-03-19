# IExchange P2P Contracts

## Setup Test Network

### Deploy and Verify Contracts

1. `bun hardhat run scripts/setup_testnet.ts  --network [network]`
2. `bun hardhat ignition verify [chain] --include-unrelated-contracts`

### Setup Faucet

1. Add necessary config to `setup_faucet.ts` for network
2. `bun hardhat run scripts/setup_faucet.ts  --network [network]`

### Setup Backend

1. Add contract address and new network to backend configuration.
2. Add tokens to backend configuration.
3. Setup faucet and rpc

### Setup Bot

1. Add bot configuration to backend.
2. Add bot configuration to `setup_bot.ts`.
3. `bun hardhat run scripts/setup_bot.ts  --network [network]`
