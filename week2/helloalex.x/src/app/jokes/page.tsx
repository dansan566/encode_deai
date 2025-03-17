"use client";

import { useState } from "react";

export default function JokeGenerator() {
  const [topic, setTopic] = useState("work");
  const [tone, setTone] = useState("witty");
  const [type, setType] = useState("pun");
  const [temperature, setTemperature] = useState(0.7);
  const [joke, setJoke] = useState("");
  const [evaluation, setEvaluation] = useState("");

  const generateJoke = async () => {
    const response = await fetch("/api/generate-joke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, tone, type, temperature }),
    });
    const data = await response.json();
    setJoke(data.joke);
    evaluateJoke(data.joke);
  };

  const evaluateJoke = async (jokeText: string) => {
    const response = await fetch("/api/evaluate-joke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joke: jokeText }),
    });
    const data = await response.json();
    setEvaluation(data.evaluation);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">AI Joke Generator</h1>

      <label>Topic:</label>
      <select value={topic} onChange={(e) => setTopic(e.target.value)}>
        <option value="work">Work</option>
        <option value="people">People</option>
        <option value="animals">Animals</option>
        <option value="food">Food</option>
        <option value="television">Television</option>
      </select>

      <label>Tone:</label>
      <select value={tone} onChange={(e) => setTone(e.target.value)}>
        <option value="witty">Witty</option>
        <option value="sarcastic">Sarcastic</option>
        <option value="silly">Silly</option>
        <option value="dark">Dark</option>
        <option value="goofy">Goofy</option>
      </select>

      <label>Type:</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="pun">Pun</option>
        <option value="knock-knock">Knock-Knock</option>
        <option value="story">Story</option>
      </select>

      <label>Creativity (Temperature):</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={temperature}
        onChange={(e) => setTemperature(parseFloat(e.target.value))}
      />

      <button
        onClick={generateJoke}
        className="mt-4 p-2 bg-blue-500 text-white rounded"
      >
        Generate Joke
      </button>

      {joke && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">Generated Joke:</h2>
          <p>{joke}</p>
          <h3 className="text-md font-bold">Evaluation:</h3>
          <p>{evaluation}</p>
        </div>
      )}
    </div>
  );
}