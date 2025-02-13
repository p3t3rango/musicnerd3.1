import { FaSpotify, FaYoutube, FaInstagram, FaTwitter, FaSoundcloud } from 'react-icons/fa';

interface ArtistLinksProps {
  data: {
    spotify?: string;
    youtube?: string;
    instagram?: string;
    x?: string;
    soundcloud?: string;
    bandcamp?: string;
    [key: string]: string | undefined;
  };
  name: string;
}

export default function ArtistLinks({ data, name }: ArtistLinksProps) {
  const platforms = [
    { key: 'spotify', icon: FaSpotify, color: 'bg-green-500' },
    { key: 'youtube', icon: FaYoutube, color: 'bg-red-500' },
    { key: 'instagram', icon: FaInstagram, color: 'bg-purple-500' },
    { key: 'x', icon: FaTwitter, color: 'bg-blue-400' },
    { key: 'soundcloud', icon: FaSoundcloud, color: 'bg-orange-500' }
  ];

  return (
    <div className="mt-4 p-4 bg-white/10 rounded-lg">
      <h3 className="text-white font-semibold mb-2">
        Follow {name} on
      </h3>
      <div className="flex flex-wrap gap-2">
        {platforms.map(({ key, icon: Icon, color }) => (
          data[key] && (
            <a
              key={key}
              href={`https://${key}.com/${data[key]}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${color} px-4 py-2 rounded-full text-white flex items-center gap-2 hover:opacity-90 transition-opacity`}
            >
              <Icon />
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </a>
          )
        ))}
      </div>
    </div>
  );
} 