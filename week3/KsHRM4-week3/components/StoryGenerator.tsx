// components/StoryGenerator.tsx
// handle the story generation
import { useAIState, useActions, useUIState } from 'ai/rsc';
import { useEffect } from 'react';

interface StoryGeneratorProps {
  generateStory: (prompt: string) => Promise<ReadableStream<string>>;
}

export default function StoryGenerator({ generateStory }: StoryGeneratorProps) {
  const [messages, setMessages] = useUIState();
  const [input, setInput] = useAIState();
  const { handleInputChange, handleSubmit } = useActions();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const prompt = formData.get('prompt') as string;

    // Call the Server Action to generate the story
    const stream = await generateStory(prompt);

    // Read the streamed response
    const reader = stream.getReader();
    let story = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      story += value;
      setMessages([{ role: 'assistant', content: story }]);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m, index) => (
        <div key={index} className="whitespace-pre-wrap">
          {m.role === 'user' ? 'User: ' : 'AI: '}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleFormSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl text-black"
          name="prompt"
          value={input}
          placeholder="Enter a prompt for the story..."
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}