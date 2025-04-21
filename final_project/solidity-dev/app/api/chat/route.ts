import OpenAI from 'openai'
import { VectorStore } from '@/lib/vector-store'
import path from 'path'

export const runtime = "nodejs" // Need nodejs for file access

export type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

const developerSystemPrompt = `You are a Solidity expert. Provide concise, accurate responses focused on implementation.
When answering questions:
1. Begin with a brief explanation (2-3 sentences max)
2. Always provide complete, ready-to-use Solidity code
3. Focus on gas optimization and security best practices
4. Use the latest Solidity syntax where appropriate
5. Include critical imports and inherited contracts

Be direct and practical - prioritize working code over lengthy explanations.`

const auditorSystemPrompt = `You are a smart contract security auditor. Analyze Solidity code with security as the top priority.
When reviewing code:
1. List vulnerabilities as numbered bullet points (critical first)
2. For each issue: briefly explain the risk and exact location
3. Always provide a corrected code snippet for each vulnerability
4. If the contract has multiple issues, provide a complete rewritten version
5. Check for: reentrancy, access control, overflow, gas optimization, logic errors

Format: [CRITICAL/HIGH/MEDIUM/LOW] Issue name - Brief explanation`

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const vectorStore = new VectorStore(openai, path.join(process.cwd(), 'data', 'vector-store.json'))

export async function POST(request: Request) {
  const { messages, role }: { messages: Message[]; role: "developer" | "auditor" } = await request.json();
  const systemPrompt = role === "auditor" ? auditorSystemPrompt : developerSystemPrompt;
  
  // Get the user's last message
  const lastUserMessage = [...messages].reverse().find(msg => msg.role === "user");
  
  let contextualKnowledge = "";
  
  // If we have a user message, enhance with RAG
  if (lastUserMessage) {
    try {
      // Search for relevant knowledge
      const results = await vectorStore.findSimilar(lastUserMessage.content, 3);
      
      if (results.length > 0) {
        contextualKnowledge = "Here is some relevant information that might help:\n\n";
        
        for (const result of results) {
          contextualKnowledge += `--- ${result.metadata.title || 'Document'} (${result.metadata.source}) ---\n`;
          contextualKnowledge += result.text + "\n\n";
        }
      }
    } catch (error) {
      console.error("Error retrieving RAG context:", error);
      // Continue without RAG if there's an error
    }
  }
  
  // Create enhanced system prompt with RAG
  const enhancedSystemPrompt = contextualKnowledge 
    ? `${systemPrompt}\n\n${contextualKnowledge}`
    : systemPrompt;
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: enhancedSystemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    stream: true,
  });

  // Get a ReadableStream for the response (works in Edge and Node runtimes)
  let stream: any = null;
  if (typeof completion.toReadableStream === "function") {
    stream = completion.toReadableStream();
  } else {
    throw new Error("No valid stream returned from OpenAI SDK");
  }

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    },
  });
}