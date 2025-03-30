import OpenAI from "openai/index.mjs";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.LOCAL_API_KEY,      // make sure .env has LOCAL_API_KEY
  baseURL: "http://127.0.0.1:5000/v1",    // your local model endpoint
});

export async function POST(req: Request) {
  try {
    // 1) Parse text from request body
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing 'text' in request body" }, { status: 400 });
    }

    // 2) Construct your extraction prompt
    const prompt = `
      Extract a structured list of characters from the text below. 
      **Output strictly valid JSON**:
      [
        {
          "name": "",
          "description": "",
          "personality": ""
        },
        ...
      ]
      Do not include any extra keys, disclaimers, or commentary. Only that JSON array.

      Text:
      ${text}
    `;

    // 3) Call your local GPT-4o-mini model
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
      stream: false, // no streaming for extraction
    });

    // 4) Ensure the model actually returned a choice
    if (!response.choices?.[0]?.message?.content) {
      return NextResponse.json({ error: "No valid response from AI" }, { status: 500 });
    }

    const content = response.choices[0].message.content.trim();

    // 5) Attempt to parse the JSON
    let characters;
    try {
      characters = JSON.parse(content);
    } catch (parseErr) {
      // Model's response wasn't parseable as JSON
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON", modelResponse: content },
        { status: 500 }
      );
    }

    // 6) Return the parsed array
    return NextResponse.json({ characters });
  } catch (error: any) {
    console.error("Error in /api/extract route:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
