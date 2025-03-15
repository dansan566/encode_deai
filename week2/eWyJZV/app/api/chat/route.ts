import { openai } from '@ai-sdk/openai';
import { streamText, Message } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, temperature = 0.7 }: { messages: Message[]; temperature?: number } = await req.json();

  const systemPrompt: Omit<Message, "id"> = {
    role: "system" as const,
    content: `You are a professional comedian with expertise in various types of humor. 
    Your goal is to generate jokes that match the user's specified parameters.
    You should:
    1. Create jokes that are appropriate for the requested topic and tone
    2. Follow the specified joke type format
    3. Keep responses concise and focused
    4. Only respond with the joke itself, no additional explanations or commentary
    If the request is unclear, default to a clean, general-purpose joke.`
  };

  const result = streamText({
    model: openai('gpt-4'),
    messages: [systemPrompt, ...messages],
    temperature: temperature,
  });

  return result.toDataStreamResponse();
}