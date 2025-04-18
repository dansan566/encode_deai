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
import { Loader2, Send, Code, AlertTriangle, Wallet, Bot, User, Terminal, Shield } from "lucide-react"
import SolidityEditor from "@/components/solidity-editor"
import ChatMessage from "@/components/chat-message"
import WalletConnect from "@/components/wallet-connect"
import DeployContract from "@/components/deploy-contract"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getDeveloperResponse, getAuditorResponse, type Message } from "@/lib/openai"

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
  const developerEndRef = useRef<HTMLDivElement>(null)
  const auditorEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

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

  const handleDeveloperSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!developerInput.trim()) return

    const userMessage: Message = { role: "user", content: developerInput }
    setDeveloperMessages((prev) => [...prev, userMessage])
    setDeveloperInput("")
    setIsDeveloperLoading(true)

    try {
      const response = await getDeveloperResponse([...developerMessages, userMessage])
      setDeveloperMessages((prev) => [
        ...prev,
        { role: "assistant", content: response || "Sorry, I couldn't process your request." }
      ])

      // Extract Solidity code block if present
      if (response) {
        // Matches ```solidity\n...``` or ```...```
        const codeMatch = response.match(/```solidity\n([\s\S]*?)```|```([\s\S]*?)```/)
        const extractedCode = codeMatch?.[1] || codeMatch?.[2]
        if (extractedCode) {
          setCode(extractedCode.trim())
        }
      }
    } catch (error) {
      console.error("Error getting developer response:", error)
      setDeveloperMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error processing your request." }
      ])
    } finally {
      setIsDeveloperLoading(false)
    }
  }

  const handleAuditorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auditorInput.trim()) return

    const userMessage: Message = { role: "user", content: auditorInput }
    setAuditorMessages((prev) => [...prev, userMessage])
    setAuditorInput("")
    setIsAuditorLoading(true)

    try {
      const response = await getAuditorResponse([...auditorMessages, userMessage])
      setAuditorMessages((prev) => [...prev, { role: "assistant", content: response || "Sorry, I couldn't process your request." }])
    } catch (error) {
      console.error("Error getting auditor response:", error)
      setAuditorMessages((prev) => [...prev, { role: "assistant", content: "Sorry, there was an error processing your request." }])
    } finally {
      setIsAuditorLoading(false)
    }
  }

  const triggerAudit = async (codeToAudit: string) => {
    setIsAuditorLoading(true)

    try {
      const response = await getAuditorResponse([
        { role: "user", content: `Please audit this code:\n\n${codeToAudit}` } as Message
      ])
      setAuditorMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I've analyzed the new code:\n\n${response || "Sorry, I couldn't process your request."}`,
        } as Message,
      ])
    } catch (error) {
      console.error("Error getting audit response:", error)
      setAuditorMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, there was an error processing the audit request.",
        } as Message,
      ])
    } finally {
      setIsAuditorLoading(false)
    }
  }

  const handleDeploy = () => {
    setIsDeployerLoading(true)

    // Simulate deployment
    setTimeout(() => {
      toast({
        title: "Contract deployed",
        description: "Contract successfully deployed to the network",
      })
      setIsDeployerLoading(false)
    }, 2000)
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
    <div className="h-screen flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Solidity Developer</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">v0.1.0</Badge>
          <WalletConnect />
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border">
        <ResizablePanel defaultSize={30} minSize={20}>
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <CardTitle>Developer Assistant</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
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
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={40} minSize={30}>
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <CardTitle>Code Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 h-[calc(100%-3.5rem)]">
              <SolidityEditor value={code} onChange={setCode} onAudit={() => triggerAudit(code)} />
            </CardContent>
          </Card>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={30} minSize={20}>
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security Auditor</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
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
        </ResizablePanel>
      </ResizablePanelGroup>

      <Card>
        <CardHeader>
          <CardTitle>Deploy Contract</CardTitle>
          <CardDescription>Deploy your smart contract to the selected network</CardDescription>
        </CardHeader>
        <CardContent>
          <DeployContract
            code={code}
            isLoading={isDeployerLoading}
            onDeploy={handleDeploy}
          />
        </CardContent>
      </Card>
    </div>
  )
}
