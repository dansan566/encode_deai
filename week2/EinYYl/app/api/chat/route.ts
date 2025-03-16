import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
    baseURL: process.env.BASE_URL,
    apiKey: process.env.OPENROUTER_API_KEY,
  });

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages } = await req.json();
  const model = process.env.MODEL;
  const response = await openai.chat.completions.create({
    model: model as string,
    messages,
  });

  return NextResponse.json({
    content: response.choices[0].message.content,
  });
}