import { ethers } from "ethers";
import fs from "fs";

async function main() {
  // Connect to the Sepolia network
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
  
  console.log("Deploying contracts with the account:", wallet.address);
  
  // Read the compiled contract (assuming you've compiled it)
  const SlitherBetJSON = JSON.parse(fs.readFileSync('./artifacts/contracts/SlitherBet.sol/SlitherBet.json', 'utf8'));
  
  // Deploy the contract
  const SlitherBetFactory = new ethers.ContractFactory(
    SlitherBetJSON.abi,
    SlitherBetJSON.bytecode,
    wallet
  );
  
  const slitherBet = await SlitherBetFactory.deploy();
  await slitherBet.waitForDeployment();
  
  const contractAddress = await slitherBet.getAddress();
  console.log("SlitherBet deployed to:", contractAddress);
  
  // Save the contract address and ABI to a file for the frontend
  const contractData = {
    address: contractAddress,
    abi: SlitherBetJSON.abi
  };
  
  fs.writeFileSync('./frontend/src/contract-data.json', JSON.stringify(contractData, null, 2));
  console.log("Contract data saved to frontend/src/contract-data.json");
  
  console.log("Waiting for contract verification...");
  // Wait for 5 block confirmations before verifying
  await slitherBet.deploymentTransaction()?.wait(5);
  
  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });