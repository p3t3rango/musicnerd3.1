import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/config';
import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { getCurrentTrack, getTopTracks, getTopArtists, getRecentlyPlayed } from '@/utils/spotify';
import { SpotifyTrack } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY?.trim() || '',
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
const BASE_PROMPT = `You are Zane, a passionate music nerd who loves connecting with people over music. STRICT RESPONSE RULES:

1. First response structure (EXACTLY THREE SENTENCES):
   - ONE welcome: "Hey there!" or similar (under 5 words)
   - ONE insight about their music (under 15 words)
   - ONE question about the song (under 10 words)
   TOTAL LENGTH MUST BE UNDER 35 WORDS.

2. Follow-up responses (EXACTLY):
   - TWO sentences maximum
   - Must end with a question
   - Total 30 words maximum

3. After 3 messages about an artist/track, engage user about artist support:
   - Ask if they've ever supported the artist in any way
   - Share quick fact about how direct support helps artists
   - Let the UI handle showing support links

NEVER deviate from these formats.`;

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

    // In the POST function, before AI call
    const musicContext = `
    ${currentTrack ? `Currently playing: "${currentTrack.name}" by ${currentTrack.artists.join(', ')}"` : ''}
    ${recentlyPlayed.length ? `Recent tracks: ${recentlyPlayed[0].name} by ${recentlyPlayed[0].artists.join(', ')}` : ''}
    Message count: ${body.conversationHistory?.length || 0} - If over 2 messages about same artist, strongly encourage supporting them directly.
    `;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2048,
        temperature: 0.7,
        system: `${BASE_PROMPT}\n\nMusic Context: ${musicContext.trim()}`,
        messages: [
          ...body.conversationHistory || [],
          {
            role: 'user',
            content: `${body.message}\n\n${
              body.conversationHistory?.length === 0 
                ? 'FIRST RESPONSE FORMAT: Welcome (5 words). Insight (15 words). Question (10 words). EXACTLY THREE SENTENCES.'
                : 'Keep response between 30-50 words. End with a short question.'
            }`
          }
        ]
      });

      // Detailed logging of the raw response
      console.log('=== AI RESPONSE DEBUG ===');
      console.log('Raw response object:', response);
      console.log('Content array length:', response.content.length);
      console.log('First content item:', response.content[0]);
      console.log('Text length:', response.content[0].text.length);
      console.log('Full text:', response.content[0].text);
      console.log('=== END DEBUG ===');

      let completeResponse = response.content[0].text;
      
      // Validate and fix first response if needed
      if (body.conversationHistory?.length === 0) {
        const sentences = completeResponse.split(/[.!?]+\s*/);
        // Ensure exactly three sentences for first response
        if (sentences.length !== 3) {
          console.warn('First response wrong length, fixing...');
          // Extract or generate the three required parts
          const welcome = sentences[0] || 'Hey there';
          const insight = sentences[1] || `I see you're listening to ${currentTrack?.name}`;
          const question = sentences[2] || 'What draws you to this track?';
          completeResponse = `${welcome}. ${insight}. ${question}?`;
        }
        // Ensure it's not too long
        const words = completeResponse.split(/\s+/);
        if (words.length > 35) {
          completeResponse = words.slice(0, 35).join(' ');
          if (!completeResponse.endsWith('?')) {
            completeResponse += '?';
          }
        }
      } else {
        // For follow-up responses, limit to two sentences
        const sentences = completeResponse.split(/[.!?]+\s*/);
        if (sentences.length > 2) {
          completeResponse = sentences.slice(0, 2).join('. ') + '?';
        }
      }

      // Ensure it ends with punctuation
      if (!completeResponse.match(/[.!?]$/)) {
        completeResponse += '?';
      }

      // After getting AI response
      console.log('=== RESPONSE VALIDATION ===');
      console.log('Is first message:', body.conversationHistory?.length === 0);
      console.log('Original response:', response.content[0].text);
      console.log('Sentence count:', response.content[0].text.split(/[.!?]+\s*/).length);
      console.log('Word count:', response.content[0].text.split(/\s+/).length);
      console.log('=== END VALIDATION ===');

      return NextResponse.json({
        role: 'assistant',
        content: completeResponse,
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