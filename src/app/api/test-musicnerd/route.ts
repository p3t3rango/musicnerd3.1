import { NextResponse } from 'next/server';
import { testMusicNerdConnection } from '@/utils/musicnerd';

export async function GET() {
  try {
    const result = await testMusicNerdConnection();
    return NextResponse.json({ 
      success: true, 
      data: result,
      message: 'MusicNerd connection test completed'
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to MusicNerd',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 