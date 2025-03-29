// components/CharacterManager.tsx
// handle the character management
'use client'
import { useState } from 'react';
import AddCharacterForm from '@/components/AddCharacterForm';
import CharacterTable from '@/components/CharacterTable';
import StoryGenerator from '@/components/StoryGenerator';
import { Character } from '@/types/character';

interface CharacterManagerProps {
  initialCharacters: Character[];
}

export default function CharacterManager({ initialCharacters }: CharacterManagerProps) {
  const [characters, setCharacters] = useState<Character[]>(initialCharacters);
  const [story, setStory] = useState('');
  const [summaries, setSummaries] = useState<{ name: string; role: string }[]>([]);

  const fetchCharacters = async () => {
    const response = await fetch('/api/characters');
    const data = await response.json();
    setCharacters(data);
  };

  const handleAddCharacter = async (character: Omit<Character, 'id'>) => {
    await fetch('/api/characters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(character),
    });
    fetchCharacters(); // Refresh the character list
  };

  const handleDeleteCharacter = async (id: string) => {
    await fetch('/api/characters', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchCharacters(); // Refresh the character list
  };

  const handleGenerateStory = async (prompt: string) => {
    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characters, prompt }),
    });
    const { story, summaries } = await response.json();
    setStory(story);
    setSummaries(summaries);
  };

  return (
    <>
      <AddCharacterForm onAddCharacter={handleAddCharacter} />
      <CharacterTable characters={characters} onDeleteCharacter={handleDeleteCharacter} />
      <StoryGenerator onGenerateStory={handleGenerateStory} />
      {story && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Generated Story</h2>
          <p>{story}</p>
          <h3 className="text-lg font-bold mt-4">Character Summaries</h3>
          <ul>
            {summaries.map((summary) => (
              <li key={summary.name}>
                <strong>{summary.name}:</strong> {summary.role}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}