"use client";

import { useState } from "react";
import { useChat } from "ai/react";

type Character = {
  id: string;
  name: string;
  description: string;
  personality: string;
};

export default function Chat() {
  const { messages, append, isLoading } = useChat();

  const genres = [
    { emoji: "🧙", value: "Fantasy" },
    { emoji: "🕵️", value: "Mystery" },
    { emoji: "💑", value: "Romance" },
    { emoji: "🚀", value: "Sci-Fi" },
  ];

  const tones = [
    { emoji: "😊", value: "Happy" },
    { emoji: "😢", value: "Sad" },
    { emoji: "😏", value: "Sarcastic" },
    { emoji: "😂", value: "Funny" },
  ];

  const [state, setState] = useState({ genre: "", tone: "" });
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharacter, setNewCharacter] = useState({
    id: "",
    name: "",
    description: "",
    personality: "",
  });

  const handleChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [name]: value });
  };

  const handleCharacterChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setNewCharacter({ ...newCharacter, [name]: value });
  };

  const addOrUpdateCharacter = () => {
    if (!newCharacter.name || !newCharacter.description || !newCharacter.personality)
      return;
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
    setNewCharacter({ id: "", name: "", description: "", personality: "" });
  };

  const editCharacter = (char: Character) => {
    setNewCharacter(char);
  };

  const deleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const generateStory = () => {
    const charactersDescription = characters
      .map(
        (c) =>
          `Name: ${c.name}, Description: ${c.description}, Personality: ${c.personality}`
      )
      .join("\n");

    append({
      role: "user",
      content: `Generate a ${state.genre} story in a ${state.tone} tone including these characters:\n${charactersDescription}\n`,
    });
  };

  return (
    <main className="mx-auto w-full p-24 flex flex-col">
      <div className="flex flex-col items-center justify-center space-y-8 text-white">
        <h2 className="text-3xl font-bold">Story Telling App</h2>

        {/* Genre Selection */}
        <div className="space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4">
          <h3 className="text-xl font-semibold">Genre</h3>
          <div className="flex flex-wrap justify-center">
            {genres.map(({ value, emoji }) => (
              <label
                key={value}
                className="p-4 m-2 bg-opacity-25 bg-gray-600 rounded-lg"
              >
                <input
                  type="radio"
                  name="genre"
                  value={value}
                  onChange={handleChange}
                />
                <span className="ml-2">{`${emoji} ${value}`}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tone Selection */}
        <div className="space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4">
          <h3 className="text-xl font-semibold">Tone</h3>
          <div className="flex flex-wrap justify-center">
            {tones.map(({ value, emoji }) => (
              <label
                key={value}
                className="p-4 m-2 bg-opacity-25 bg-gray-600 rounded-lg"
              >
                <input
                  type="radio"
                  name="tone"
                  value={value}
                  onChange={handleChange}
                />
                <span className="ml-2">{`${emoji} ${value}`}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Character Management */}
        <div className="bg-opacity-25 bg-gray-700 rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-2">Characters</h3>
          <div className="space-y-2">
            <input
              className="rounded p-2"
              placeholder="Name"
              name="name"
              value={newCharacter.name}
              onChange={handleCharacterChange}
            />
            <input
              className="rounded p-2"
              placeholder="Description"
              name="description"
              value={newCharacter.description}
              onChange={handleCharacterChange}
            />
            <input
              className="rounded p-2"
              placeholder="Personality"
              name="personality"
              value={newCharacter.personality}
              onChange={handleCharacterChange}
            />
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={addOrUpdateCharacter}
            >
              {newCharacter.id ? "Update Character" : "Add Character"}
            </button>
          </div>
          <ul className="mt-4">
            {characters.map((char) => (
              <li
                key={char.id}
                className="bg-opacity-25 bg-gray-600 rounded-lg p-2 my-2 flex justify-between"
              >
                {char.name} ({char.personality}): {char.description}
                <span>
                  <button
                    className="text-yellow-300 mx-2"
                    onClick={() => editCharacter(char)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => deleteCharacter(char.id)}
                  >
                    Delete
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Generate Story Button */}
        <button
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={isLoading || !state.genre || !state.tone}
          onClick={generateStory}
        >
          Generate Story
        </button>

        {/* Display AI Response */}
        <div className="bg-opacity-25 bg-gray-700 rounded-lg p-4 whitespace-pre-wrap">
          {/* Display the latest message (streaming in) */}
          {messages[messages.length - 1]?.content}

          {/* Only show the Character Recap once the assistant's response has stopped streaming */}
          {!isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === "assistant" &&
            characters.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold">Character Recap:</h4>
                {characters.map((c) => (
                  <p key={c.id}>
                    {c.name}: {c.personality} - {c.description}
                  </p>
                ))}
              </div>
            )}
        </div>
      </div>
    </main>
  );
}
