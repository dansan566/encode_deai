
// components/CharacterTable.tsx
// display the characters in a table, delete a character
"use client";

import { Character } from '@/types/character';

interface CharacterTableProps {
  characters: Character[];
  onDeleteCharacter: (id: string) => void;
}

export default function CharacterTable({ characters, onDeleteCharacter }: CharacterTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="border p-2">Name</th>
          <th className="border p-2">Description</th>
          <th className="border p-2">Personality</th>
          <th className="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {characters.map((character) => (
          <tr key={character.id}>
            <td className="border p-2">{character.name}</td>
            <td className="border p-2">{character.description}</td>
            <td className="border p-2">{character.personality}</td>
            <td className="border p-2">
              <button
                onClick={() => onDeleteCharacter(character.id)}
                className="bg-red-500 text-white p-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}