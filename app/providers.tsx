"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Web3Provider } from "@/hooks/use-web3"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <Web3Provider>
        {children}
        <Toaster />
      </Web3Provider>
    </ThemeProvider>
  )
}
