"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { type ethers, BrowserProvider, Contract } from "ethers"
import { useToast } from "@/hooks/use-toast"
import { CONTRACT_ABI, CONTRACT_ADDRESS, getContract } from "@/lib/contract"

// Add ethereum to window type
declare global {
  interface Window {
    ethereum?: any
  }
}

// Create the Web3 context
interface Web3ContextType {
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  contract: Contract | null
  address: string | null
  chainId: number | null
  connectWallet: () => Promise<void>
  isConnecting: boolean
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  contract: null,
  address: null,
  chainId: null,
  connectWallet: async () => {},
  isConnecting: false,
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [contract, setContract] = useState<Contract | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Initialize provider on client-side
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new BrowserProvider(window.ethereum)
      setProvider(provider)

      // Check if already connected
      provider
        .listAccounts()
        .then((accounts) => {
          if (accounts.length > 0) {
            connectWalletInternal(provider)
          }
        })
        .catch(console.error)

      // Listen for account changes
      window.ethereum.on("accountsChanged", () => {
        window.location.reload()
      })

      // Listen for chain changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })
    }
  }, [])

  const connectWalletInternal = async (provider: ethers.BrowserProvider) => {
    try {
      setIsConnecting(true)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const { chainId } = await provider.getNetwork()

      setSigner(signer)
      setAddress(address)
      setChainId(Number(chainId))

      // Initialize contract using our contract interface
      const contract = getContract(signer)
      setContract(contract)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const connectWallet = async () => {
    if (!provider) {
      toast({
        title: "No Provider",
        description: "Please install MetaMask or another Web3 wallet.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)
      // Request account access
      await provider.send("eth_requestAccounts", [])
      await connectWalletInternal(provider)
    } catch (error) {
      console.error("User rejected connection:", error)
      toast({
        title: "Connection Rejected",
        description: "You rejected the connection request.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        address,
        chainId,
        connectWallet,
        isConnecting,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  return useContext(Web3Context)
}
