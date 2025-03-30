import { useState } from "react"
import { ScrollArea } from "./ui/scroll-area"

interface Character {
  name: string
  description: string
  personality: string
}

interface StoryGeneratorProps {
  characters: Character[]
}

export function StoryGenerator({ characters }: StoryGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [maxLength, setMaxLength] = useState(1000)
  const [story, setStory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateStory = async () => {
    if (!prompt.trim()) {
      setError("Please enter a story prompt")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          characters,
          prompt,
          maxLength,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate story")
      }

      const data = await response.json()
      setStory(data.story)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Story Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your story prompt..."
          className="w-full h-32 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Maximum Length (words)
        </label>
        <input
          type="number"
          value={maxLength}
          onChange={(e) => setMaxLength(Number(e.target.value))}
          min={100}
          max={5000}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          disabled={isLoading}
        />
      </div>

      <button
        onClick={generateStory}
        disabled={isLoading || !prompt.trim()}
        className="w-full py-2 px-4 bg-violet-600 text-white rounded-md hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Generating Story..." : "Generate Story"}
      </button>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {story && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Generated Story</h3>
          <ScrollArea className="h-[400px] p-4 border rounded-md">
            <div className="prose max-w-none">
              {story.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
} 