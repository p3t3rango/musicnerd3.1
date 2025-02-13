import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/config';
import { spotifyApi } from '@/utils/spotify';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { query } = await req.json();
    
    spotifyApi.setAccessToken(session.accessToken);
    const data = await spotifyApi.searchArtists(query, { limit: 5 });

    const artists = data.body.artists?.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      spotify: artist.id,
      image: artist.images?.[0]?.url
    })) || [];

    return NextResponse.json({ artists });
  } catch (error) {
    console.error('Artist search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
} 