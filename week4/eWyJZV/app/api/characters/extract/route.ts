import { NextRequest, NextResponse } from 'next/server';
import { Document, VectorStoreIndex, OpenAI, OpenAIEmbedding, Settings } from 'llamaindex';

const CHUNK_SIZE = 512;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read the file content
    const text = await file.text();

    // Create a document from the text
    const document = new Document({ text });

    // Initialize the LLM and embedding model
    const llm = new OpenAI({
      model: process.env.MODEL || 'gpt-3.5-turbo',
      temperature: 0.7,
    });

    const embedModel = new OpenAIEmbedding({
      model: process.env.EMBEDDING_MODEL || 'text-embedding-ada-002',
    });

    // Create the index
    const index = await VectorStoreIndex.fromDocuments([document], {
      chunkSize: CHUNK_SIZE,
      llm,
      embedModel,
    });

    // Create a query engine
    const queryEngine = index.asQueryEngine();

    // Query to extract characters
    const prompt = `Analyze the text and extract all significant characters. For each character, provide:
    1. Their name
    2. A brief description of their role and appearance
    3. Their personality traits and characteristics

    Return ONLY a JSON array of objects with the following structure, without any markdown formatting or additional text:
    [
      {
        "name": "Character Name",
        "description": "Character description",
        "personality": "Personality traits"
      }
    ]`;

    const response = await queryEngine.query({
      query: prompt,
      responseMode: "tree",
    });

    // Clean the response string by removing markdown formatting
    const responseText = response.toString()
      .replace(/```json\n?/g, '')  // Remove opening ```json
      .replace(/```\n?/g, '')      // Remove closing ```
      .trim();                     // Remove extra whitespace

    // Parse the response into a structured format
    const characters = JSON.parse(responseText);

    // Save characters to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('extractedCharacters', JSON.stringify(characters));
    }

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
} 