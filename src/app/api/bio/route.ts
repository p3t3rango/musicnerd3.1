import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/config';
import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { getMusicNerdData } from '@/utils/musicnerd';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY?.trim() || '',
});

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant')) {
      console.error('Invalid Anthropic API key format');
      return NextResponse.json({ error: 'Configuration Error' }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { artist, prompt } = await req.json();

    // Get MusicNerd data for the artist
    let artistData = null;
    if (artist?.spotify) {
      try {
        artistData = await getMusicNerdData(artist.spotify, artist.name);
      } catch (error) {
        console.error('Error fetching MusicNerd data:', error);
      }
    }

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 800,
      temperature: 0.7,
      system: `You are a professional music biographer. Write concise artist bios that are engaging and informative. 
      Important:
      - Never include phrases like "Here is a bio" or similar preambles
      - Keep bios to 2-3 short paragraphs
      - Focus on key career highlights and artistic style
      - Write in a professional tone`,
      messages: [{ 
        role: "user", 
        content: `Write a concise bio for ${artist.name}. Focus on their musical style, significant achievements, and current impact.` 
      }],
    });

    return NextResponse.json({
      role: 'assistant',
      content: message.content[0].text,
      artistData: artistData?.result
    });

  } catch (error) {
    console.error('Bio generation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 