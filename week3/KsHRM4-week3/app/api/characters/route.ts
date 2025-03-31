// app/api/characters/route.ts
// handle the characters API for CRUD operations
import { NextResponse } from 'next/server';
import { Character } from '@/types/character';

let characters: Character[] = [];

export async function GET() {
  return NextResponse.json(characters);
}

export async function POST(request: Request) {
  const newCharacter = await request.json();
  characters.push({ ...newCharacter, id: Date.now().toString() });
  return NextResponse.json(newCharacter);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  characters = characters.filter((character) => character.id !== id);
  return NextResponse.json({ success: true });
}