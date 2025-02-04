// @ts-nocheck
import SpotifyWebApi from 'spotify-web-api-node';
import { getMusicBrainzData } from './musicbrainz';

export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

// Get user's currently playing track
export const getCurrentTrack = async (accessToken: string) => {
  try {
    if (!accessToken) {
      console.error('No access token provided to getCurrentTrack');
      return null;
    }

    spotifyApi.setAccessToken(accessToken);
    const data = await spotifyApi.getMyCurrentPlayingTrack();
    
    if (!data.body || !data.body.item) {
      console.log('No track currently playing');
      return null;
    }

    const track = data.body.item;
    const artistName = track.artists[0].name;
    
    // Fetch artist support links
    const artistData = await getMusicBrainzData(artistName);
    
    return {
      name: track.name,
      artists: track.artists.map(artist => artist.name),
      album: track.album.name,
      url: track.external_urls.spotify,
      artistInfo: {
        name: artistName,
        supportLinks: {
          merch: artistData.merchLinks,
          bandcamp: artistData.bandcampUrl,
          vinyl: artistData.vinylLinks,
          official: artistData.officialStore,
          soundxyz: artistData.soundxyzProfile,
          other: artistData.otherSupportLinks
        }
      }
    };

  } catch (error) {
    console.error('Error in getCurrentTrack:', error);
    return null;
  }
};

// Get user's top tracks
export const getTopTracks = async (accessToken: string, timeRange = 'medium_term') => {
  spotifyApi.setAccessToken(accessToken);
  const data = await spotifyApi.getMyTopTracks({ 
    limit: 10,
    time_range: timeRange // short_term (4 weeks), medium_term (6 months), long_term (years)
  });
  
  return data.body.items.map(track => ({
    name: track.name,
    artists: track.artists.map(artist => artist.name),
    album: track.album.name,
    url: track.external_urls.spotify
  }));
};

// Get user's top artists
export const getTopArtists = async (accessToken: string, timeRange = 'medium_term') => {
  spotifyApi.setAccessToken(accessToken);
  const data = await spotifyApi.getMyTopArtists({
    limit: 10,
    time_range: timeRange
  });
  
  return data.body.items.map(artist => ({
    name: artist.name,
    genres: artist.genres,
    popularity: artist.popularity,
    url: artist.external_urls.spotify
  }));
};

// Get user's recently played tracks
export const getRecentlyPlayed = async (accessToken: string) => {
  spotifyApi.setAccessToken(accessToken);
  const data = await spotifyApi.getMyRecentlyPlayedTracks({
    limit: 20
  });
  
  return data.body.items.map(item => ({
    name: item.track.name,
    artists: item.track.artists.map(artist => artist.name),
    album: item.track.album.name,
    playedAt: item.played_at,
    url: item.track.external_urls.spotify
  }));
};

// Get user's playlists
export const getUserPlaylists = async (accessToken: string) => {
  spotifyApi.setAccessToken(accessToken);
  const data = await spotifyApi.getUserPlaylists();
  
  return data.body.items.map(playlist => ({
    name: playlist.name,
    tracks: playlist.tracks.total,
    public: playlist.public,
    url: playlist.external_urls.spotify
  }));
};

// Get audio features of a track (tempo, key, danceability, etc.)
export const getTrackFeatures = async (accessToken: string, trackId: string) => {
  spotifyApi.setAccessToken(accessToken);
  const data = await spotifyApi.getAudioFeaturesForTrack(trackId);
  
  return {
    tempo: data.body.tempo,
    key: data.body.key,
    mode: data.body.mode,
    danceability: data.body.danceability,
    energy: data.body.energy,
    valence: data.body.valence, // musical positiveness
    instrumentalness: data.body.instrumentalness
  };
};

interface UserMusicProfile {
  recentTracks: Track[];
  topTracks: Track[];
  topArtists: Artist[];
  topGenres: string[];
  favoriteFeatures: AudioFeatures;
  playlists: Playlist[];
  listeningPatterns: {
    preferredGenres: string[];
    timeOfDay: string[];
    acousticness: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    valence: number;
  };
}

export const buildUserMusicProfile = async (accessToken: string): Promise<UserMusicProfile> => {
  spotifyApi.setAccessToken(accessToken);
  
  // Fetch all data in parallel
  const [
    recentTracks,
    topTracks,
    topArtists,
    playlists,
    savedTracks,
    followedArtists
  ] = await Promise.all([
    getRecentlyPlayed(accessToken),
    getTopTracks(accessToken),
    getTopArtists(accessToken),
    getUserPlaylists(accessToken),
    spotifyApi.getMySavedTracks({ limit: 50 }),
    spotifyApi.getFollowedArtists({ limit: 50 })
  ]);

  // Analyze audio features of top and saved tracks
  const trackIds = [...topTracks, ...savedTracks.body.items.map(item => item.track)]
    .map(track => track.id)
    .slice(0, 100); // Limit to 100 tracks for analysis

  const audioFeatures = await spotifyApi.getAudioFeaturesForTracks(trackIds);

  // Calculate average features
  const averageFeatures = audioFeatures.body.audio_features.reduce((acc, features) => ({
    acousticness: acc.acousticness + features.acousticness,
    danceability: acc.danceability + features.danceability,
    energy: acc.energy + features.energy,
    instrumentalness: acc.instrumentalness + features.instrumentalness,
    valence: acc.valence + features.valence
  }), {
    acousticness: 0,
    danceability: 0,
    energy: 0,
    instrumentalness: 0,
    valence: 0
  });

  Object.keys(averageFeatures).forEach(key => {
    averageFeatures[key] /= audioFeatures.body.audio_features.length;
  });

  // Extract genres from top artists and followed artists
  const allArtists = [...topArtists, ...followedArtists.body.artists.items];
  const genreCounts = allArtists.reduce((acc, artist) => {
    artist.genres?.forEach(genre => {
      acc[genre] = (acc[genre] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Get top genres
  const topGenres = Object.entries(genreCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([genre]) => genre);

  // Analyze listening patterns by time
  const timePatterns = recentTracks.reduce((acc, track) => {
    const hour = new Date(track.playedAt).getHours();
    const timeOfDay = hour < 6 ? 'night' : 
                     hour < 12 ? 'morning' : 
                     hour < 18 ? 'afternoon' : 'evening';
    acc[timeOfDay] = (acc[timeOfDay] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    recentTracks,
    topTracks,
    topArtists,
    topGenres,
    favoriteFeatures: averageFeatures,
    playlists: playlists.map(playlist => ({
      name: playlist.name,
      tracks: playlist.tracks,
      public: playlist.public
    })),
    listeningPatterns: {
      preferredGenres: topGenres,
      timeOfDay: Object.entries(timePatterns)
        .sort(([,a], [,b]) => b - a)
        .map(([time]) => time),
      ...averageFeatures
    }
  };
}; 