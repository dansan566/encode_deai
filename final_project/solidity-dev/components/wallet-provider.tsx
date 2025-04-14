"use client"

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { http, createConfig, WagmiProvider } from 'wagmi'
import { mainnet, sepolia, goerli } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { injected } from 'wagmi/connectors'
import { useState, useEffect } from 'react'

const chains = [mainnet, sepolia, goerli] as const

const { connectors } = getDefaultWallets({
  appName: 'Solidity Developer',
  projectId: 'YOUR_PROJECT_ID', // Get this from https://cloud.walletconnect.com/
})

const config = createConfig({
  chains,
  connectors: [
    injected(),
    ...connectors,
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [goerli.id]: http(),
  },
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
} 