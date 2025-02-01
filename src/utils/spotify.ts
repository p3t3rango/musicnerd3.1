import SpotifyWebApi from 'spotify-web-api-node';

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
    
    console.log('Raw Spotify Response:', {
      hasBody: !!data.body,
      hasItem: !!(data.body && data.body.item),
      isPlaying: data.body?.is_playing
    });
    
    if (!data.body || !data.body.item) {
      console.log('No track currently playing');
      return null;
    }

    const track = data.body.item;
    const trackInfo = {
      name: track.name,
      artists: track.artists.map(artist => artist.name),
      album: track.album.name,
      url: track.external_urls.spotify
    };
    
    console.log('Processed track info:', trackInfo);
    return trackInfo;
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