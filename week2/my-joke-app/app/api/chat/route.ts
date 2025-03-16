import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, topic, tone, jokeType, temperature } = await req.json(); // Added parameters

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [...messages, { role: "user", content: `Tell me a ${tone} ${jokeType} joke about ${topic}.` }], // Updated message
    temperature, // Added temperature
  });

  return NextResponse.json({
    content: response.choices[0].message.content,
  });
}
