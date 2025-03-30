"use client";

import React, { useState, useEffect } from "react";
import { useChat } from "ai/react";

type Character = {
  id: string;
  name: string;
  description: string;
  personality: string;
};

export default function StoryTellingApp() {
  // For streaming chat/story
  const { messages, append, isLoading } = useChat();

  // Full character list (manually added + extracted from file)
  const [characters, setCharacters] = useState<Character[]>([]);

  // New character form fields
  const [newCharacter, setNewCharacter] = useState<Character>({
    id: "",
    name: "",
    description: "",
    personality: "",
  });

  // For file import
  const [importFile, setImportFile] = useState<File | null>(null);

  // Automatic short recap after story generation
  const [shouldRequestRecap, setShouldRequestRecap] = useState(false);

  // Error state
  const [error, setError] = useState("");

  /* ---------------------------
   *    Character Management
   * ------------------------- */
  const handleCharacterInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCharacter({ ...newCharacter, [e.target.name]: e.target.value });
  };

  const addOrUpdateCharacter = () => {
    setError("");
    if (
      !newCharacter.name.trim() ||
      !newCharacter.description.trim() ||
      !newCharacter.personality.trim()
    ) {
      setError("Please fill all character fields.");
      return;
    }
    // If `id` exists, update. Otherwise, add new.
    if (newCharacter.id) {
      setCharacters((prev) =>
        prev.map((c) => (c.id === newCharacter.id ? newCharacter : c))
      );
    } else {
      setCharacters((prev) => [
        ...prev,
        { ...newCharacter, id: Date.now().toString() },
      ]);
    }
    // Reset input
    setNewCharacter({ id: "", name: "", description: "", personality: "" });
  };

  const editCharacter = (char: Character) => {
    setError("");
    setNewCharacter(char);
  };

  const deleteCharacter = (id: string) => {
    setError("");
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  /* ---------------------------
   *       File Import
   * ------------------------- */
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  const handleExtractCharacters = async () => {
    setError("");
    if (!importFile) {
      setError("Please select a .txt file first.");
      return;
    }
    if (importFile.type !== "text/plain") {
      setError("Please upload a .txt file.");
      return;
    }

    // 1) Read the file on client side
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result;
      if (typeof text !== "string") return;

      try {
        // 2) Send text to /api/extract
        const resp = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!resp.ok) {
          throw new Error("Character extraction failed.");
        }

        const data = await resp.json();
        const extractedCharacters = data.characters || [];

        // 3) Merge extracted with existing characters
        const merged = [
          ...characters,
          ...extractedCharacters.map((c: any) => ({
            ...c,
            id: Date.now().toString() + Math.random().toString(),
          })),
        ];
        setCharacters(merged);

        // Clear file input
        setImportFile(null);
      } catch (err: any) {
        setError(err.message || "Error extracting characters from file.");
      }
    };
    reader.readAsText(importFile);
  };

  /* ---------------------------
   *     Story Generation
   * ------------------------- */
  const generateStory = () => {
    setError("");
    if (!characters.length) {
      setError("Please add/import at least one character before generating a story.");
      return;
    }
    // We'll combine all characters into one user message
    const descriptionBlock = characters
      .map(
        (c) => `Name: ${c.name}, Description: ${c.description}, Personality: ${c.personality}`
      )
      .join("\n");

    append({
      role: "user",
      content: `Generate a short story using these characters:\n${descriptionBlock}\n`,
    });
    setShouldRequestRecap(true);
  };

  // If the last message is from assistant (meaning story is done), automatically ask for a short recap
  const storyFinished =
    !isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant";

  useEffect(() => {
    if (storyFinished && shouldRequestRecap) {
      append({
        role: "user",
        content:
          "Please provide only a short recap of each character's role in the story. Do not include story details—only how each character contributed, with no extra text or headings.",
      });
      setShouldRequestRecap(false);
    }
  }, [storyFinished, shouldRequestRecap, append]);

  return (
    <main
      className="
        min-h-screen 
        w-full 
        p-8 
        text-white 
        bg-gradient-to-br 
        from-purple-700
        via-blue-700
        to-blue-800
      "
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Story Telling App
        </h1>

        {/* File Import */}
        <div className="mb-6 rounded-lg p-4 bg-white/10 backdrop-blur-sm shadow-lg">
          <h2 className="text-xl font-semibold mb-2">
            Import Characters from a .txt File
          </h2>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".txt"
              onChange={handleFileSelection}
              className="w-full text-sm text-gray-200
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100
                      "
            />
            <button
              onClick={handleExtractCharacters}
              className="
                bg-blue-500 
                hover:bg-blue-600 
                transition-colors 
                text-white 
                px-4 
                py-2 
                rounded
              "
            >
              Extract
            </button>
          </div>
        </div>

        {/* Character Management */}
        <div className="mb-6 rounded-lg p-4 bg-white/10 backdrop-blur-sm shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Characters</h2>

          {/* Add / Edit Character Form */}
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <input
              name="name"
              placeholder="Name"
              value={newCharacter.name}
              onChange={handleCharacterInput}
              className="p-2 rounded flex-1 text-gray-900"
            />
            <input
              name="description"
              placeholder="Description"
              value={newCharacter.description}
              onChange={handleCharacterInput}
              className="p-2 rounded flex-1 text-gray-900"
            />
            <input
              name="personality"
              placeholder="Personality"
              value={newCharacter.personality}
              onChange={handleCharacterInput}
              className="p-2 rounded flex-1 text-gray-900"
            />
            <button
              onClick={addOrUpdateCharacter}
              className="
                bg-green-600 
                hover:bg-green-700 
                transition-colors 
                text-white 
                px-4 
                py-2 
                rounded
              "
            >
              {newCharacter.id ? "Update" : "Add"}
            </button>
          </div>

          {/* Existing Character List */}
          <ul className="space-y-2">
            {characters.map((char) => (
              <li
                key={char.id}
                className="flex items-center justify-between bg-white/5 rounded p-2"
              >
                <div className="text-sm">
                  <strong>{char.name}</strong> ({char.personality}):{" "}
                  {char.description}
                </div>
                <div>
                  <button
                    className="text-yellow-300 hover:text-yellow-400 mx-2"
                    onClick={() => editCharacter(char)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-400 hover:text-red-500"
                    onClick={() => deleteCharacter(char.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Generate Story Button */}
        <div className="flex justify-center">
          <button
            disabled={isLoading}
            onClick={generateStory}
            className="
              bg-pink-600 
              hover:bg-pink-700 
              transition-colors 
              text-white 
              font-bold 
              py-2 
              px-4 
              rounded
              disabled:opacity-50
            "
          >
            {isLoading ? "Generating..." : "Generate Story"}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <p className="text-red-400 mt-4 text-center font-semibold">{error}</p>
        )}

        {/* Display the AI-generated story and recap (assistant messages) */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm shadow-lg rounded p-4 whitespace-pre-wrap min-h-[150px]">
          {messages
            .filter((msg) => msg.role === "assistant")
            .map((msg, index) => (
              <p key={index} className="mb-4">
                {msg.content}
              </p>
            ))}
        </div>
      </div>
    </main>
  );
}
