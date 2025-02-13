export interface SupportLinks {
  merch?: string[];
  bandcamp?: string;
  vinyl?: string[];
  official?: string;
  soundxyz?: string;
  other?: string[];
}

export interface ArtistInfo {
  name: string;
  supportLinks?: SupportLinks;
  social?: {
    twitter?: string;
    instagram?: string;
    discord?: string;
    // Add other social platforms as needed
  };
}

export interface SpotifyTrack {
  name: string;
  artists: string[];
  album: string;
  url: string;
  artistInfo?: ArtistInfo;
}

export interface Artist {
  id: string;
  name: string;
  spotify?: string;
  image?: string;
}

export interface MusicNerdData {
  id: string;
  name: string;
  // Streaming Platforms
  spotify?: string;
  soundcloud?: string;
  audius?: string;
  bandcamp?: string;
  // Social Media
  x?: string;
  instagram?: string;
  youtube?: string;
  facebook?: string;
  // Web3
  catalog?: string;
  rainbow?: string;
  'sound.xyz'?: string;
  zora?: string;
  // Discovery
  supercollector?: string;
  superbadge?: string;
  futuretape?: string;
  bandsintown?: string;
  // Additional Info
  genres?: string[];
  upcoming_shows?: Array<{
    date: string;
    venue: string;
    location: string;
    ticketUrl: string;
  }>;
  recent_releases?: Array<{
    title: string;
    platform: string;
    url: string;
    date: string;
  }>;
}

export interface ChatMessageType {
  role: 'user' | 'assistant';
  content: string;
  artistData?: MusicNerdData;
  currentTrack?: {
    name: string;
    artists: string[];
    album: string;
    artistInfo?: {
      supportLinks?: {
        [key: string]: string | string[];
      };
    };
  };
  searchedArtist?: {
    name: string;
    supportLinks?: {
      [key: string]: string | string[];
    };
  };
}

// We'll update this once we see the actual MusicNerd response
interface MusicNerdArtist {
  result: {
    supportLinks?: {
      // We'll fill this in based on actual response
    }
  }
} 