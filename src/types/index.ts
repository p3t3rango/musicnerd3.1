export interface SpotifyTrack {
  name: string;
  artists: string[];
  album: string;
  url: string;
  features?: {
    key: number;
    mode: number;
    tempo: number;
    timeSignature: number;
    danceability: number;
    energy: number;
    instrumentalness: number;
    acousticness: number;
    valence: number;
    loudness: number;
  } | null;
  artistInfo?: {
    name?: string;
    musicNerd?: {
      ethAddress?: string;
      // other MusicNerd fields
    };
    social?: {
      twitter?: string;
    };
    links?: {
      official?: string;
      sound_xyz?: string;
      bandcamp?: string;
      beatport?: string;
    };
    supportLinks?: {
      direct: string[];
      streaming: string[];
      purchase: string[];
    };
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  currentTrack?: SpotifyTrack;
  artistInfo?: SpotifyTrack['artistInfo'];
  musicProfile?: {
    recentTracks: SpotifyTrack[];
    topTracks: SpotifyTrack[];
  };
} 