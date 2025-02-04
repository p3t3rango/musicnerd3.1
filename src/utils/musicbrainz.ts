import axios from 'axios';

const MB_API_BASE = 'https://musicbrainz.org/ws/2';
const APP_USER_AGENT = 'MusicNerd/1.0 (contact@musicnerd.xyz)';

interface MusicBrainzArtist {
  name: string;
  disambiguation?: string;
  country?: string;
  'life-span'?: {
    begin?: string;
    end?: string;
  };
  tags?: Array<{ name: string }>;
  relations?: Array<{
    type: string;
    url?: { resource: string };
    target?: string;
  }>;
  area?: {
    name: string;
    'type-id'?: string;
  };
  begin_area?: {
    name: string;
  };
  gender?: string;
  type?: string;
  isnis?: string[];
  aliases?: Array<{
    name: string;
    'type-id'?: string;
    primary?: boolean;
  }>;
}

interface MusicBrainzRelease {
  title: string;
  date?: string;
  'release-events'?: Array<{
    date?: string;
    area?: { name: string };
  }>;
  media?: Array<{
    format?: string;
    'track-count'?: number;
  }>;
}

interface MusicBrainzRecording {
  title: string;
  length?: number;
  isrcs?: string[];
  releases?: Array<{
    title: string;
    status: string;
    date?: string;
    country?: string;
    'track-count'?: number;
    media?: Array<{
      format: string;
      title?: string;
    }>;
  }>;
}

interface ArtistPlatforms {
  official?: string;
  bandcamp?: string;
  soundcloud?: string;
  beatport?: string;
  catalog?: string;
  sound_xyz?: string;
  spotify?: string;
  apple_music?: string;
}

export const getMusicBrainzData = async (artistName: string, trackName?: string) => {
  try {
    // Search for artist
    const artistSearch = await axios.get(`${MB_API_BASE}/artist`, {
      params: {
        query: artistName,
        fmt: 'json'
      },
      headers: { 'User-Agent': APP_USER_AGENT }
    });

    if (!artistSearch.data.artists?.length) return null;

    const artistId = artistSearch.data.artists[0].id;

    // Get detailed artist info with relationships and aliases
    const [artistInfo, recordingInfo] = await Promise.all([
      axios.get(`${MB_API_BASE}/artist/${artistId}`, {
        params: {
          inc: 'url-rels tags releases aliases artist-rels area-rels place-rels',
          fmt: 'json'
        },
        headers: { 'User-Agent': APP_USER_AGENT }
      }),
      trackName ? axios.get(`${MB_API_BASE}/recording`, {
        params: {
          query: `artist:${artistName} AND recording:${trackName}`,
          fmt: 'json'
        },
        headers: { 'User-Agent': APP_USER_AGENT }
      }) : Promise.resolve(null)
    ]);

    const artist: MusicBrainzArtist = artistInfo.data;

    // Get associated acts
    const associatedActs = artist.relations
      ?.filter(rel => rel.type.includes('member of') || rel.type.includes('collaboration'))
      .map(rel => rel.target)
      .filter(Boolean) || [];

    // Get record labels
    const labels = artist.relations
      ?.filter(rel => rel.type === 'label')
      .map(rel => rel.target)
      .filter(Boolean) || [];

    // Get all platform links
    const platforms: ArtistPlatforms = {};
    artist.relations?.forEach(rel => {
      if (rel.type === 'official homepage') platforms.official = rel.url?.resource;
      if (rel.type === 'bandcamp') platforms.bandcamp = rel.url?.resource;
      if (rel.type === 'soundcloud') platforms.soundcloud = rel.url?.resource;
      if (rel.type === 'beatport') platforms.beatport = rel.url?.resource;
      if (rel.type === 'catalog') platforms.catalog = rel.url?.resource;
      if (rel.type === 'sound.xyz') platforms.sound_xyz = rel.url?.resource;
    });

    return {
      name: artist.name,
      aliases: artist.aliases?.map(alias => alias.name) || [],
      background: artist.disambiguation,
      origin: {
        country: artist.country,
        city: artist.begin_area?.name,
        scene: artist.area?.name
      },
      timeline: {
        formed: artist['life-span']?.begin,
        disbanded: artist['life-span']?.end,
        active: !artist['life-span']?.end
      },
      genres: artist.tags?.map(tag => tag.name) || [],
      associatedActs,
      labels,
      links: {
        official: artist.relations?.find(r => r.type === 'official homepage')?.url?.resource,
        wikipedia: artist.relations?.find(r => r.type === 'wikipedia')?.url?.resource,
        discogs: artist.relations?.find(r => r.type === 'discogs')?.url?.resource,
        bandcamp: artist.relations?.find(r => r.type === 'bandcamp')?.url?.resource,
        soundcloud: artist.relations?.find(r => r.type === 'soundcloud')?.url?.resource
      },
      // Add recording info if available
      recording: recordingInfo?.data.recordings?.[0] ? {
        title: recordingInfo.data.recordings[0].title,
        releases: recordingInfo.data.recordings[0].releases,
        isrcs: recordingInfo.data.recordings[0].isrcs
      } : null,
      platforms,
      supportLinks: {
        direct: [platforms.bandcamp, platforms.sound_xyz, platforms.catalog].filter(Boolean),
        streaming: [platforms.spotify, platforms.apple_music].filter(Boolean),
        purchase: [platforms.beatport].filter(Boolean)
      }
    };
  } catch (error) {
    console.error('MusicBrainz API Error:', error);
    return null;
  }
}; 