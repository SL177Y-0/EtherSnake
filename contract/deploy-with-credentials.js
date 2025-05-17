import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Use the provided credentials directly
  const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/jom_1nyUaRm9YLQkgS-g9ZHrTE9L9nH_";
  const ADMIN_PRIVATE_KEY = "b6b63ec4dcfc4de6c4788b0143dc8c2d5bb7943fc2843326b2dc9d81f8d9c4ec";
  
  // Connect to the Sepolia network
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
  
  console.log("Deploying contracts with the account:", wallet.address);
  
  // Compile the contract first (we need to compile it manually since we're not using Hardhat)
  console.log("Compiling contract...");
  
  // If using solc directly (requires solc to be installed):
  // For this example, we'll assume the contract is already compiled
  
  try {
    // Read the compiled contract from the build directory
    const buildDir = path.resolve(__dirname, '../build/contracts');
    
    // Check if build directory exists, if not create it
    if (!fs.existsSync(buildDir)) {
      console.log("Build directory not found. Please compile the contract first using solc or hardhat.");
      process.exit(1);
    }
    
    const contractPath = path.resolve(buildDir, 'SlitherBet.json');
    
    if (!fs.existsSync(contractPath)) {
      console.log("Compiled contract not found. Please compile the contract first.");
      process.exit(1);
    }
    
    const SlitherBetJSON = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    
    // Deploy the contract
    console.log("Deploying contract...");
    const SlitherBetFactory = new ethers.ContractFactory(
      SlitherBetJSON.abi,
      SlitherBetJSON.bytecode,
      wallet
    );
    
    const slitherBet = await SlitherBetFactory.deploy();
    
    // Get the transaction hash of the deployment
    const tx = slitherBet.deploymentTransaction();
    if (tx) {
      console.log("Transaction hash:", tx.hash);
    }
    
    console.log("Waiting for confirmation...");
    await slitherBet.waitForDeployment();
    
    const contractAddress = await slitherBet.getAddress();
    console.log("SlitherBet deployed to:", contractAddress);
    
    // Save the contract address and ABI to a file for the frontend
    const contractData = {
      address: contractAddress,
      abi: SlitherBetJSON.abi
    };
    
    // Create lib directory if it doesn't exist
    const libDir = path.resolve(__dirname, '../lib');
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }
    
    // Save contract data to lib directory for Next.js to use
    const contractDataPath = path.resolve(libDir, 'contract-data.json');
    fs.writeFileSync(contractDataPath, JSON.stringify(contractData, null, 2));
    console.log("Contract data saved to:", contractDataPath);
    
    // Also update the web3 hook with the new address
    updateContractAddress(contractAddress);
    
    // Wait for block confirmations
    if (tx) {
      console.log("Waiting for 2 block confirmations...");
      await tx.wait(2);
      console.log("Contract confirmed on the blockchain");
    }
    
    console.log("Deployment complete!");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

function updateContractAddress(address) {
  try {
    const web3HookPath = path.resolve(__dirname, '../hooks/use-web3.tsx');
    let web3Hook = fs.readFileSync(web3HookPath, 'utf8');
    
    // Replace the CONTRACT_ADDRESS in the hook file
    web3Hook = web3Hook.replace(
      /const CONTRACT_ADDRESS = ".*"/,
      `const CONTRACT_ADDRESS = "${address}"`
    );
    
    fs.writeFileSync(web3HookPath, web3Hook);
    console.log("Contract address updated in hooks/use-web3.tsx");
  } catch (error) {
    console.error("Failed to update contract address in hook:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 