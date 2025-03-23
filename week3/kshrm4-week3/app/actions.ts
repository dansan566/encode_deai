// app/actions.ts
// handle the AI call to generate story
'use server';

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function generateStory(prompt: string) {
  // Use the AI SDK to stream the story
  const result = await streamText({
    model: openai('gpt-3.5-turbo'),
    prompt: `Generate a story based on the following prompt: ${prompt}`,
  });

  // Return the streamed text as a DataStreamResponse
  return result.toDataStreamResponse();
}