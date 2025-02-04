import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/config';
import { NextResponse } from 'next/server';
import { getCurrentTrack } from '@/utils/spotify';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      console.error('No access token in session');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const trackInfo = await getCurrentTrack(session.accessToken);
    console.log('Now Playing Track Info:', trackInfo); // Debug log

    if (!trackInfo) {
      return NextResponse.json({ 
        playing: false,
        message: 'No track currently playing'
      });
    }

    return NextResponse.json({
      playing: true,
      track: {
        name: trackInfo.name,
        artists: trackInfo.artists.map(artist => ({ name: artist })),
        album: trackInfo.album,
        url: trackInfo.url,
        features: trackInfo.features,
        analysis: trackInfo.analysis
      }
    });

  } catch (error) {
    console.error('Now Playing Error:', error);
    return NextResponse.json({ 
      playing: false,
      error: 'Failed to fetch current track'
    });
  }
} 