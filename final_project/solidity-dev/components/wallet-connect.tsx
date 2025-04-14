"use client"

import { useAccount, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent } from "@/components/ui/card"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <Card>
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Connected Wallet</p>
            <p className="text-sm text-muted-foreground">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => disconnect()}>
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <ConnectButton />
}
