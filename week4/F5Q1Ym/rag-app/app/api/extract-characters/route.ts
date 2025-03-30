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

    // Create a temporary storage context for this file
    const storageContext = await storageContextFromDefaults({
      persistDir: "./temp_storage",
    });

    // Process the file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const documents = await parseFile(fileBuffer, file.name, file.type);
    
    // Create index and run pipeline
    const index = await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });
    await runPipeline(index, documents);

    // Create a query engine with a specific prompt for character extraction
    const queryEngine = index.asQueryEngine({
      similarityTopK: 5,
    });

    // Query the document with a specific prompt
    const response = await queryEngine.query({
      query: `Based on the provided text, identify the main characters and their roles in the story. 
      For each character, provide a brief description of their role and significance.
      Format the response as a list of characters with their descriptions.
      Only include characters that are significant to the story.
      Limit the response to the most important characters.`,
    });

    // Clean up the response and format it as a list of characters
    const characters = response.response
      .split("\n")
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-•*]\s*/, "").trim());

    return NextResponse.json({ characters });
  } catch (error) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
} 