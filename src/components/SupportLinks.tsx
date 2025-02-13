import { FaBandcamp, FaShoppingCart } from 'react-icons/fa';
import { SiSoundcloud, SiBeatport } from 'react-icons/si';
import { TbVinyl } from 'react-icons/tb';

interface ColorMap {
  [key: string]: string;
}

interface SupportLinksProps {
  platforms: {
    type: string;
    url: string;
    icon: string;
  }[];
  artistName: string;
}

export default function SupportLinks({ platforms, artistName }: SupportLinksProps) {
  const colors: ColorMap = {
    'bandcamp': 'bg-[#629aa9]',
    'official': 'bg-[#1DB954]',
    'sound.xyz': 'bg-purple-600',
    'catalog': 'bg-blue-600',
    'beatport': 'bg-cyan-600',
    'default': 'bg-gray-600'
  };

  return (
    <div className="bg-white/10 p-4 rounded-lg mt-2">
      <h3 className="text-white/80 font-semibold mb-2">Support {artistName}</h3>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform, index) => (
          <a
            key={index}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              ${colors[platform.type] || colors.default}
              flex items-center gap-2 px-4 py-2 rounded-full
              text-white text-sm font-medium
              transform transition-all duration-200
              hover:scale-105 hover:shadow-lg
            `}
          >
            <img src={platform.icon} alt={platform.type} className="w-4 h-4" />
            {platform.type === 'official' ? 'Official Store' : `Buy on ${platform.type}`}
          </a>
        ))}
      </div>
    </div>
  );
} 