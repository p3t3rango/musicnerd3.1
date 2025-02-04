export interface SpotifyTrack {
  name: string;
  artists: string[];
  album: string;
  url: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  currentTrack?: SpotifyTrack;
  artistInfo?: any; // Define proper type based on your data structure
  musicProfile?: {
    recentTracks: any[];
    topTracks: any[];
  };
} 