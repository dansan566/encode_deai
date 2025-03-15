'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface JokeParameters {
  topic: string;
  tone: string;
  type: string;
  temperature: number;
}

interface Option {
  value: string;
  label: string;
  emoji: string;
}

export default function JokeGenerator() {
  const [parameters, setParameters] = useState<JokeParameters>({
    topic: 'general',
    tone: 'witty',
    type: 'general',
    temperature: 0.7,
  });

  const { messages, isLoading, append } = useChat({
    api: '/api/chat',
    body: {
      temperature: parameters.temperature
    }
  });

  const topics: Option[] = [
    { value: 'general', label: 'General', emoji: '🌟' },
    { value: 'work', label: 'Work', emoji: '💼' },
    { value: 'people', label: 'People', emoji: '👥' },
    { value: 'animals', label: 'Animals', emoji: '🐾' },
    { value: 'food', label: 'Food', emoji: '🍽️' },
    { value: 'television', label: 'Television', emoji: '📺' },
    { value: 'technology', label: 'Technology', emoji: '💻' },
  ];

  const tones: Option[] = [
    { value: 'witty', label: 'Witty', emoji: '🎯' },
    { value: 'sarcastic', label: 'Sarcastic', emoji: '😏' },
    { value: 'silly', label: 'Silly', emoji: '🤪' },
    { value: 'dark', label: 'Dark', emoji: '🌚' },
    { value: 'goofy', label: 'Goofy', emoji: '🤡' },
    { value: 'clean', label: 'Clean', emoji: '😊' },
  ];

  const types: Option[] = [
    { value: 'general', label: 'General', emoji: '💭' },
    { value: 'pun', label: 'Pun', emoji: '🎯' },
    { value: 'knock-knock', label: 'Knock-knock', emoji: '🚪' },
    { value: 'story', label: 'Story', emoji: '📖' },
    { value: 'one-liner', label: 'One-liner', emoji: '💫' },
  ];

  const handleParameterChange = (
    key: keyof JokeParameters,
    value: string | number
  ) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const generateJoke = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = `Generate a joke in the ${parameters.tone} tone about the ${parameters.topic} topic in the style of a ${parameters.type} joke.`;
    append({
      content: prompt,
      role: 'user'
    });
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold">AI Joke Generator</h1>
      </div>
      
      <form onSubmit={generateJoke} className="space-y-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Topic</label>
            <select
              value={parameters.topic}
              onChange={(e) => handleParameterChange('topic', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {topics.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.emoji} {topic.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tone</label>
            <select
              value={parameters.tone}
              onChange={(e) => handleParameterChange('tone', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {tones.map((tone) => (
                <option key={tone.value} value={tone.value}>
                  {tone.emoji} {tone.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={parameters.type}
              onChange={(e) => handleParameterChange('type', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {types.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.emoji} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Creativity Level (Temperature): {parameters.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={parameters.temperature}
              onChange={(e) => handleParameterChange('temperature', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Joke'
          )}
        </button>
      </form>

      <div className="space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded-lg ${
              m.role === 'assistant'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'hidden'
            }`}
          >
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {isLoading && messages.length === 0 && (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
} 