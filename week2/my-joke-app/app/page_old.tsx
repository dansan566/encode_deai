"use client";
import { useState } from "react";
import './styles.css'; // Import your CSS file

export default function JokeGenerator() {
  const [topic, setTopic] = useState("work");
  const [tone, setTone] = useState("witty");
  const [jokeType, setJokeType] = useState("pun");
  const [temperature, setTemperature] = useState(1);
  const [joke, setJoke] = useState(""); // State to hold the joke

  const handleSubmit = async () => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [], // Add your existing messages here
        topic,
        tone,
        jokeType,
        temperature,
      }),
    });
    const data = await response.json();
    setJoke(data.content); // Set the joke received from the API
  };

  return (
    <div className="container">
      <select value={topic} onChange={(e) => setTopic(e.target.value)}>
        <option value="work">Work</option>
        <option value="people">People</option>
        <option value="animals">Animals</option>
        <option value="food">Food</option>
        <option value="television">Television</option>
      </select>

      <select value={tone} onChange={(e) => setTone(e.target.value)}>
        <option value="witty">Witty</option>
        <option value="sarcastic">Sarcastic</option>
        <option value="silly">Silly</option>
        <option value="dark">Dark</option>
        <option value="goofy">Goofy</option>
      </select>

      <select value={jokeType} onChange={(e) => setJokeType(e.target.value)}>
        <option value="pun">Pun</option>
        <option value="knock-knock">Knock-Knock</option>
        <option value="story">Story</option>
      </select>

      <input
        type="range"
        min="0"
        max="2"
        step="0.1"
        value={temperature}
        onChange={(e) => setTemperature(parseFloat(e.target.value))}
      />

      <button onClick={handleSubmit}>Get Joke</button>

      {joke && <div className="joke-display">{joke}</div>} {/* Display the joke */}
    </div>
  );
}