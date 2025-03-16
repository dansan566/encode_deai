'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function JokeGenerator() {
const [joke, setJoke] = useState('');
const [evaluation, setEvaluation] = useState('');
const [loading, setLoading] = useState(false);
const [evaluating, setEvaluating] = useState(false);

const [topic, setTopic] = useState('Animals');
const [tone, setTone] = useState('Witty');
const [type, setType] = useState('Pun');
const [temperature, setTemperature] = useState(0.7);

const jokeRef = useRef('');
const evalRef = useRef('');

useEffect(() => {
    jokeRef.current = joke;
}, [joke]);

useEffect(() => {
    evalRef.current = evaluation;
}, [evaluation]);

const generateJoke = async () => {
    setLoading(true);
    setEvaluation('');
    setJoke('');

    const prompt = `Tell me an original, creative, and ${tone.toLowerCase()} ${type.toLowerCase()} joke about ${topic.toLowerCase()}. Try to avoid repeating previous jokes and be as unpredictable as possible. Format the joke with markdown. Just give me the joke, nothing else.`;



    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], temperature }),
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let accumulatedJoke = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            const chunk = decoder.decode(value);
            try {
                const jsonChunk = JSON.parse(chunk);
                accumulatedJoke += jsonChunk.content;
                setJoke(accumulatedJoke);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                console.error("Received chunk:", chunk);
                // If JSON parsing fails, append the raw chunk
                accumulatedJoke += chunk;
                setJoke(accumulatedJoke);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
};

const evaluateJoke = async () => {
    setEvaluating(true);
    const evalPrompt = `
        Evaluate the following joke based on the criteria: funny, appropriate, offensive, and any other parameters you deem important.
        Output only the evaluation in markdown format without any introductory or concluding phrases. Do not start with phrases like "Okay, here's an evaluation of the joke:".
        Joke:
        ${jokeRef.current}
        `;


    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: evalPrompt }] }),
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader available');

        const decoder = new TextDecoder();
        let accumulatedEval = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            const chunk = decoder.decode(value);
            try {
                const jsonChunk = JSON.parse(chunk);
                accumulatedEval += jsonChunk.content;
                setEvaluation(accumulatedEval);
            } catch (error) {
                console.error("Error parsing JSON:", error);
                console.error("Received chunk:", chunk);
                // If JSON parsing fails, append the raw chunk
                accumulatedEval += chunk;
                setEvaluation(accumulatedEval);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setEvaluating(false);
    }
};

return (
    <div className="min-h-screen p-8 flex flex-col items-center" style={{ backgroundColor: 'rgb(227,227,227)' }}>
    <div className="max-w-xl w-full bg-white p-6 shadow-xl rounded-3xl">
        <h1 className="text-2xl text-green-700 font-bold text-center mb-4">Joke Generator</h1>

        <div className="space-y-3 mb-4">
        <select
            className="w-full p-3 rounded-full shadow border text-black"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
        >
            {['Animals', 'Work', 'People', 'Food', 'Television'].map((opt) => (
            <option key={opt}>{opt}</option>
            ))}
        </select>

        <select
            className="w-full p-3 rounded-full shadow border text-black"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
        >
            {['Witty', 'Sarcastic', 'Silly', 'Dark', 'Goofy'].map((opt) => (
            <option key={opt}>{opt}</option>
            ))}
        </select>

        <select
            className="w-full p-3 rounded-full shadow border text-black"
            value={type}
            onChange={(e) => setType(e.target.value)}
        >
            {['Pun', 'Knock-knock', 'Story'].map((opt) => (
            <option key={opt}>{opt}</option>
            ))}
        </select>

        <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full"
        />
        <p className="text-center text-black">Temperature: {temperature}</p>
        </div>

        <button
        onClick={generateJoke}
        disabled={loading}
        className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold px-4 py-3 rounded-full shadow"
        >
        {loading ? 'Generating...' : 'Generate Joke'}
        </button>

        {joke && (
        <div className="mt-6 bg-green-100 p-4 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-green-700">Joke:</h3>
            <div className="text-black prose">
                <ReactMarkdown>{joke}</ReactMarkdown>
            </div>
        </div>
        )}

        {joke && !evaluation && (
        <button
            onClick={evaluateJoke}
            disabled={evaluating}
            className="mt-4 w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold px-4 py-3 rounded-full shadow"
        >
            {evaluating ? 'Evaluating...' : 'Evaluate Joke'}
        </button>
        )}

        {evaluation && (
        <div className="mt-4 bg-gray-200 p-4 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-gray-800">Evaluation:</h3>
            <div className="text-black prose">
                <ReactMarkdown>{evaluation}</ReactMarkdown>
            </div>
        </div>
        )}
    </div>
    </div>
);
}