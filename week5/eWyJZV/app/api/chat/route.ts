import { openai } from '@ai-sdk/openai';
import { streamText, Message } from 'ai';
import { Character } from '@/app/components/CharacterManager';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, temperature = 0.7, characters = [] }: { 
    messages: Message[]; 
    temperature?: number;
    characters?: Character[];
  } = await req.json();

  const characterPrompt = characters.length > 0 
    ? `\nYou have access to the following characters that should be included in your jokes and stories:
${characters.map(char => `- ${char.name}: ${char.description} (Personality: ${char.personality})`).join('\n')}

When generating jokes or stories with these characters, make sure to:
1. Stay true to their described personalities and characteristics
2. Create interactions that make sense for their characters
3. After the joke, provide a brief summary of each character's role in the story

Your response format when using characters should be:

[JOKE]
{the generated joke/story here}

[CHARACTER ROLES]
{for each character, provide a 1-2 sentence summary of their role in the story}

[EVALUATION]
{standard evaluation metrics}`
    : '';

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
    If the request is unclear, default to a clean, general-purpose joke.${characterPrompt}`
  };

  const result = streamText({
    model: openai('gpt-4'),
    messages: [systemPrompt, ...messages],
    temperature: temperature,
  });

  return result.toDataStreamResponse();
}