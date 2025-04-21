import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

// Vector storage structure
interface VectorEntry {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    source: string;
    title?: string;
    section?: string;
    fileName?: string;
  };
}

export class VectorStore {
  private vectors: VectorEntry[] = [];
  private openai: OpenAI;
  private storePath: string;
  
  constructor(openai: OpenAI, storePath?: string) {
    this.openai = openai;
    this.storePath = storePath || path.join(process.cwd(), 'data', 'vector-store.json');
    this.loadVectors();
  }
  
  private loadVectors() {
    try {
      if (fs.existsSync(this.storePath)) {
        const data = fs.readFileSync(this.storePath, 'utf-8');
        this.vectors = JSON.parse(data);
        console.log(`Loaded ${this.vectors.length} vectors from storage`);
      }
    } catch (error) {
      console.error('Error loading vectors:', error);
    }
  }
  
  private saveVectors() {
    try {
      const dir = path.dirname(this.storePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storePath, JSON.stringify(this.vectors, null, 2));
    } catch (error) {
      console.error('Error saving vectors:', error);
    }
  }
  
  async addDocument(text: string, metadata: VectorEntry['metadata']) {
    // Split text into chunks of about 500 characters
    const chunks = this.chunkText(text, 500);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.createEmbedding(chunk);
      
      this.vectors.push({
        id: `${metadata.source}-${i}`,
        text: chunk,
        embedding,
        metadata: {
          ...metadata,
          section: `Chunk ${i + 1} of ${chunks.length}`
        }
      });
    }
    
    this.saveVectors();
    return this.vectors.length;
  }
  
  private chunkText(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/);
    
    for (const paragraph of paragraphs) {
      // If adding this paragraph exceeds the chunk size, start a new chunk
      if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      
      currentChunk += paragraph + '\n\n';
    }
    
    // Add the last chunk if it's not empty
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
  
  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }
  
  async findSimilar(query: string, topK: number = 3): Promise<{ text: string; metadata: VectorEntry['metadata']; similarity: number }[]> {
    // Create embedding for the query
    const queryEmbedding = await this.createEmbedding(query);
    
    // Calculate similarity with all vectors
    const similarities = this.vectors.map(vector => ({
      text: vector.text,
      metadata: vector.metadata,
      similarity: this.cosineSimilarity(queryEmbedding, vector.embedding)
    }));
    
    // Sort by similarity (highest first) and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  async addFile(filePath: string, metadata: Omit<VectorEntry['metadata'], 'source'>) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return await this.addDocument(content, {
        ...metadata,
        source: path.basename(filePath)
      });
    } catch (error) {
      console.error(`Error adding file ${filePath}:`, error);
      throw error;
    }
  }
  
  clearAll() {
    this.vectors = [];
    this.saveVectors();
  }
}
