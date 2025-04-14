"use client"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAccount } from "wagmi"

interface DeployContractProps {
  code: string
  isLoading: boolean
  onDeploy: () => void
}

export default function DeployContract({ code, isLoading, onDeploy }: DeployContractProps) {
  const { isConnected } = useAccount()

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={onDeploy}
        disabled={!isConnected || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deploying...
          </>
        ) : (
          "Deploy Contract"
        )}
      </Button>
      {!isConnected && (
        <p className="text-sm text-muted-foreground text-center">
          Please connect your wallet to deploy
        </p>
      )}
    </div>
  )
}
