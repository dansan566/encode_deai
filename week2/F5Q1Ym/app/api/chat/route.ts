import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

const openai = new OpenAI();

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, temperature } = await req.json(); // Include temperature

  const lastMessage = messages[messages.length - 1];

  let response;

  if (lastMessage.content.startsWith("Generate a")) {
    response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a professional joke generator. You can generate jokes based on different topics, tones, and types.`,
        },
        ...messages,
      ],
      temperature: temperature, // Use the provided temperature
    });
  } else if (lastMessage.content.startsWith("Evaluate the following joke")) {
    response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a professional joke evaluator. You can evaluate jokes based on criteria like funny, appropriate, and offensive.`,
        },
        ...messages,
      ],
      temperature: 0, // Set temperature to 0 for evaluation
    });
  } else {
    return new Response("Invalid request", { status: 400 });
  }

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}