import { Artist, MusicNerdData } from '@/types';
import { 
  FaSpotify, FaYoutube, FaInstagram, FaTwitter, FaSoundcloud, 
  FaBandcamp, FaFacebook, FaTicketAlt, FaLink, FaGlobe, FaMusic,
  FaHeadphones, FaWallet, FaCompactDisc 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { IconType } from 'react-icons';
import { useState, useEffect } from 'react';
import { validateBandsInTownProfile } from '@/utils/bandsintown';

interface ArtistPanelProps {
  artist: Artist;
  bio: string;
  musicNerdData: MusicNerdData;
  loading: boolean;
}

type Platform = {
  key: string;
  icon: IconType;
  label: string;
  color: string;
  baseUrl: string;
  category?: string;
};

function PlatformLink({ platform, handle }: { platform: Platform; handle: string }) {
  const Icon = platform.icon; // Assign to capitalized variable for React component

  return (
    <motion.a
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      href={`https://${platform.baseUrl}/${handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${platform.color} px-4 py-3 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition-opacity group`}
    >
      <Icon className="w-5 h-5 group-hover:animate-pulse" />
      <span className="text-sm font-medium truncate">{platform.label}</span>
    </motion.a>
  );
}

export default function ArtistPanel({ artist, bio, musicNerdData, loading }: ArtistPanelProps) {
  const [hasBandsInTown, setHasBandsInTown] = useState(false);

  // Handle Bandsintown validation
  useEffect(() => {
    async function checkBandsInTown() {
      if (musicNerdData?.bandsintown) {
        try {
          const isValid = await validateBandsInTownProfile(musicNerdData.bandsintown);
          setHasBandsInTown(isValid);
        } catch (error) {
          console.error('Error validating Bandsintown profile:', error);
          setHasBandsInTown(false);
        }
      }
    }

    checkBandsInTown();
  }, [musicNerdData?.bandsintown]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  const platformSections = {
    listen: [
      { key: 'spotify', icon: FaSpotify, label: 'Spotify', color: 'bg-green-500', baseUrl: 'open.spotify.com/artist' },
      { key: 'soundcloud', icon: FaSoundcloud, label: 'SoundCloud', color: 'bg-orange-500', baseUrl: 'soundcloud.com' },
      { key: 'audius', icon: FaHeadphones, label: 'Audius', color: 'bg-purple-500', baseUrl: 'audius.co' },
      { key: 'bandcamp', icon: FaBandcamp, label: 'Bandcamp', color: 'bg-teal-500', baseUrl: 'bandcamp.com' }
    ],
    social: [
      { key: 'x', icon: FaTwitter, label: 'X', color: 'bg-blue-400', baseUrl: 'twitter.com' },
      { key: 'instagram', icon: FaInstagram, label: 'Instagram', color: 'bg-pink-500', baseUrl: 'instagram.com' },
      { key: 'youtube', icon: FaYoutube, label: 'YouTube', color: 'bg-red-500', baseUrl: 'youtube.com' },
      { key: 'facebook', icon: FaFacebook, label: 'Facebook', color: 'bg-blue-600', baseUrl: 'facebook.com' }
    ],
    web3: [
      { key: 'catalog', icon: FaCompactDisc, label: 'Catalog', color: 'bg-indigo-500', baseUrl: 'catalog.works' },
      { key: 'rainbow', icon: FaWallet, label: 'Rainbow', color: 'bg-purple-400', baseUrl: 'rainbow.me' },
      { key: 'sound.xyz', icon: FaMusic, label: 'Sound.xyz', color: 'bg-blue-500', baseUrl: 'sound.xyz' },
      { key: 'zora', icon: FaGlobe, label: 'Zora', color: 'bg-black', baseUrl: 'zora.co' }
    ],
    discover: [
      { key: 'supercollector', icon: FaGlobe, label: 'Supercollector', color: 'bg-yellow-500', baseUrl: 'supercollector.com' },
      { key: 'superbadge', icon: FaGlobe, label: 'Superbadge', color: 'bg-green-400', baseUrl: 'superbadge.co' },
      { key: 'futuretape', icon: FaLink, label: 'Future Tape', color: 'bg-purple-600', baseUrl: 'futuretape.xyz' }
    ]
  } as const;

  const additionalSections = {
    upcoming_shows: musicNerdData?.upcoming_shows && (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Shows</h3>
        <div className="space-y-4">
          {musicNerdData.upcoming_shows.map((show, index) => (
            <div key={index} className="border-b border-white/10 last:border-0 pb-4">
              <div className="text-white font-medium">{show.date}</div>
              <div className="text-white/80">{show.venue}</div>
              <div className="text-white/60 text-sm">{show.location}</div>
              <a
                href={show.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block px-4 py-2 bg-pink-500 rounded-full text-sm text-white hover:bg-pink-600"
              >
                Get Tickets
              </a>
            </div>
          ))}
        </div>
      </div>
    ),
    recent_releases: musicNerdData?.recent_releases && (
      <div className="bg-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Releases</h3>
        <div className="space-y-4">
          {musicNerdData.recent_releases.map((release, index) => (
            <a
              key={index}
              href={release.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:bg-white/5 p-2 rounded transition-colors"
            >
              <div className="text-white font-medium">{release.title}</div>
              <div className="text-white/60 text-sm">
                {release.platform} • {release.date}
              </div>
            </a>
          ))}
        </div>
      </div>
    )
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column: Bio and Main Info */}
      <div className="space-y-6">
        {/* Artist Header */}
        <div className="bg-white/5 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            {artist.image && (
              <img src={artist.image} alt={artist.name} className="w-24 h-24 rounded-full" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{artist.name}</h2>
              {musicNerdData?.genres && (
                <div className="flex flex-wrap gap-2">
                  {musicNerdData.genres.map((genre: string) => (
                    <span key={genre} className="px-3 py-1 bg-pink-500/20 rounded-full text-sm text-white">
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="prose prose-invert max-w-none">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-5/6"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="text-white/90 leading-relaxed">{bio}</div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Platform Links */}
      <div className="space-y-6">
        {Object.entries(platformSections).map(([section, platforms]) => {
          const availablePlatforms = platforms.filter(p => musicNerdData?.[p.key]);
          if (availablePlatforms.length === 0) return null;

          return (
            <div key={section} className="bg-white/5 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 capitalize">
                {section === 'web3' ? 'Web3' : section}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {availablePlatforms.map((platform) => (
                  <PlatformLink
                    key={platform.key}
                    platform={platform}
                    handle={musicNerdData[platform.key]!}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Sections */}
      {Object.values(additionalSections)}

      {hasBandsInTown && (
        <a
          href={`https://www.bandsintown.com/${musicNerdData.bandsintown}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block px-4 py-2 bg-pink-500 rounded-full text-sm text-white hover:bg-pink-600"
        >
          View Tour Dates
        </a>
      )}
    </div>
  );
} 