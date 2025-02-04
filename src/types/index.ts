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
    supportLinks: {
      merch?: string[];    // Store URLs
      bandcamp?: string;   // Bandcamp URL
      vinyl?: string[];    // Vinyl purchase URLs
      official?: string;   // Artist's official store
      soundxyz?: string;   // Sound.xyz profile
      other?: string[];    // Other support URLs
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