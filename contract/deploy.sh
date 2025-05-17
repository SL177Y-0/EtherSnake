#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install solc@0.8.21 @openzeppelin/contracts

# Compile the contract
echo "Compiling the contract..."
node contract/compile.js

# Deploy the contract
echo "Deploying the contract to Sepolia..."
node contract/deploy-with-credentials.js

echo "Deployment process complete!" 