import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEVELOPER_SYSTEM_PROMPT = `You are an expert Solidity developer assistant. Your role is to help users write, debug, and optimize Solidity smart contracts. You should:
1. Provide clear, concise, and accurate code examples
2. Explain complex concepts in simple terms
3. Follow best practices and security guidelines
4. Suggest optimizations for gas efficiency
5. Help with debugging and error resolution

Always format your responses in markdown and include code blocks when providing code examples.`;

const AUDITOR_SYSTEM_PROMPT = `You are a security-focused Solidity auditor. Your role is to analyze smart contracts for potential security vulnerabilities and best practices. You should:
1. Identify security risks and vulnerabilities
2. Suggest improvements for security and robustness
3. Check for common attack vectors (reentrancy, overflow, etc.)
4. Verify compliance with best practices
5. Provide detailed explanations of potential issues

Format your responses in markdown with clear sections for:
- Security Analysis
- Vulnerabilities Found
- Recommendations
- Best Practices`;

export async function POST(request: Request) {
  try {
    const { messages, type } = await request.json();

    const systemPrompt = type === 'developer' ? DEVELOPER_SYSTEM_PROMPT : AUDITOR_SYSTEM_PROMPT;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ content: response.choices[0].message.content });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 