"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Character {
  name: string;
  description: string;
  personality: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
  originalResponse?: string;
}

export default function FileUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === "text/plain") {
      setFile(uploadedFile);
      setCharacters([]);
      setError(null);
    } else {
      setError("Please upload a .txt file");
    }
  };

  const extractCharacters = async () => {
    if (!file) {
      setError("Please upload a file first");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-characters", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Failed to extract characters";
        const details = data.details ? `\nDetails: ${data.details}` : "";
        throw new Error(`${errorMessage}${details}`);
      }

      if (!data.characters || !Array.isArray(data.characters)) {
        throw new Error("Invalid response format from server");
      }

      setCharacters(data.characters);
    } catch (error) {
      console.error("Error extracting characters:", error);
      setError(error instanceof Error ? error.message : "Failed to extract characters. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Text File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button
              onClick={extractCharacters}
              disabled={!file || isLoading}
            >
              {isLoading ? "Extracting..." : "Extract Characters"}
            </Button>
          </div>
          {file && (
            <p className="text-sm text-gray-500">
              Selected file: {file.name}
            </p>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 whitespace-pre-line">
                {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {characters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Characters</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {characters.map((character, index) => (
                  <div key={index} className="space-y-2 border-b pb-4 last:border-0">
                    <h3 className="text-lg font-semibold">{character.name}</h3>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                        <p className="text-sm">{character.description}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Personality</h4>
                        <p className="text-sm">{character.personality}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 