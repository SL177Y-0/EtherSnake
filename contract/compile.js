import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Create require function
const require = createRequire(import.meta.url);

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const contractPath = path.resolve(__dirname, 'SlitherBet.sol');
const buildDir = path.resolve(__dirname, '../build/contracts');
const nodeModulesPath = path.resolve(__dirname, '../node_modules');

// Create build directory if it doesn't exist
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

console.log('Compiling contract:', contractPath);

try {
  console.log('Compiling with solcjs...');
  
  // Using solcjs (should be installed with npm)
  const solc = require('solc');
  
  // Read contract source code
  const source = fs.readFileSync(contractPath, 'utf8');
  
  // Import remapping function
  function findImports(importPath) {
    let fullPath;
    
    if (importPath.startsWith('@openzeppelin/')) {
      fullPath = path.resolve(nodeModulesPath, importPath);
    } else {
      fullPath = path.resolve(__dirname, importPath);
    }
    
    try {
      return {
        contents: fs.readFileSync(fullPath, 'utf8')
      };
    } catch (error) {
      console.error('Error loading import:', importPath);
      console.error('Tried path:', fullPath);
      console.error(error);
      return { error: 'File not found' };
    }
  }
  
  // Configure compiler input
  const input = {
    language: 'Solidity',
    sources: {
      'SlitherBet.sol': {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode', 'evm.deployedBytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };
  
  // Check for OpenZeppelin
  console.log('Checking for OpenZeppelin contracts...');
  if (!fs.existsSync(path.join(nodeModulesPath, '@openzeppelin'))) {
    console.log('OpenZeppelin contracts not found, installing...');
    execSync('npm install --legacy-peer-deps @openzeppelin/contracts', { stdio: 'inherit' });
  } else {
    console.log('OpenZeppelin contracts found');
  }
  
  // Compile the contract
  console.log('Compiling contract with solcjs...');
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  
  // Check for errors
  if (output.errors) {
    let hasError = false;
    output.errors.forEach(error => {
      console.error(error.formattedMessage || error.message);
      if (error.severity === 'error') {
        hasError = true;
      }
    });
    
    if (hasError) {
      console.error('Compilation failed with errors');
      process.exit(1);
    }
  }
  
  // Extract contract data
  const contractOutput = output.contracts['SlitherBet.sol']['SlitherBet'];
  const contractData = {
    abi: contractOutput.abi,
    bytecode: contractOutput.evm.bytecode.object
  };
  
  // Write output to build directory
  fs.writeFileSync(
    path.resolve(buildDir, 'SlitherBet.json'),
    JSON.stringify(contractData, null, 2)
  );
  
  console.log('Compilation successful! Output saved to', path.resolve(buildDir, 'SlitherBet.json'));
} catch (error) {
  console.error('Compilation failed:', error);
  process.exit(1);
} 