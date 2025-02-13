import React from 'react';
import { SupportLinks as SupportLinksType } from '@/types';

interface SupportLinksProps {
  links: SupportLinksType;
}

export default function SupportLinks({ links }: SupportLinksProps) {
  // Helper function to format support links
  const formatSupportLinks = (links: SupportLinksType = {}) => {
    const formattedLinks: Record<string, string> = {};
    
    if (links.soundxyz) formattedLinks.soundxyz = links.soundxyz;
    if (links.bandcamp) formattedLinks.bandcamp = links.bandcamp;
    if (links.official) formattedLinks.official = links.official;
    // Add single links for arrays
    if (links.merch?.[0]) formattedLinks.merch = links.merch[0];
    if (links.vinyl?.[0]) formattedLinks.vinyl = links.vinyl[0];
    if (links.other?.[0]) formattedLinks.other = links.other[0];
    
    return formattedLinks;
  };

  const formattedLinks = formatSupportLinks(links);

  if (!formattedLinks || Object.keys(formattedLinks).length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-white/10 rounded-lg">
      <h3 className="text-white font-semibold mb-2">Support Links</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(formattedLinks).map(([platform, url]) => (
          url && (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-pink-500 text-white rounded-full text-sm hover:bg-opacity-80 transition-colors"
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </a>
          )
        ))}
      </div>
    </div>
  );
} 