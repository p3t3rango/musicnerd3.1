import axios from 'axios';

const MUSICNERD_BASE_URL = 'https://api.musicnerd.xyz/api';

interface MusicNerdArtist {
  // Add your Artist schema here
  name: string;
  twitterHandle?: string;
  ethAddress?: string;
  // ... other fields
}

export const getMusicNerdData = async (spotifyId: string, artistName: string) => {
  try {
    // Try to get artist data
    let artistData = null;
    try {
      const artistResponse = await axios.post(`${MUSICNERD_BASE_URL}/findArtistBySpotifyID`, {
        spotifyID: spotifyId
      });
      artistData = artistResponse.data.result;
    } catch (error) {
      // Ignore 404s for artists not found
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        console.error('Artist lookup error:', error);
      }
    }

    // Try to get Twitter handle
    let twitterHandle = null;
    try {
      const twitterResponse = await axios.post(`${MUSICNERD_BASE_URL}/findTwitterHandle`, {
        name: artistName
      });
      twitterHandle = twitterResponse.data.result;
    } catch (error) {
      // Ignore 404s for handles not found
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        console.error('Twitter handle lookup error:', error);
      }
    }

    // Return whatever data we found
    return {
      artist: artistData,
      socialMedia: {
        twitter: twitterHandle
      }
    };
  } catch (error) {
    console.error('MusicNerd API Error:', error);
    return null;
  }
}; 