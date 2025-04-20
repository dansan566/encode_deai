import OpenAI from 'openai'

export const runtime = "edge"

export type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

const developerSystemPrompt = `You are a Solidity development expert. Your role is to help users write, debug, and optimize Solidity smart contracts. 
Provide clear, concise, and accurate responses. When showing code examples, always use proper Solidity syntax and follow best practices.
Focus on:
1. Code implementation and optimization
2. Best practices and patterns
3. Debugging assistance
4. Gas optimization tips
5. Solidity version-specific features`

const auditorSystemPrompt = `You are a smart contract security auditor. Your role is to analyze Solidity code for vulnerabilities and security best practices.
Provide detailed security assessments and recommendations. Focus on:
1. Common vulnerabilities (reentrancy, overflow, etc.)
2. Access control issues
3. Gas optimization and efficiency
4. Code quality and maintainability
5. Compliance with security standards`

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  const { messages, role }: { messages: Message[]; role: "developer" | "auditor" } = await request.json();
  const systemPrompt = role === "auditor" ? auditorSystemPrompt : developerSystemPrompt;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    temperature: 0.7,
    stream: true,
  });

  // Get a ReadableStream for the response (works in Edge and Node runtimes)
  let stream: any = null;
  if (typeof completion.toReadableStream === "function") {
    stream = completion.toReadableStream();
  } else if (completion.body) {
    // @ts-expect-error: body may exist
    stream = completion.body;
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