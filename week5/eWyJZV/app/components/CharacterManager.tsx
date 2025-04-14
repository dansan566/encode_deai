import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';

export interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
}

interface CharacterManagerProps {
  characters: Character[];
  onCharactersChange: (characters: Character[]) => void;
}

export function CharacterManager({ characters, onCharactersChange }: CharacterManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCharacter, setNewCharacter] = useState<Omit<Character, 'id'>>({
    name: '',
    description: '',
    personality: '',
  });

  const addCharacter = () => {
    if (!newCharacter.name) return;
    
    const character: Character = {
      id: Math.random().toString(36).substr(2, 9),
      ...newCharacter
    };
    
    onCharactersChange([...characters, character]);
    setNewCharacter({ name: '', description: '', personality: '' });
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    onCharactersChange(
      characters.map(char => 
        char.id === id ? { ...char, ...updates } : char
      )
    );
  };

  const deleteCharacter = (id: string) => {
    onCharactersChange(characters.filter(char => char.id !== id));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Story Characters</h2>
      
      {/* Character List */}
      <div className="space-y-2">
        {characters.map(character => (
          <div key={character.id} className="p-4 bg-white rounded-lg shadow-sm">
            {editingId === character.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={character.name}
                  onChange={e => updateCharacter(character.id, { name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Character name"
                />
                <input
                  type="text"
                  value={character.description}
                  onChange={e => updateCharacter(character.id, { description: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Character description"
                />
                <input
                  type="text"
                  value={character.personality}
                  onChange={e => updateCharacter(character.id, { personality: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Character personality"
                />
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{character.name}</h3>
                  <p className="text-sm text-gray-600">{character.description}</p>
                  <p className="text-sm text-gray-500 italic">{character.personality}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(character.id)}
                    className="p-1 text-gray-600 hover:text-blue-500"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteCharacter(character.id)}
                    className="p-1 text-gray-600 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Character Form */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium mb-2">Add New Character</h3>
        <div className="space-y-2">
          <input
            type="text"
            value={newCharacter.name}
            onChange={e => setNewCharacter(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Character name"
          />
          <input
            type="text"
            value={newCharacter.description}
            onChange={e => setNewCharacter(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Character description"
          />
          <input
            type="text"
            value={newCharacter.personality}
            onChange={e => setNewCharacter(prev => ({ ...prev, personality: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="Character personality"
          />
          <button
            onClick={addCharacter}
            disabled={!newCharacter.name}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            <Plus size={16} />
            Add Character
          </button>
        </div>
      </div>
    </div>
  );
} 