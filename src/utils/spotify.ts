// Temporarily disabled Spotify integration
export const getCurrentTrack = async () => null;
export const getTopTracks = async () => [];
export const getTopArtists = async () => [];
export const getRecentlyPlayed = async () => [];
export const getUserPlaylists = async () => [];
export const getTrackFeatures = async () => ({
  tempo: 0,
  key: 0,
  mode: 0,
  danceability: 0,
  energy: 0,
  valence: 0,
  instrumentalness: 0
}); 