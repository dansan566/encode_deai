"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import Editor from "@monaco-editor/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SolidityEditorProps {
  value: string
  onChange: (value: string) => void
  onAudit: () => void
  onCompile: () => void
  isCompiling: boolean
}

export default function SolidityEditor({ value, onChange, onAudit, onCompile, isCompiling }: SolidityEditorProps) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors with Monaco editor
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden">
        {mounted && (
          <Editor
            height="100%"
            defaultLanguage="sol"
            value={value}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        )}
      </div>
      <div className="p-3 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-end gap-2 flex-shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onAudit} className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" />
                <span>Audit Code</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Run security audit on the code</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="default" size="sm" className="flex items-center gap-1.5" onClick={onCompile} disabled={isCompiling}>
                {isCompiling ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                <span>Compile</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Compile the Solidity code</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
