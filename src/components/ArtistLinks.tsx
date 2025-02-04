import { FaTwitter, FaEthereum } from 'react-icons/fa';
import { SiSoundxyz } from 'react-icons/si';
import { TbWorld } from 'react-icons/tb';

interface ArtistLinksProps {
  artistInfo: {
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
    };
  };
}

export const ArtistLinks = ({ artistInfo }: ArtistLinksProps) => {
  if (!artistInfo) return null;

  const { musicNerd, social, links } = artistInfo;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {/* Web3 Links */}
      {musicNerd?.ethAddress && (
        <a
          href={`https://etherscan.io/address/${musicNerd.ethAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 bg-[#627EEA] text-white rounded hover:opacity-90 text-sm"
        >
          <FaEthereum />
          <span>ETH</span>
        </a>
      )}

      {links?.sound_xyz && (
        <a
          href={links.sound_xyz}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 bg-[#FF4081] text-white rounded hover:opacity-90 text-sm"
        >
          <SiSoundxyz />
          <span>Sound.xyz</span>
        </a>
      )}

      {/* Social Links */}
      {social?.twitter && (
        <a
          href={`https://twitter.com/${social.twitter}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 bg-[#1DA1F2] text-white rounded hover:opacity-90 text-sm"
        >
          <FaTwitter />
          <span>@{social.twitter}</span>
        </a>
      )}

      {/* Official Links */}
      {links?.official && (
        <a
          href={links.official}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-white rounded hover:opacity-90 text-sm"
        >
          <TbWorld />
          <span>Website</span>
        </a>
      )}
    </div>
  );
}; 