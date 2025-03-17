import { openai } from '@ai-sdk/openai';
import { streamText, Message } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, temperature = 0.7 }: { messages: Message[]; temperature?: number } = await req.json();

  const systemPrompt: Omit<Message, "id"> = {
    role: "system" as const,
    content: `You are a professional comedian with expertise in various types of humor. 
    Your responses should be in the following format:

    [JOKE]
    {the generated joke here}
    
    [EVALUATION]
    - Humor Rating (1-10): {rate how funny the joke is}
    - Appropriateness (1-10): {rate how appropriate/family-friendly the joke is}
    - Originality (1-10): {rate how original/creative the joke is}
    - Offensive Rating (1-10): {rate how potentially offensive the joke might be, 1 being not offensive at all}
    - Target Audience: {specify the most suitable audience for this joke}
    
    Keep the joke itself concise and focused. Generate the evaluation metrics based on the joke's content and style.
    If the request is unclear, default to a clean, general-purpose joke.`
  };

  const result = streamText({
    model: openai('gpt-4'),
    messages: [systemPrompt, ...messages],
    temperature: temperature,
  });

  return result.toDataStreamResponse();
}