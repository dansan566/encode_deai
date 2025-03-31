'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface Character {
  name: string;
  description: string;
  personality: string;
}

interface Story {
  title: string;
  content: string;
}

export default function CharactersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/plain') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please upload a .txt file');
      setFile(null);
    }
  };

  const handleExtractCharacters = async () => {
    if (!file) {
      setError('Please upload a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/characters/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract characters');
      }

      const data = await response.json();
      setCharacters(data.characters);
      // Save characters to localStorage for story generation
      localStorage.setItem('extractedCharacters', JSON.stringify(data.characters));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterToggle = (characterName: string) => {
    setSelectedCharacters(prev => {
      if (prev.includes(characterName)) {
        return prev.filter(name => name !== characterName);
      } else {
        return [...prev, characterName];
      }
    });
  };

  const handleGenerateStory = async () => {
    if (selectedCharacters.length === 0) {
      setError('Please select at least one character');
      return;
    }

    if (!prompt.trim()) {
      setError('Please provide a story prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characters: selectedCharacters,
          prompt,
          characterDetails: characters,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      setStory(data.story);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Character Extraction & Story Generator</h1>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="max-w-sm"
          />
          <Button 
            onClick={handleExtractCharacters}
            disabled={!file || loading}
          >
            {loading ? 'Extracting...' : 'Extract Characters'}
          </Button>
        </div>

        {error && (
          <div className="text-red-500">{error}</div>
        )}

        {characters.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Extracted Characters</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Personality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {characters.map((character) => (
                    <TableRow key={character.name}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCharacters.includes(character.name)}
                          onCheckedChange={() => handleCharacterToggle(character.name)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{character.name}</TableCell>
                      <TableCell>{character.description}</TableCell>
                      <TableCell>{character.personality}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Generate Story</h2>
              <Textarea
                placeholder="Enter your story prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[200px]"
              />
              <Button 
                onClick={handleGenerateStory}
                disabled={loading || selectedCharacters.length === 0}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Story'}
              </Button>
            </div>

            {story && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Generated Story</h2>
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium mb-2">{story.title}</h3>
                  <div className="whitespace-pre-wrap">{story.content}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 