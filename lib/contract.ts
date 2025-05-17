import { Contract, BrowserProvider, type JsonRpcSigner } from 'ethers';
import fs from 'fs';
import path from 'path';

// Default contract ABI and address
// This will be replaced with the actual data once the contract is deployed
const DEFAULT_CONTRACT_DATA = {
  address: "0xE3abd426A9aa080321cE0dC9BB6c41A73d4B1b0E",
  abi: [
    "function eventCount() view returns (uint256)",
    "function createEvent(uint256 _duration) external",
    "function joinEvent(uint256 _eventId, string memory _nickname) external payable",
    "function submitScore(uint256 _eventId, uint256 _score) external",
    "function closeEvent(uint256 _eventId) external",
    "function getEventDetails(uint256 _eventId) external view returns (uint256, uint256, uint256, uint256, address, bool, bool, address, uint256)",
    "function getPlayerCount(uint256 _eventId) external view returns (uint256)",
    "function getPlayerDetails(uint256 _eventId, address _player) external view returns (address, string memory, uint256, bool)",
    "function getEventPlayers(uint256 _eventId) external view returns (address[] memory)",
    "function getTimeRemaining(uint256 _eventId) external view returns (uint256)",
    "event EventCreated(uint256 eventId, address creator)",
    "event PlayerJoined(uint256 eventId, address player, string nickname)",
    "event ScoreSubmitted(uint256 eventId, address player, uint256 score)",
    "event EventClosed(uint256 eventId, address winner)"
  ]
};

// Load contract data function - to be called within components that need it
export function loadContractData() {
  // For client-side, we'll use the default data which will be replaced when the contract is deployed
  return DEFAULT_CONTRACT_DATA;
}

// Export default values that can be used statically
export const CONTRACT_ADDRESS = DEFAULT_CONTRACT_DATA.address;
export const CONTRACT_ABI = DEFAULT_CONTRACT_DATA.abi;

// Helper to get contract instance with signer
export function getContract(signerOrProvider: JsonRpcSigner | BrowserProvider): Contract {
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

// Types for contract entities
export interface Player {
  playerAddress: string;
  nickname: string;
  score: number;
  hasSubmittedScore: boolean;
}

export interface Event {
  id: number;
  startTime: number;
  duration: number;
  prizePool: number;
  creator: string;
  isActive: boolean;
  isPrizeClaimed: boolean;
  winner: string;
  highestScore: number;
}

// Parsed event details
export function parseEventDetails(eventDetails: any[]): Event {
  return {
    id: Number(eventDetails[0]),
    startTime: Number(eventDetails[1]),
    duration: Number(eventDetails[2]),
    prizePool: Number(eventDetails[3]),
    creator: eventDetails[4],
    isActive: eventDetails[5],
    isPrizeClaimed: eventDetails[6],
    winner: eventDetails[7],
    highestScore: Number(eventDetails[8])
  };
}

// Parsed player details
export function parsePlayerDetails(playerDetails: any[]): Player {
  return {
    playerAddress: playerDetails[0],
    nickname: playerDetails[1],
    score: Number(playerDetails[2]),
    hasSubmittedScore: playerDetails[3]
  };
} 