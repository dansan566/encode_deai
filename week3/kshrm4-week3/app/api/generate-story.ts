// pages/api/generate-story.ts
// ask AI to generate the story
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;

  // Call your AI service (e.g., OpenAI GPT) here
  const story = "Once upon a time..."; // Replace with AI-generated story
  const characterRoles = {
    "Character 1": "Played a key role in the story.",
    "Character 2": "Was the hero of the story.",
  };

  res.status(200).json({ story, characterRoles });
}