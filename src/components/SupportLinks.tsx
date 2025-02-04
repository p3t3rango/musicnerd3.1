import { FaBandcamp, FaShoppingCart } from 'react-icons/fa';
import { SiSoundcloud, SiBeatport } from 'react-icons/si';
import { TbVinyl } from 'react-icons/tb';

interface SupportLinksProps {
  links: {
    merch?: string[];
    bandcamp?: string;
    vinyl?: string[];
    official?: string;
    soundxyz?: string;
    other?: string[];
  };
  artistName: string;
}

export const SupportLinks = ({ links, artistName }: SupportLinksProps) => {
  return (
    <div className="bg-white/10 p-4 rounded-lg mt-2">
      <h3 className="text-white/80 font-semibold mb-2">Support {artistName}</h3>
      <div className="flex flex-wrap gap-2">
        {links.official && (
          <a 
            href={links.official} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-[#1DB954] text-white rounded-md hover:bg-[#1ed760] transition-colors"
          >
            <FaShoppingCart className="w-4 h-4" />
            <span>Official Store</span>
          </a>
        )}
        {links.bandcamp && (
          <a 
            href={links.bandcamp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-[#629aa9] text-white rounded-md hover:opacity-90 transition-opacity"
          >
            <FaBandcamp className="w-4 h-4" />
            <span>Bandcamp</span>
          </a>
        )}
        {links.vinyl?.map((link, i) => (
          <a 
            key={i} 
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-[#FF1493] text-white rounded-md hover:opacity-90 transition-opacity"
          >
            <TbVinyl className="w-4 h-4" />
            <span>Vinyl</span>
          </a>
        ))}
      </div>
    </div>
  );
}; 