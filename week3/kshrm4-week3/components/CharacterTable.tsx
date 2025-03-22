
// components/CharacterTable.tsx
// display the characters in a table, add a new character or delete a character
"use client";

import { useState } from "react";
import { Character } from "../types/Character";

export default function CharacterTable() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharacter, setNewCharacter] = useState<Character>({
    id: "",
    name: "",
    description: "",
    personality: "",
  });

  // Add a new character
  const addCharacter = () => {
    if (newCharacter.name && newCharacter.description && newCharacter.personality) {
      setCharacters([...characters, { ...newCharacter, id: Date.now().toString() }]);
      setNewCharacter({ id: "", name: "", description: "", personality: "" });
    }
  };

  // Delete a character by ID
  const deleteCharacter = (id: string) => {
    setCharacters(characters.filter((char) => char.id !== id));
  };

  return (
    <div className="p-4">
      {/* Section 1: Add Character Form */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Add a New Character</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={newCharacter.name}
            onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={newCharacter.description}
            onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Personality"
            value={newCharacter.personality}
            onChange={(e) => setNewCharacter({ ...newCharacter, personality: e.target.value })}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={addCharacter}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Character
          </button>
        </div>
      </div>

      {/* Section 2: Display Characters Table */}
      <div>
        <h2 className="text-xl font-bold mb-4">Characters List</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Personality</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Dummy Greyed-Out Example Row */}
            <tr className="text-gray-400">
              <td className="p-2">Example Name</td>
              <td className="p-2">Example Description</td>
              <td className="p-2">Example Personality</td>
              <td className="p-2">
                <button disabled className="text-gray-400 cursor-not-allowed">
                  Delete
                </button>
              </td>
            </tr>
            {/* List of Characters */}
            {characters.map((char) => (
              <tr key={char.id} className="border-b">
                <td className="p-2">{char.name}</td>
                <td className="p-2">{char.description}</td>
                <td className="p-2">{char.personality}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteCharacter(char.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}