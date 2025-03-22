
// components/AIPrompt.tsx
// Add a text area for the AI prompt and a button to generate the story
"use client";

import { useState } from "react";
import { Character } from "../types/Character";

export default function AIPrompt() {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState("");
  const [characterRoles, setCharacterRoles] = useState<Record<string, string>>({});

  const generateStory = async () => {
    const response = await fetch("/api/generate-story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    setStory(data.story);
    setCharacterRoles(data.characterRoles);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">AI Story Generator</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        placeholder="Enter a prompt for the story..."
      />
      <button
        onClick={generateStory}
        className="p-2 bg-green-500 text-white rounded"
      >
        Generate Story
      </button>
      {story && (
        <div className="mt-4">
          <h3 className="text-lg font-bold">Generated Story</h3>
          <p className="mt-2">{story}</p>
          <h3 className="text-lg font-bold mt-4">Character Roles</h3>
          <ul>
            {Object.entries(characterRoles).map(([name, role]) => (
              <li key={name} className="mt-2">
                <strong>{name}:</strong> {role}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}