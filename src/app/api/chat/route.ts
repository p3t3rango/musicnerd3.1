import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/config';
import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { getCurrentTrack, getTopTracks, getTopArtists, getRecentlyPlayed } from '@/utils/spotify';
import { SpotifyTrack } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

interface TopTrack {
  name: string;
  artists: string[];
  album: string;
  url: string;
}

interface TopArtist {
  name: string;
  genres: string[];
  popularity: number;
  url: string;
}

interface RecentTrack {
  name: string;
  artists: string[];
  album: string;
  url: string;
  playedAt: string;
}

// Base prompt that doesn't change
const BASE_PROMPT = `You are Zane, a knowledgeable music expert. Keep responses under 50 words. Focus on:
1. Current track insights
2. Artist background when available
3. Direct support options (let UI handle links)
Be concise and factual.`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user's music context with error handling
    let currentTrack: SpotifyTrack | null = null;
    let topTracks: TopTrack[] = [];
    let topArtists: TopArtist[] = [];
    let recentlyPlayed: RecentTrack[] = [];

    try {
      [currentTrack, topTracks, topArtists, recentlyPlayed] = await Promise.all([
        getCurrentTrack(session.accessToken) as Promise<SpotifyTrack | null>,
        getTopTracks(session.accessToken) as Promise<TopTrack[]>,
        getTopArtists(session.accessToken) as Promise<any[]>,
        getRecentlyPlayed(session.accessToken) as Promise<RecentTrack[]>
      ]);
    } catch (error) {
      console.error('Error fetching music context:', error);
    }

    // Create minimal context message
    const contextMessage = currentTrack 
      ? `Now playing: "${currentTrack.name}" by ${currentTrack.artists.join(', ')}"` 
      : 'No track currently playing';

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        temperature: 0.7,
        system: `${BASE_PROMPT}\n\nContext: ${contextMessage}`,
        messages: [
          ...body.conversationHistory || [],
          {
            role: 'user',
            content: body.message
          }
        ]
      });

      return NextResponse.json({
        role: 'assistant',
        content: response.content[0].text,
        currentTrack,
        artistInfo: currentTrack?.artistInfo
      });

    } catch (aiError) {
      console.error('AI API Error:', aiError);
      return NextResponse.json({ error: 'AI Service Error' }, { status: 503 });
    }
  } catch (error) {
    console.error('Chat Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 