"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

export default function FileUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [characters, setCharacters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile && uploadedFile.type === "text/plain") {
      setFile(uploadedFile);
      setCharacters([]);
    } else {
      alert("Please upload a .txt file");
    }
  };

  const extractCharacters = async () => {
    if (!file) {
      alert("Please upload a file first");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extract-characters", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to extract characters");
      }

      const data = await response.json();
      setCharacters(data.characters);
    } catch (error) {
      console.error("Error extracting characters:", error);
      alert("Failed to extract characters. Please try again.");
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
        </CardContent>
      </Card>

      {characters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Characters</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {characters.map((character, index) => (
                <li key={index} className="text-sm">
                  {character}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 