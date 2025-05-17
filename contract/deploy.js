import { ethers } from "ethers";
import fs from "fs";

async function main() {
  // Connect to the Sepolia network
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
  
  console.log("Deploying contracts with the account:", wallet.address);
  
  // Read the compiled contract
  const SlitherBetJSON = JSON.parse(fs.readFileSync('./artifacts/contracts/SlitherBet.sol/SlitherBet.json', 'utf8'));
  
  // Deploy the contract
  const SlitherBetFactory = new ethers.ContractFactory(
    SlitherBetJSON.abi,
    SlitherBetJSON.bytecode,
    wallet
  );
  
  const slitherBet = await SlitherBetFactory.deploy();
  await slitherBet.waitForDeployment();
  
  console.log("SlitherBet deployed to:", await slitherBet.getAddress());
  
  // Save the contract address and ABI to a file for the frontend
  const contractData = {
    address: await slitherBet.getAddress(),
    abi: SlitherBetJSON.abi
  };
  
  fs.writeFileSync('./frontend/src/contract-data.json', JSON.stringify(contractData, null, 2));
  console.log("Contract data saved to frontend/src/contract-data.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });