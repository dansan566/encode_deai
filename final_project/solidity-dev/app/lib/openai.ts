import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type Message = {
  role: 'user' | 'assistant' | 'system'
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

export async function getDeveloperResponse(messages: Message[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: developerSystemPrompt },
      ...messages,
    ],
    temperature: 0.7,
  })

  return response.choices[0].message.content
}

export async function getAuditorResponse(messages: Message[]) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: auditorSystemPrompt },
      ...messages,
    ],
    temperature: 0.7,
  })

  return response.choices[0].message.content
} 