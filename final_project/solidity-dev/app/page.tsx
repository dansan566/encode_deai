"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, Code, AlertTriangle, Wallet, Bot, User, Terminal, Shield, CheckCircle } from "lucide-react"
import SolidityEditor from "@/components/solidity-editor"
import ChatMessage from "@/components/chat-message"
import WalletConnect from "@/components/wallet-connect"
import DeployContract from "@/components/deploy-contract"
import KnowledgeUploader from "@/components/knowledge-uploader"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAccount, useWalletClient } from "wagmi"
import { ethers } from "ethers"

export type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

export default function SolidityDeveloper() {
  const [developerMessages, setDeveloperMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Solidity Developer assistant. How can I help you build your smart contract today?",
    },
  ])
  const [auditorMessages, setAuditorMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I'm your Solidity Auditor. Once you have some code in the editor, I can review it for security issues and best practices.",
    },
  ])
  const [developerInput, setDeveloperInput] = useState("")
  const [auditorInput, setAuditorInput] = useState("")
  const [code, setCode] = useState(`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    string public message;
    
    constructor(string memory initialMessage) {
        message = initialMessage;
    }
    
    function updateMessage(string memory newMessage) public {
        message = newMessage;
    }
}`)
  const [isDeployerLoading, setIsDeployerLoading] = useState(false)
  const [isDeveloperLoading, setIsDeveloperLoading] = useState(false)
  const [isAuditorLoading, setIsAuditorLoading] = useState(false)
  const [isDevCollapsed, setIsDevCollapsed] = useState(false)
  const [isAuditorCollapsed, setIsAuditorCollapsed] = useState(false)
  const [compileError, setCompileError] = useState<string | null>(null)
  const [compileStatus, setCompileStatus] = useState<string | null>(null)
  const [showCompileDialog, setShowCompileDialog] = useState(false)
  const [isCompiling, setIsCompiling] = useState(false)
  const [deployStatus, setDeployStatus] = useState<string | null>(null)
  const [contractAddress, setContractAddress] = useState<string | null>(null)
  const [constructorArgs, setConstructorArgs] = useState<any[]>([])
  const [constructorInputs, setConstructorInputs] = useState<any[]>([])
  const [showConstructorModal, setShowConstructorModal] = useState(false)
  const [pendingDeploy, setPendingDeploy] = useState<{ abi: any; bytecode: string } | null>(null)
  const developerEndRef = useRef<HTMLDivElement>(null)
  const auditorEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const { isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  useEffect(() => {
    if (developerEndRef.current) {
      developerEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [developerMessages])

  useEffect(() => {
    if (auditorEndRef.current) {
      auditorEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [auditorMessages])

  useEffect(() => { setCompileStatus(null) }, [code])

  useEffect(() => {
    if (compileStatus) {
      const timer = setTimeout(() => setCompileStatus(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [compileStatus])

  // Shared streaming chat handler
  const streamChat = async (
    role: "developer" | "auditor",
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    messages: Message[],
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    codeHandler?: (code: string) => void
  ) => {
    if (!input.trim()) return;
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      let assistantContent = "";
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          role,
        }),
      });
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // Handle SSE: may contain multiple JSON lines
          const lines = chunk.split('\n').filter(Boolean);
          for (const line of lines) {
            const jsonStr = line.startsWith('data: ') ? line.slice(6) : line;
            if (jsonStr.trim() === '[DONE]') continue;
            try {
              const data = JSON.parse(jsonStr);
              const token = data.choices?.[0]?.delta?.content;
              if (token) {
                assistantContent += token;
                setMessages((prev) => {
                  const withoutLast = prev.slice(0, -1);
                  return [...withoutLast, { role: "assistant", content: assistantContent }];
                });
              }
            } catch (e) {
              // Ignore lines that aren't valid JSON
            }
          }
        }
      }
      // Optionally extract code for developer or auditor
      if ((role === "developer" || role === "auditor") && codeHandler) {
        const codeMatch = assistantContent.match(/```solidity\n([\s\S]*?)```|```([\s\S]*?)```/);
        const extractedCode = codeMatch?.[1] || codeMatch?.[2];
        if (extractedCode) codeHandler(extractedCode.trim());
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error processing your request." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeveloperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    streamChat(
      "developer",
      developerInput,
      setDeveloperInput,
      developerMessages,
      setDeveloperMessages,
      setIsDeveloperLoading,
      setCode
    );
  };

  const handleAuditorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    streamChat(
      "auditor",
      auditorInput,
      setAuditorInput,
      auditorMessages,
      setAuditorMessages,
      setIsAuditorLoading,
      setCode
    );
  };

  const triggerAudit = async (codeToAudit: string) => {
    setIsAuditorLoading(true)
    try {
      setAuditorMessages((prev) => [
        ...prev,
        { role: "user", content: `Please audit this code:\n\n${codeToAudit}` }
      ])
      setAuditorMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" }
      ])
      let assistantContent = ""
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "user", content: `Please audit this code:\n\n${codeToAudit}` }
          ],
          role: "auditor"
        })
      })
      if (!response.body) throw new Error("No response body")
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter(Boolean)
          for (const line of lines) {
            const jsonStr = line.startsWith('data: ') ? line.slice(6) : line
            if (jsonStr.trim() === '[DONE]') continue
            try {
              const data = JSON.parse(jsonStr)
              const token = data.choices?.[0]?.delta?.content
              if (token) {
                assistantContent += token
                setAuditorMessages((prev) => {
                  const withoutLast = prev.slice(0, -1)
                  return [...withoutLast, { role: "assistant", content: assistantContent }]
                })
              }
            } catch (e) {
              // Ignore lines that aren't valid JSON
            }
          }
        }
      }
    } catch (error) {
      setAuditorMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing the audit request.",
        },
      ])
    } finally {
      setIsAuditorLoading(false)
    }
  }

  const handleDeploy = async () => {
    setIsDeployerLoading(true)
    setDeployStatus(null)
    setContractAddress(null)
    try {
      // 1. Compile code
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      if (!data.success) {
        setDeployStatus("Compilation failed: " + (Array.isArray(data.errors) ? data.errors.join("\n") : data.error))
        setIsDeployerLoading(false)
        return
      }
      // 2. Get ABI and bytecode
      const contractFile = Object.keys(data.output.contracts["Contract.sol"])[0]
      const contract = data.output.contracts["Contract.sol"][contractFile]
      const abi = contract.abi
      const bytecode = contract.evm.bytecode.object
      // Check for constructor inputs
      const constructorAbi = abi.find((item: any) => item.type === "constructor")
      if (constructorAbi && constructorAbi.inputs.length > 0) {
        setConstructorInputs(constructorAbi.inputs)
        setConstructorArgs(Array(constructorAbi.inputs.length).fill(""))
        setPendingDeploy({ abi, bytecode })
        setShowConstructorModal(true)
        setIsDeployerLoading(false)
        return
      }
      // No args, deploy directly
      await deployWithArgs(abi, bytecode, [])
    } catch (err: any) {
      setDeployStatus("Deployment failed: " + (err.message || String(err)))
      setIsDeployerLoading(false)
    }
  }

  const handleConstructorInputChange = (idx: number, value: string) => {
    setConstructorArgs(args => args.map((v, i) => (i === idx ? value : v)))
  }

  const deployWithArgs = async (abi: any, bytecode: string, args: any[]) => {
    try {
      if (!walletClient) {
        setDeployStatus("No wallet connected.")
        return
      }
      const provider = new ethers.BrowserProvider(walletClient)
      const signer = await provider.getSigner()
      const factory = new ethers.ContractFactory(abi, bytecode, signer)
      setDeployStatus("Deploying contract...")
      const contractInstance = await factory.deploy(...args)
      setDeployStatus("Waiting for transaction confirmation...")
      await contractInstance.waitForDeployment()
      setDeployStatus("Contract deployed!")
      setContractAddress(contractInstance.target.toString())
      toast({ title: "Contract deployed", description: contractInstance.target.toString() })
    } catch (err: any) {
      setDeployStatus("Deployment failed: " + (err.message || String(err)))
    } finally {
      setIsDeployerLoading(false)
      setShowConstructorModal(false)
      setPendingDeploy(null)
    }
  }

  const handleConstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pendingDeploy) {
      deployWithArgs(pendingDeploy.abi, pendingDeploy.bytecode, constructorArgs)
    }
  }

  const handleCompile = async () => {
    setCompileError(null)
    setCompileStatus(null)
    setIsCompiling(true)
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      })
      const data = await res.json()
      if (!data.success) {
        setCompileError(Array.isArray(data.errors) ? data.errors.join("\n") : (data.error || "Unknown compile error"))
        setShowCompileDialog(true)
        setIsCompiling(false)
        return
      }
      setCompileStatus("Compilation successful!")
    } catch (err: any) {
      setCompileError(err.message || "Unknown compile error")
      setShowCompileDialog(true)
    } finally {
      setIsCompiling(false)
    }
  }

  const handleSendToAuditor = () => {
    setShowCompileDialog(false)
    setAuditorInput("")
    streamChat(
      "auditor",
      `Please fix this Solidity code so it compiles on Sepolia:\n\n${code}`,
      setAuditorInput,
      auditorMessages,
      setAuditorMessages,
      setIsAuditorLoading,
      setCode
    )
  }

  const simulateDeveloperResponse = (input: string) => {
    // This is a placeholder for actual AI integration
    if (input.toLowerCase().includes("token") || input.toLowerCase().includes("erc20")) {
      return {
        message:
          "I've created a basic ERC20 token contract for you. This implements the standard ERC20 interface with additional minting functionality for the owner.",
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) {
        // Initial supply of 1 million tokens (with 18 decimals)
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}`,
      }
    } else if (input.toLowerCase().includes("nft") || input.toLowerCase().includes("erc721")) {
      return {
        message:
          "Here's an ERC721 NFT contract with minting functionality. It includes URI storage for metadata and basic access control.",
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {}

    function mintNFT(address recipient, string memory tokenURI) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}`,
      }
    } else {
      return {
        message:
          "I've created a simple storage contract with getter and setter functions. This is a basic example to demonstrate Solidity structure.",
        code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 private value;
    address public owner;
    
    event ValueChanged(uint256 newValue);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }
    
    function setValue(uint256 newValue) public onlyOwner {
        value = newValue;
        emit ValueChanged(newValue);
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
    
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}`,
      }
    }
  }

  const simulateAuditorResponse = (codeToAudit: string, input: string) => {
    // This is a placeholder for actual AI integration
    if (codeToAudit.includes("ERC20")) {
      return `**Security Analysis:**

✅ Good use of OpenZeppelin's standard ERC20 implementation
✅ Proper access control with Ownable
⚠️ Consider adding a cap to the total supply
⚠️ The mint function could potentially lead to token inflation if not managed carefully
⚠️ Consider adding events for important state changes

**Recommendations:**
1. Add a maximum cap to prevent unlimited minting
2. Add events for tracking minting operations
3. Consider adding a pause mechanism for emergencies
4. Add documentation for functions`
    } else if (codeToAudit.includes("ERC721")) {
      return `**Security Analysis:**

✅ Good use of OpenZeppelin's ERC721URIStorage
✅ Proper access control with Ownable
✅ Using Counters for token ID management
⚠️ No validation for tokenURI parameter
⚠️ Consider adding batch minting for gas efficiency

**Recommendations:**
1. Add validation for the tokenURI parameter
2. Consider implementing a batch mint function
3. Add royalty support (ERC2981)
4. Consider adding a mechanism to pause minting`
    } else {
      return `**Security Analysis:**

✅ Good use of events for state changes
✅ Proper access control with owner check
✅ View function doesn't modify state
⚠️ No reentrancy protection (though not needed in this simple contract)
⚠️ No input validation for setValue

**Recommendations:**
1. Add input validation for the setValue function
2. Consider using OpenZeppelin's Ownable contract instead of custom implementation
3. Add more detailed error messages
4. Consider adding a function to renounce ownership if needed`
    }
  }

  return (
    <div className="h-screen flex flex-col p-4 gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Solidity Developer</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v0.1.0</Badge>
          <KnowledgeUploader />
          <WalletConnect />
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border">
        {/* Developer Panel or Sidebar */}
        <ResizablePanel defaultSize={isDevCollapsed ? 5 : 30} minSize={isDevCollapsed ? 5 : 20} maxSize={isDevCollapsed ? 5 : 40} collapsible onCollapse={() => setIsDevCollapsed((v) => !v)}>
          <div className="relative h-full">
            <button
              className="absolute top-2 right-2 z-10 rounded p-1 bg-background hover:bg-accent border shadow"
              onClick={() => setIsDevCollapsed((v) => !v)}
              aria-label={isDevCollapsed ? 'Expand Developer' : 'Collapse Developer'}
              type="button"
            >
              {isDevCollapsed ? <Bot className="h-5 w-5 text-primary" /> : <span>&#x25C0;</span>}
            </button>
            {isDevCollapsed ? (
              <div className="flex flex-col items-center justify-center h-full select-none">
                <span className="transform -rotate-90 text-xs font-semibold text-muted-foreground">Developer</span>
              </div>
            ) : (
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle>Developer Assistant</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4 pr-2 max-w-full">
                      {developerMessages.map((message, index) => (
                        <ChatMessage key={index} role={message.role} content={message.content} />
                      ))}
                      <div ref={developerEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t">
                  <form onSubmit={handleDeveloperSubmit} className="flex w-full gap-2">
                    <Input
                      placeholder="Ask the developer assistant..."
                      value={developerInput}
                      onChange={(e) => setDeveloperInput(e.target.value)}
                      disabled={isDeveloperLoading}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="submit" size="icon" disabled={isDeveloperLoading}>
                            {isDeveloperLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </form>
                </CardFooter>
              </Card>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Code Editor */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <Card className="h-full flex flex-col relative">
            <CardHeader className="flex flex-row items-center gap-2 py-3">
              <Code className="h-5 w-5 text-primary" />
              <CardTitle>Code Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 h-[calc(100%-3.5rem)] overflow-hidden">
              <SolidityEditor 
                value={code}
                onChange={setCode}
                onAudit={() => triggerAudit(code)}
                onCompile={handleCompile}
                isCompiling={isCompiling}
              />
              {compileStatus && (
                <div className="absolute bottom-8 right-8 z-40">
                  <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
                    <CheckCircle className="h-5 w-5" />
                    <span>{compileStatus}</span>
                    <button
                      className="ml-2 text-white/80 hover:text-white text-lg leading-none"
                      onClick={() => setCompileStatus(null)}
                      aria-label="Dismiss"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ResizablePanel>

        <ResizableHandle />

        {/* Auditor Panel or Sidebar */}
        <ResizablePanel defaultSize={isAuditorCollapsed ? 5 : 30} minSize={isAuditorCollapsed ? 5 : 20} maxSize={isAuditorCollapsed ? 5 : 40} collapsible onCollapse={() => setIsAuditorCollapsed((v) => !v)}>
          <div className="relative h-full">
            <button
              className="absolute top-2 left-2 z-10 rounded p-1 bg-background hover:bg-accent border shadow"
              onClick={() => setIsAuditorCollapsed((v) => !v)}
              aria-label={isAuditorCollapsed ? 'Expand Auditor' : 'Collapse Auditor'}
              type="button"
            >
              {isAuditorCollapsed ? <Shield className="h-5 w-5 text-primary" /> : <span>&#x25B6;</span>}
            </button>
            {isAuditorCollapsed ? (
              <div className="flex flex-col items-center justify-center h-full select-none">
                <span className="transform -rotate-90 text-xs font-semibold text-muted-foreground">Auditor</span>
              </div>
            ) : (
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center gap-2 py-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Security Auditor</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-4 pr-2 max-w-full">
                      {auditorMessages.map((message, index) => (
                        <ChatMessage key={index} role={message.role} content={message.content} />
                      ))}
                      <div ref={auditorEndRef} />
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t">
                  <form onSubmit={handleAuditorSubmit} className="flex w-full gap-2">
                    <Input
                      placeholder="Ask the security auditor..."
                      value={auditorInput}
                      onChange={(e) => setAuditorInput(e.target.value)}
                      disabled={isAuditorLoading}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="submit" size="icon" disabled={isAuditorLoading}>
                            {isAuditorLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </form>
                </CardFooter>
              </Card>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Card className="flex-shrink-0 mt-4">
        <CardHeader className="py-3">
          <CardTitle>Deploy Contract</CardTitle>
          <CardDescription>Deploy your smart contract to the selected network</CardDescription>
        </CardHeader>
        <CardContent>
          <DeployContract
            code={code}
            isLoading={isDeployerLoading}
            onDeploy={handleDeploy}
          />
          {deployStatus && (
            <div className="mt-2 text-sm">
              <div>{deployStatus}</div>
              {contractAddress && (
                <div>
                  <span className="font-semibold">Contract Address:</span>
                  <a
                    href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 underline text-primary"
                  >
                    {contractAddress}
                  </a>
                </div>
              )}
            </div>
          )}
          {/* Constructor Modal */}
          {showConstructorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <form onSubmit={handleConstructorSubmit} className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 max-w-lg w-full">
                <h2 className="text-lg font-semibold mb-4">Enter Constructor Arguments</h2>
                {constructorInputs.map((input, idx) => (
                  <div className="mb-3 flex flex-col" key={idx}>
                    <label className="mb-1 font-medium text-sm">
                      {input.name || `arg${idx+1}`} <span className="text-xs text-muted-foreground">({input.type})</span>
                    </label>
                    <input
                      className="border px-2 py-1 rounded bg-background"
                      type="text"
                      value={constructorArgs[idx]}
                      onChange={e => handleConstructorInputChange(idx, e.target.value)}
                      required
                    />
                  </div>
                ))}
                <div className="flex gap-2 justify-end mt-4">
                  <Button variant="outline" type="button" onClick={() => setShowConstructorModal(false)}>Cancel</Button>
                  <Button variant="default" type="submit">Deploy</Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compile Error Dialog */}
      {showCompileDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-lg font-semibold mb-2">Compilation failed</h2>
            <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded mb-4 max-h-40 overflow-auto whitespace-pre-wrap">{compileError}</pre>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCompileDialog(false)}>Cancel</Button>
              <Button variant="default" onClick={handleSendToAuditor}>Send to Auditor to Fix</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
