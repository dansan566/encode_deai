// app/page.tsx
// main page of the application
import CharacterManager from '@/components/CharacterManager';
import { Character } from '@/types/character';

// Fetch initial characters from the API (server-side)
async function getCharacters(): Promise<Character[]> {
  const response = await fetch('http://localhost:3000/api/characters');
  if (!response.ok) throw new Error('Failed to fetch characters');
  return response.json();
}

export default async function Home() {
  // Fetch initial characters on the server
  const initialCharacters = await getCharacters();

  return (
    <div className="p-8">
      {/* rendering characters handling and display */}
      <h1 className="text-2xl font-bold mb-4">KshRM4 AI Story Generator</h1>
      {/* Pass initialCharacters as a prop to the client component */}
      <CharacterManager initialCharacters={initialCharacters} />
    </div>
  );
}