import { FaBandcamp, FaShoppingCart } from 'react-icons/fa';
import { SiSoundcloud, SiBeatport } from 'react-icons/si';
import { TbVinyl } from 'react-icons/tb';

interface SupportLinksProps {
  links: {
    direct?: string[];
    streaming?: string[];
    purchase?: string[];
  };
  artistName: string;
}

export const SupportLinks = ({ links, artistName }: SupportLinksProps) => {
  if (!links.direct?.length && !links.purchase?.length) return null;

  return (
    <div className="mt-4 p-4 bg-white/5 rounded-lg">
      <h3 className="text-white/90 font-medium mb-2">Support {artistName}</h3>
      <div className="flex flex-wrap gap-2">
        {links.direct?.map((link, i) => {
          if (link.includes('bandcamp')) {
            return (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-[#629aa9] text-white rounded-md hover:opacity-90 transition-opacity"
              >
                <FaBandcamp />
                <span>Bandcamp</span>
              </a>
            );
          }
          if (link.includes('sound.xyz')) {
            return (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-[#8B4513] text-white rounded-md hover:opacity-90 transition-opacity"
              >
                <TbVinyl />
                <span>Sound.xyz</span>
              </a>
            );
          }
          return null;
        })}
        
        {links.purchase?.map((link, i) => {
          if (link.includes('beatport')) {
            return (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-[#02FF95] text-black rounded-md hover:opacity-90 transition-opacity"
              >
                <SiBeatport />
                <span>Beatport</span>
              </a>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}; 