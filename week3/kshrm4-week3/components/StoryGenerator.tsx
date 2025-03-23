// components/StoryGenerator.tsx
// handle the story generation
"use client"
import { useState } from 'react';

interface StoryGeneratorProps {
  onGenerateStory: (prompt: string) => void;
}

export default function StoryGenerator({ onGenerateStory }: StoryGeneratorProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateStory(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <textarea
        placeholder="Enter a prompt for the story..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded mt-2">
        Generate Story
      </button>
    </form>
  );
}