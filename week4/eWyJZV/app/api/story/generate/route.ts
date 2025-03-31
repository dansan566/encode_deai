import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'llamaindex';

interface Character {
  name: string;
  description: string;
  personality: string;
}

export async function POST(req: NextRequest) {
  try {
    const { characters, prompt, characterDetails } = await req.json();

    if (!characters || !prompt || !characterDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize the LLM
    const llm = new OpenAI({
      model: process.env.MODEL || 'gpt-3.5-turbo',
      temperature: 0.7,
    });

    // Create a prompt that includes character information
    const characterPrompt = characters.map((name: string) => {
      const character = characterDetails.find((c: Character) => c.name === name);
      return `
Character: ${character.name}
Description: ${character.description}
Personality: ${character.personality}
`;
    }).join('\n');

    const fullPrompt = `Using the following characters and their details, create a story based on this prompt: "${prompt}"

${characterPrompt}

Please write a creative story that:
1. Incorporates the selected characters naturally
2. Maintains their personalities and characteristics
3. Creates an engaging narrative
4. Has a clear beginning, middle, and end

Format the response as a JSON object with the following structure:
{
  "title": "Story Title",
  "content": "Story content here..."
}`;

    // Generate the story using the LLM
    const response = await llm.chat({
      messages: [{ role: 'user', content: fullPrompt }],
    });

    // Clean and parse the response
    const responseText = response.message.content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const story = JSON.parse(responseText);

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
} 