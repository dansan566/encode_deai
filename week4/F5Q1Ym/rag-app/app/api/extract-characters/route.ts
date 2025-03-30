import { NextRequest, NextResponse } from "next/server";
import { Settings } from "llamaindex";
import { initSettings } from "../chat/engine/settings";
import { parseFile } from "../chat/llamaindex/documents/helper";
import { VectorStoreIndex } from "llamaindex";
import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";
import { Document } from "llamaindex";
import { runPipeline } from "../chat/llamaindex/documents/pipeline";

// Initialize settings
initSettings();

interface Character {
  name: string;
  description: string;
  personality: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "text/plain") {
      return NextResponse.json(
        { error: "Only .txt files are supported" },
        { status: 400 }
      );
    }

    console.log("Processing file:", file.name);

    // Create a temporary storage context for this file
    const storageContext = await storageContextFromDefaults({
      persistDir: "./temp_storage",
    });

    // Process the file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    console.log("File buffer created, size:", fileBuffer.length);

    const documents = await parseFile(fileBuffer, file.name, file.type);
    console.log("Documents parsed:", documents.length);

    if (documents.length === 0) {
      return NextResponse.json(
        { error: "No content found in the file" },
        { status: 400 }
      );
    }
    
    // Create index and run pipeline
    const index = await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });
    console.log("Index created");

    await runPipeline(index, documents);
    console.log("Pipeline completed");

    // Create a query engine with large context window
    const queryEngine = index.asQueryEngine({
      similarityTopK: 50,
    });

    // Extract characters in a single step with Shrek-specific prompt
    const response = await queryEngine.query({
      query: `You are analyzing the Shrek movie script. Extract information about all characters that appear in the story.

      IMPORTANT: Return a JSON array of character objects. Each object must have:
      - name: The character's name (e.g., "Shrek", "Donkey", "Princess Fiona")
      - description: Their role in the story (1-2 sentences)
      - personality: Their key personality traits (1 sentence)

      Example format:
      [
        {
          "name": "Shrek",
          "description": "A grumpy ogre who lives alone in his swamp until his solitude is disrupted by fairy tale creatures.",
          "personality": "Cynical, antisocial, but ultimately kind-hearted beneath his gruff exterior."
        }
      ]

      Rules:
      1. Include ALL named characters (Shrek, Donkey, Fiona, Lord Farquaad, etc.)
      2. Include supporting characters (fairy tale creatures, guards, etc.)
      3. Use the exact character names as they appear in the script
      4. Keep descriptions focused on their role in the story
      5. For personality, focus on their most distinctive traits
      6. Return ONLY the JSON array, no other text

      Process:
      1. First identify all speaking characters and named characters
      2. Include any fairy tale creatures or supporting characters with lines
      3. Write a concise description of their role in the story
      4. Note their key personality traits
      5. Format everything as a JSON array
      
      Return the complete character list as a JSON array.`,
    });

    console.log("Raw response:", response.response);

    try {
      // Clean the response
      let cleanedResponse = response.response.trim();
      const startIndex = cleanedResponse.indexOf('[');
      const endIndex = cleanedResponse.lastIndexOf(']');
      
      if (startIndex === -1 || endIndex === -1) {
        console.error("Could not find JSON array brackets in response");
        console.error("Response:", cleanedResponse);
        throw new Error("Invalid response format - no JSON array found");
      }

      cleanedResponse = cleanedResponse.substring(startIndex, endIndex + 1);
      console.log("Cleaned response:", cleanedResponse);

      // Parse the response
      const characters = JSON.parse(cleanedResponse) as Character[];
      
      if (!Array.isArray(characters)) {
        console.error("Parsed response is not an array");
        throw new Error("Response is not an array of characters");
      }

      // Validate and clean up each character
      const validCharacters = characters.filter(char => {
        const isValid = char.name && char.description && char.personality;
        if (!isValid) {
          console.warn("Invalid character object:", char);
        }
        return isValid;
      });

      if (validCharacters.length === 0) {
        console.error("No valid characters found in response");
        throw new Error("No valid characters extracted");
      }

      console.log("Successfully extracted characters:", validCharacters.length);
      return NextResponse.json({ characters: validCharacters });
    } catch (error) {
      console.error("Error processing character extraction:", error);
      console.error("Original response:", response.response);
      return NextResponse.json(
        {
          error: "Failed to extract characters",
          details: error instanceof Error ? error.message : "Unknown error",
          originalResponse: response.response
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { 
        error: "Failed to process file",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 