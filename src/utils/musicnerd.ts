import axios from 'axios';

const MUSICNERD_BASE_URL = 'https://api.musicnerd.xyz/api';

interface MusicNerdArtist {
  // Add your Artist schema here
  name: string;
  twitterHandle?: string;
  ethAddress?: string;
  // ... other fields
}

export async function getMusicNerdData(spotifyId: string, artistName: string) {
  try {
    console.log('Querying MusicNerd with:', { spotifyId, artistName });
    
    // Use MusicNerd's findArtistBySpotifyID endpoint
    const response = await fetch('https://api.musicnerd.xyz/api/findArtistBySpotifyID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spotifyID: spotifyId })
    });

    const spotifyIdData = await response.json();
    console.log('MusicNerd Spotify ID Response:', spotifyIdData);

    // If that fails, try finding by artist name
    if (!response.ok) {
      console.log('Spotify ID lookup failed, trying artist name');
      const nameResponse = await fetch('https://api.musicnerd.xyz/api/findTwitterHandle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: artistName })
      });
      const nameData = await nameResponse.json();
      console.log('MusicNerd Artist Name Response:', nameData);
      return nameData;
    }

    return spotifyIdData;
  } catch (error) {
    console.error('MusicNerd API Error:', error);
    return null;
  }
}

// Add a test function
export async function testMusicNerdConnection() {
  try {
    // Test with a known Spotify ID
    const response = await fetch('https://api.musicnerd.xyz/api/findArtistBySpotifyID', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        spotifyID: '3TVXtAsR1Inumwj472S9r4' // Drake's Spotify ID
      })
    });

    const data = await response.json();
    console.log('MusicNerd Test Response:', data);
    return data;
  } catch (error) {
    console.error('MusicNerd Connection Test Failed:', error);
    return null;
  }
} 