// app/api/generate-story/route.ts
// generate the story with AI
import { NextResponse } from 'next/server';
import { Character } from '@/types/character';

export async function POST(request: Request) {
  const { characters, prompt } = await request.json();

  // Call your AI API (e.g., OpenAI) to generate a story
  const story = await generateStoryWithAI(characters, prompt);

  // Generate character summaries
  const summaries = characters.map((character: Character) => ({
    name: character.name,
    role: `Role in story: ${character.personality}`,
  }));

  return NextResponse.json({ story, summaries });
}

async function generateStoryWithAI(characters: Character[], prompt: string) {
  // Replace with actual AI API call
  return `Once upon a time, ${characters.map((c) => c.name).join(', ')} went on an adventure. ${prompt}`;
}