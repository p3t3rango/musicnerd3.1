import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/config';
import { NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  spotifyApi.setAccessToken(session.accessToken);

  try {
    const data = await spotifyApi.getMyCurrentPlayingTrack();
    
    // If no track is playing, return a 204 status (No Content)
    if (!data.body || !data.body.item) {
      return NextResponse.json({ 
        playing: false,
        message: 'No track currently playing'
      }, { status: 200 });
    }

    // Return track data if something is playing
    const track = data.body.item;
    return NextResponse.json({
      playing: true,
      track: {
        name: track.name,
        artists: track.artists.map(artist => ({ name: artist.name })),
        album: track.album.name,
        url: track.external_urls.spotify
      }
    });

  } catch (error) {
    console.error('Spotify API Error:', error);
    return NextResponse.json({ 
      playing: false,
      error: 'Failed to fetch current track'
    }, { status: 200 }); // Still return 200 to avoid frontend errors
  }
} 