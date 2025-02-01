import React from 'react';

type PlatformType = 'sound.xyz' | 'catalog' | 'zora' | 'beatport' | 'bandlab';

interface Platform {
  type: PlatformType | string;
  url: string;
  icon: string;
}

interface SupportLinksProps {
  platforms: Platform[];
  artistName: string;
}

interface ColorMap {
  [key: string]: string;
}

export default function SupportLinks({ platforms, artistName }: SupportLinksProps) {
  const colors: ColorMap = {
    'sound.xyz': 'bg-purple-600',
    'catalog': 'bg-blue-600',
    'zora': 'bg-green-600',
    'beatport': 'bg-cyan-600',
    'bandlab': 'bg-red-600',
    'default': 'bg-gray-600'
  };

  const getPlatformColor = (type: string): string => {
    return colors[type] || colors['default'];
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {platforms.map((platform, index) => (
        <a
          key={index}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            ${getPlatformColor(platform.type)}
            flex items-center gap-2 px-4 py-2 rounded-full
            text-white text-sm font-medium
            transform transition-all duration-200
            hover:scale-105 hover:shadow-lg
          `}
        >
          <img 
            src={platform.icon} 
            alt={platform.type}
            className="w-4 h-4"
          />
          Support on {platform.type}
        </a>
      ))}
    </div>
  );
} 