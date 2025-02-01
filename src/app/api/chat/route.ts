import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/config';
import { NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import { getCurrentTrack, getTopTracks, getTopArtists, getRecentlyPlayed } from '@/utils/spotify';

const MUSICNERD_BASE_URL = 'https://api.musicnerd.xyz';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

interface Artist {
  name: string;
  genres?: string[];
  popularity?: number;
  url?: string;
}

interface Track {
  name: string;
  artists: string[];
  album: string;
  url: string;
}

async function getMusicNerdData(spotifyId: string) {
  try {
    const artistResponse = await axios.post(`${MUSICNERD_BASE_URL}/api/findArtistBySpotifyID`, {
      spotifyID: spotifyId
    });
    
    const twitterResponse = await axios.post(`${MUSICNERD_BASE_URL}/api/findTwitterHandle`, {
      name: artistResponse.data.result.name
    });

    return {
      artistData: artistResponse.data.result,
      twitterHandle: twitterResponse.data.result
    };
  } catch (error) {
    console.error('MusicNerd API Error:', error);
    return null;
  }
}

const ZANE_LOWE_PROMPT = `You are Zane, a music expert who's deeply knowledgeable about artists and their work. Your responses should ALWAYS:
1. Start by specifically acknowledging the exact track/artist currently playing
2. Share one precise, interesting fact about that specific artist or track
3. Be concise and focused - no generic statements

DO NOT:
- Make generic statements about music
- Ask what they're listening to (you already know)
- Use filler phrases or unnecessary enthusiasm
- Pretend to not know what's playing

Example responses:
"Real Friends by Sound of Fractures - love this one. Jamie Reddington really pushed the boundaries here with those broken beats and atmospheric production. He crafted this during those late-night sessions at his East London studio, right after..."

"This new Fred Again track you're playing shows exactly why he's become such a force. The way he sampled those vocals from his phone recordings in Tokyo last summer gives it that raw, intimate feel that's become his signature."

"Ah, Four Tet's playing - this track specifically marked a shift in his production style. He actually built this entire beat around a 3-second harp sample he found on an old vinyl from..."`;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user's music context with error handling
    let currentTrack = null;
    let topTracks = [];
    let topArtists = [];
    let recentlyPlayed = [];

    try {
      [currentTrack, topTracks, topArtists, recentlyPlayed] = await Promise.all([
        getCurrentTrack(session.accessToken).catch(() => null),
        getTopTracks(session.accessToken).catch(() => []),
        getTopArtists(session.accessToken).catch(() => []),
        getRecentlyPlayed(session.accessToken).catch(() => [])
      ]);

      // Debug logging
      console.log('Current Track Data:', {
        currentTrack,
        accessToken: session.accessToken ? 'Present' : 'Missing'
      });

      if (!currentTrack) {
        console.log('No current track found - checking recent plays');
      }

    } catch (error) {
      console.error('Spotify API Error:', error);
    }

    // Build context message with stronger emphasis on current track
    let systemMessage = `You are Zane, a music nerd who MUST acknowledge the exact track playing right now.

CURRENT MUSIC CONTEXT (This is real-time data from Spotify):`;

    if (currentTrack) {
      systemMessage += `\n\nNOW PLAYING: "${currentTrack.name}" by ${currentTrack.artists.join(', ')}"

REQUIRED: Your first words must reference this exact track that's playing right now. Do not pretend you can't see what's playing - you have direct access to their Spotify data.`;
    } else if (recentlyPlayed.length) {
      const lastTrack = recentlyPlayed[0];
      systemMessage += `\n\nLast played: "${lastTrack.name}" by ${lastTrack.artists.join(', ')}"`;
    }

    // Add the rest of the context
    if (topArtists.length) {
      systemMessage += `\n\nTop Artists: ${topArtists.slice(0,3).map((a: Artist) => a.name).join(', ')}`;
    }

    const contextMessage = `${ZANE_LOWE_PROMPT}\n\n${systemMessage}`;
    console.log('Final Context to Claude:', contextMessage);

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        temperature: 0.8,
        system: contextMessage,
        messages: [{
          role: 'user',
          content: message
        }]
      });

      return NextResponse.json({
        response: response.content[0].text,
        currentTrack,
        musicProfile: {
          topArtists,
          topTracks,
          recentlyPlayed
        }
      });
    } catch (error) {
      console.error('Claude API Error:', error);
      return NextResponse.json({ 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Route Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 