import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SlitherBet - Blockchain Betting Game",
  description: "A Slither.io-like betting game on the Sepolia testnet",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="flex flex-col min-h-screen">
      <body className={`${inter.className} flex flex-col flex-grow`}>
        <header className="text-center py-2 text-xs text-gray-400 bg-gray-900 border-b border-gray-700">
          Powered By Cluster Protocol / Made By CodeXero
        </header>
        <main className="flex-grow">
          <Providers>{children}</Providers>
        </main>
        <footer className="text-center py-2 text-xs text-gray-400 bg-gray-900 border-t border-gray-700">
          Powered By Cluster Protocol / Made By CodeXero
        </footer>
      </body>
    </html>
  )
}
