import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/config';
import { NextResponse } from 'next/server';
import { getCurrentTrack, getRecentlyPlayed, getTopTracks } from '@/utils/spotify';
import { Anthropic } from '@anthropic-ai/sdk';
import { SpotifyTrack } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const [currentTrack, topTracks, recentlyPlayed] = await Promise.all([
      getCurrentTrack(session.accessToken),
      getTopTracks(session.accessToken),
      getRecentlyPlayed(session.accessToken)
    ]);

    const musicContext = `
      ${currentTrack ? `Currently playing: "${currentTrack.name}" by ${currentTrack.artists.join(', ')}"` : ''}
      ${recentlyPlayed.length ? `Recent tracks: ${recentlyPlayed[0].name} by ${recentlyPlayed[0].artists.join(', ')}` : ''}
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2048,
      temperature: 0.7,
      system: `${BASE_PROMPT}\n\nMusic Context: ${musicContext.trim()}`,
      messages: [
        {
          role: 'user',
          content: 'Send a welcome message following the first response format rules.'
        }
      ]
    });

    return NextResponse.json({
      welcome: response.content[0].text,
      currentTrack,
      recentTracks: recentlyPlayed,
      topTracks
    });

  } catch (error) {
    console.error('Welcome Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 