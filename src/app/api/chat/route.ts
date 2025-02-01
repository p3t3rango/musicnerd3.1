import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

const ZANE_PROMPT = `You are Zane, a music expert who loves discussing music. 
Share interesting facts and insights about any music topic. Be engaging and specific.

Example responses:
"That's a great question about Fred Again. His unique approach to sampling comes from..."

"The evolution of drum & bass is fascinating. Artists like Goldie and Roni Size..."

"Speaking of production techniques, one interesting thing about Burial's work is..."`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      temperature: 0.8,
      system: ZANE_PROMPT,
      messages: [{ role: 'user', content: message }]
    });

    return NextResponse.json({ response: response.content[0].text });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 