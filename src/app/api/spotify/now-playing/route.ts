import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Spotify integration coming soon'
  }, { status: 200 });
} 