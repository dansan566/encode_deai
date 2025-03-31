import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface Character {
  name: string
  description: string
  personality: string
}

interface StoryRequest {
  characters: Character[]
  prompt: string
  maxLength?: number
}

export async function POST(request: Request) {
  try {
    const body: StoryRequest = await request.json()
    const { characters, prompt, maxLength = 1000 } = body

    if (!characters || !Array.isArray(characters) || characters.length === 0) {
      return NextResponse.json(
        { error: "No characters provided" },
        { status: 400 }
      )
    }

    // Create a character context string
    const characterContext = characters
      .map(
        (char) =>
          `${char.name}:\nDescription: ${char.description}\nPersonality: ${char.personality}`
      )
      .join("\n\n")

    // Create the story generation prompt
    const storyPrompt = `Create a story using the following characters and their characteristics:

${characterContext}

Story prompt: ${prompt}

Please write a story that:
1. Uses these characters authentically according to their descriptions and personalities
2. Maintains consistent character behavior throughout
3. Creates an engaging narrative that follows the given prompt
4. Has a clear beginning, middle, and end
5. Is approximately ${maxLength} words long

Story:`

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a creative storyteller who creates engaging narratives while staying true to character descriptions and personalities.",
        },
        {
          role: "user",
          content: storyPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const story = completion.choices[0].message.content

    return NextResponse.json({ story })
  } catch (error) {
    console.error("Error generating story:", error)
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    )
  }
} 