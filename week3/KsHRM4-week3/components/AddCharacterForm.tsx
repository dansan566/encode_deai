// components/AddCharacterForm.tsx
// handle form to add a new character to the story
"use client"
import { useState } from 'react';

interface AddCharacterFormProps {
  onAddCharacter: (character: { name: string; description: string; personality: string }) => void;
}

export default function AddCharacterForm({ onAddCharacter }: AddCharacterFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCharacter({ name, description, personality });
    setName('');
    setDescription('');
    setPersonality('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Personality"
        value={personality}
        onChange={(e) => setPersonality(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Add Character
      </button>
    </form>
  );
}