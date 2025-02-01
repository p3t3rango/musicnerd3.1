import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/config';
import { NextResponse } from 'next/server';
import { getCurrentTrack, getRecentlyPlayed, getTopTracks } from '@/utils/spotify';
import { Anthropic } from '@anthropic-ai/sdk';

interface Track {
  name: string;
  artists: { name: string }[];
  album: string;
  url: string;
  playedAt?: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const [currentTrack, recentTracks, topTracks] = await Promise.all([
      getCurrentTrack(session.accessToken).catch(() => null),
      getRecentlyPlayed(session.accessToken).catch(() => []),
      getTopTracks(session.accessToken, 'short_term').catch(() => [])
    ]);

    let welcomePrompt = `You are Zane Lowe, casually greeting someone who just opened the chat. You're like a friend who's excited to talk music with them. Make a brief, engaging observation or comment about what they're listening to or their music taste. Keep it natural and conversational, as if you just noticed what's playing.

If they're currently playing something, react to that first. If not, comment on their recent or favorite tracks. Make them feel like they're chatting with a friend who really gets their music taste.`;

    if (currentTrack) {
      welcomePrompt += `\n\nThey're currently playing "${currentTrack.name}" by ${currentTrack.artists.join(', ')}"`;
    }

    if (recentTracks.length) {
      welcomePrompt += `\n\nTheir recent tracks: ${recentTracks.slice(0,2).map((t: Track) => `"${t.name}" by ${t.artists[0].name}`).join(', ')}`;
    }

    if (topTracks.length) {
      welcomePrompt += `\n\nTheir current favorites: ${topTracks.slice(0,2).map((t: Track) => `"${t.name}" by ${t.artists[0].name}`).join(', ')}`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 150,
      temperature: 0.9,
      system: welcomePrompt,
      messages: [{
        role: 'user',
        content: 'Start a natural conversation about my music.'
      }]
    });

    return NextResponse.json({
      welcome: response.content[0].text,
      currentTrack,
      recentTracks: recentTracks.slice(0, 2),
      topTracks: topTracks.slice(0, 2)
    });

  } catch (error) {
    console.error('Welcome Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate welcome',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 