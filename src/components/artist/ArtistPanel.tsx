import { Artist, MusicNerdData } from '@/types';
import { 
  FaSpotify, FaYoutube, FaInstagram, FaTwitter, FaSoundcloud, 
  FaBandcamp, FaFacebook, FaTicketAlt, FaMusic, FaHeadphones,
  FaCompactDisc, FaGlobe 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import LoadingSkeleton from './LoadingSkeleton';
import { IconType } from 'react-icons';
import { useState, useEffect } from 'react';
import { validateBandsInTownProfile } from '@/utils/bandsintown';
import { SiLinktree, SiSoundcloud, SiBandsintown } from 'react-icons/si';
import { FaTiktok } from 'react-icons/fa';
import { FaPatreon, FaTwitch } from 'react-icons/fa';
import SupportLinks from './SupportLinks';

interface ArtistPanelProps {
  artist: Artist;
  bio: string;
  musicNerdData: MusicNerdData;
  loading: boolean;
}

// First define valid platform keys
type PlatformKey = keyof MusicNerdData;

interface Platform {
  key: PlatformKey;
  label: string;
  icon: IconType;
  color: string;
  baseUrl: string;
}

function PlatformLink({ platform, handle }: { platform: Platform; handle: string | any[] }) {
  // Skip rendering if handle is an array
  if (Array.isArray(handle)) return null;
  
  const Icon = platform.icon;

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
      { key: 'bandcamp', icon: FaBandcamp, label: 'Bandcamp', color: 'bg-teal-500', baseUrl: 'bandcamp.com' },
      { key: 'audius', icon: FaHeadphones, label: 'Audius', color: 'bg-purple-500', baseUrl: 'audius.co' }
    ],
    social: [
      { key: 'x', icon: FaTwitter, label: 'Twitter', color: 'bg-blue-400', baseUrl: 'twitter.com' },
      { key: 'instagram', icon: FaInstagram, label: 'Instagram', color: 'bg-pink-500', baseUrl: 'instagram.com' },
      { key: 'youtubechannel', icon: FaYoutube, label: 'YouTube', color: 'bg-red-500', baseUrl: 'youtube.com' },
      { key: 'facebook', icon: FaFacebook, label: 'Facebook', color: 'bg-blue-600', baseUrl: 'facebook.com' }
    ],
    web3: [
      { key: 'sound.xyz', icon: FaMusic, label: 'Sound.xyz', color: 'bg-blue-500', baseUrl: 'sound.xyz' },
      { key: 'catalog', icon: FaCompactDisc, label: 'Catalog', color: 'bg-indigo-500', baseUrl: 'catalog.works' },
      { key: 'zora', icon: FaGlobe, label: 'Zora', color: 'bg-purple-500', baseUrl: 'zora.co' }
    ]
  };

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
        <div className="space-y-4">
          {/* Platform Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {musicNerdData?.spotify && (
              <motion.a
                href={`https://open.spotify.com/artist/${musicNerdData.spotify}`}
                className="bg-green-500 p-3 rounded-lg flex items-center gap-2 hover:opacity-90"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaSpotify className="w-5 h-5" />
                <span className="text-sm font-medium">Spotify</span>
              </motion.a>
            )}

            {musicNerdData?.soundcloud && (
              <motion.a
                href={`https://soundcloud.com/${musicNerdData.soundcloud}`}
                className="bg-orange-500 p-3 rounded-lg flex items-center gap-2 hover:opacity-90"
                whileHover={{ scale: 1.02 }}
              >
                <FaSoundcloud className="w-5 h-5" />
                <span className="text-sm font-medium">SoundCloud</span>
              </motion.a>
            )}

            {musicNerdData?.x && (
              <motion.a
                href={`https://twitter.com/${musicNerdData.x}`}
                className="bg-blue-400 p-3 rounded-lg flex items-center gap-2 hover:opacity-90"
                whileHover={{ scale: 1.02 }}
              >
                <FaTwitter className="w-5 h-5" />
                <span className="text-sm font-medium">Twitter</span>
              </motion.a>
            )}

            {musicNerdData?.instagram && (
              <motion.a
                href={`https://instagram.com/${musicNerdData.instagram}`}
                className="bg-pink-500 p-3 rounded-lg flex items-center gap-2 hover:opacity-90"
                whileHover={{ scale: 1.02 }}
              >
                <FaInstagram className="w-5 h-5" />
                <span className="text-sm font-medium">Instagram</span>
              </motion.a>
            )}

            {musicNerdData?.bandsintown && (
              <motion.a
                href={`https://www.bandsintown.com/${musicNerdData.bandsintown}`}
                className="bg-pink-600 p-3 rounded-lg flex items-center gap-2 hover:opacity-90"
                whileHover={{ scale: 1.02 }}
              >
                <FaTicketAlt className="w-5 h-5" />
                <span className="text-sm font-medium">Shows</span>
              </motion.a>
            )}

            {musicNerdData?.['sound.xyz'] && (
              <motion.a
                href={`https://sound.xyz/${musicNerdData['sound.xyz']}`}
                className="bg-blue-500 p-3 rounded-lg flex items-center gap-2 hover:opacity-90"
                whileHover={{ scale: 1.02 }}
              >
                <FaMusic className="w-5 h-5" />
                <span className="text-sm font-medium">Sound.xyz</span>
              </motion.a>
            )}

            {/* Add other platform widgets similarly */}
          </div>

          {/* Embedded Widgets */}
          <SupportLinks musicNerdData={musicNerdData} />

          {/* Show upcoming shows if available */}
          {musicNerdData?.upcoming_shows && musicNerdData.upcoming_shows.length > 0 && (
            <div className="mt-6">
              {musicNerdData.upcoming_shows.map((show, index) => (
                <motion.a
                  key={index}
                  href={show.ticketUrl}
                  className="block bg-white/5 p-4 rounded-lg mb-3 hover:bg-white/10"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="text-white">{show.date}</div>
                  <div className="text-white/80">{show.venue}</div>
                  <div className="text-white/60 text-sm">{show.location}</div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
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