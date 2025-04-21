import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { VectorStore } from '@/lib/vector-store';
import path from 'path';
import fs from 'fs';
import os from 'os';

export const runtime = "nodejs"; // Need nodejs for file operations

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const vectorStore = new VectorStore(openai, path.join(process.cwd(), 'data', 'vector-store.json'));

// Helper to save uploaded file
const saveFile = async (formData: FormData): Promise<{ filePath: string, fileName: string, title: string }> => {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('File is required');
  }
  
  const title = formData.get('title') as string || file.name;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create temp file
  const tmpDir = path.join(os.tmpdir(), 'solidity-uploads');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  
  const filePath = path.join(tmpDir, file.name);
  fs.writeFileSync(filePath, buffer);
  
  return { filePath, fileName: file.name, title };
};

// Query endpoint
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }
    
    const results = await vectorStore.findSimilar(query, 3);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in RAG API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Endpoint to add knowledge
export async function PUT(request: NextRequest) {
  try {
    const { text, title, source } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }
    
    const count = await vectorStore.addDocument(text, {
      source: source || 'user-input',
      title: title || 'Untitled Document'
    });
    
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Error adding document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// File upload endpoint
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const { filePath, fileName, title } = await saveFile(formData);
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Add to vector store
    const count = await vectorStore.addDocument(content, {
      source: 'file-upload',
      title: title || fileName,
      fileName
    });
    
    // Clean up temp file
    fs.unlinkSync(filePath);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${fileName}`,
      count
    });
  } catch (error) {
    console.error('Error processing file upload:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { 
      status: 500 
    });
  }
}
