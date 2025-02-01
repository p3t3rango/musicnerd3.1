import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    welcome: "Welcome to MusicNerd! We're currently setting up our music AI chat. Check back soon!",
  });
} 