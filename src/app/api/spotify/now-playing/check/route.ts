import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/config';
import { NextResponse } from 'next/server';
import { spotifyApi } from '@/utils/spotify';

// Lightweight endpoint just to check if track changed
export async function HEAD() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return new Response(null, { status: 401 });
    }

    spotifyApi.setAccessToken(session.accessToken);
    const data = await spotifyApi.getMyCurrentPlayingTrack();
    
    // Return 200 if track is playing, 204 if not
    return new Response(null, { 
      status: data.body && data.body.item ? 200 : 204 
    });

  } catch (error) {
    console.error('Track check error:', error);
    return new Response(null, { status: 500 });
  }
} 