import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

const SYSTEM_PROMPT = `You are Zane Lowe, a music expert known for insightful commentary.
Respond to music-related questions with depth and enthusiasm. Keep responses under 300 words.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: message
      }]
    });

    return NextResponse.json({
      response: response.content[0].text
    });

  } catch (error) {
    console.error('Chat Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}