# SlitherBet Contract Deployment

This directory contains the SlitherBet smart contract and deployment scripts.

## Contract Overview

SlitherBet is a blockchain-based betting game where players can:

1. Create betting events
2. Join events by paying an entry fee
3. Submit scores
4. Win prizes based on the highest score

The contract is built using Solidity and based on OpenZeppelin contracts.

## Deployment Instructions

### Quick Deployment (with provided credentials)

To quickly deploy the contract using the provided credentials:

```bash
# Option 1: Using npm scripts
npm run contract:deploy

# Option 2: Using the deployment shell script
bash contract/deploy.sh
```

### Secure Deployment (recommended for production)

For production deployments, you should use environment variables:

1. Create a `.env` file in the project root with the following content:
```
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
ADMIN_PRIVATE_KEY=your-private-key-here
```

2. Install the required dependencies:
```bash
npm install dotenv solc@0.8.21 @openzeppelin/contracts
```

3. Compile and deploy:
```bash
node contract/compile.js
node contract/deploy-secure.js
```

## Contract Verification

After deployment, you can verify the contract on Etherscan:

1. Flattened contract source is available in `SlitherBet.sol`
2. Use the deployed contract address shown in the deployment logs
3. Verify using the Solidity compiler version 0.8.21

## Frontend Integration

The deployment script automatically:

1. Saves contract data to `lib/contract-data.json`
2. Updates the contract address in `hooks/use-web3.tsx`

No additional steps are needed to integrate with the frontend.

## Security Considerations

- Keep your private key secure
- Never commit `.env` files with real credentials
- For production, use a dedicated wallet with limited funds
- Consider using a hardware wallet for extra security

## Testing

The contract can be tested on the Sepolia testnet before deploying to mainnet. 