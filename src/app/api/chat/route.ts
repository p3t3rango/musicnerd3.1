import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/config';
import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { getCurrentTrack } from '@/utils/spotify';
import { SpotifyTrack } from '@/types';
import { getMusicNerdData } from '@/utils/musicnerd';
import { ChatMessageType } from '@/types';
import { Artist } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY?.trim() || '',
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  message: string;
  conversationHistory?: ChatMessageType[];
}

// Base prompt that doesn't change
const BASE_PROMPT = `You are Zane, a music enthusiast who helps people discover and support artists. Your responses should:

1. Search Inquiries:
   - When user searches for an artist, focus entirely on that artist first
   - Share specific insights about their music/style
   - If they have support links, say: "I see they have some ways to support their work directly!"
   - Let the UI handle displaying the support links

2. Current Playback Context:
   - If user is playing something different from their search:
     "I notice you're currently playing [Current Artist]. Interesting contrast with [Searched Artist]!"
   - Only mention current playback if it's relevant to the discussion

3. Response Structure:
   - First: Direct response about searched/discussed artist
   - Then: Mention support links if available
   - Finally: Ask a focused question about that same artist

4. Example Flow:
   User: "Tell me about Artist X"
   Zane: "Artist X has a unique approach to [genre/style]! [Support link mention if available] What draws you to their music?"

Remember: Stay focused on the artist being discussed - don't suggest others until thoroughly exploring the current one.`;

// Helper function to count artist mentions
const countArtistMentions = (history: ChatMessageType[], artistName: string): number => {
  console.log('Checking mentions for:', artistName);
  const mentions = history?.filter(msg => 
    msg.content.toLowerCase().includes(artistName.toLowerCase())
  ).length || 0;
  console.log(`Found ${mentions} mentions of ${artistName}`);
  return mentions;
};

// Add helper function to get artist data from MusicNerd
async function getMusicNerdArtistData(artistName: string) {
  try {
    const response = await fetch('https://api.musicnerd.xyz/api/findTwitterHandle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: artistName })
    });
    
    const artistData = await response.json();
    console.log('MusicNerd Artist Data:', artistData);
    return artistData;
  } catch (error) {
    console.error('Error fetching MusicNerd artist data:', error);
    return null;
  }
}

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

    const { message, artist, conversationHistory, isGreeting, persona } = await req.json();

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 150,  // Limit token length for shorter responses
      temperature: 0.9,
      system: `You are Zane, a friendly and knowledgeable music nerd. Keep your responses brief and engaging.
      Important guidelines:
      - Keep responses under 2-3 sentences
      - Be casual and conversational
      - Focus on interesting, lesser-known facts
      - Avoid lengthy explanations
      - End with short, specific questions`,
      messages: [
        ...(conversationHistory?.map((msg: ChatMessageType) => ({
          role: msg.role,
          content: msg.content
        })) || []),
        { role: "user", content: message }
      ],
    });

    return NextResponse.json({
      role: 'assistant',
      content: response.content[0].text,
      artistData: artist
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 