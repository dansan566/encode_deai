"use client";

import { useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { StoryGenerator } from "./story-generator";

interface Character {
  name: string;
  description: string;
  personality: string;
}

interface CharacterExtractionResponse {
  characters: Character[];
  metadata: {
    totalCharacters: number;
    timestamp: string;
    sourceFile: string;
  };
}

interface ErrorResponse {
  error: string;
  details?: string;
}

export function FileUploadSection() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [metadata, setMetadata] = useState<CharacterExtractionResponse["metadata"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const extractCharacters = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-characters", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || "Failed to extract characters");
      }

      const data: CharacterExtractionResponse = await response.json();
      setCharacters(data.characters);
      setMetadata(data.metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      extractCharacters(file);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Text File
        </label>
        <input
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-700 mx-auto"></div>
        </div>
      )}

      {characters.length > 0 && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Extracted Characters</h2>
            {metadata && (
              <div className="text-sm text-gray-500 mb-4">
                <p>Total Characters: {metadata.totalCharacters}</p>
                <p>Source File: {metadata.sourceFile}</p>
                <p>Extracted: {new Date(metadata.timestamp).toLocaleString()}</p>
              </div>
            )}

            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Character</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Personality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {characters.map((character, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{character.name}</TableCell>
                      <TableCell>{character.description}</TableCell>
                      <TableCell>{character.personality}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Generate New Story</h2>
            <StoryGenerator characters={characters} />
          </div>
        </div>
      )}
    </div>
  );
} 