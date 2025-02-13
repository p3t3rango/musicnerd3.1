import React from 'react';
import { ChatMessageType, SupportLinks as SupportLinksType } from '@/types';
import SupportLinks from './SupportLinks';

interface ChatMessageProps {
  message: ChatMessageType;
}

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

export default function ChatMessage({ message }: ChatMessageProps) {
  const supportLinks = message.searchedArtist?.supportLinks || message.currentTrack?.artistInfo?.supportLinks;
  const formattedLinks = supportLinks ? formatSupportLinks(supportLinks) : null;

  return (
    <div className={`message-bubble ${
      message.role === 'user' ? 'user-message' : 'assistant-message'
    }`}>
      {/* Message Content */}
      <div className="message-content mb-4">
        {message.content}
      </div>

      {/* Support Links Widget */}
      {formattedLinks && Object.keys(formattedLinks).length > 0 && (
        <div className="mt-4 p-4 bg-white/10 rounded-lg">
          <h3 className="text-white font-semibold mb-2">
            Support {message.searchedArtist?.name || message.currentTrack?.artists[0]}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(formattedLinks).map(([platform, url]) => (
              url && (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#FF1493] text-white rounded-full text-sm hover:bg-opacity-80 transition-colors"
                >
                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
              )
            ))}
          </div>
        </div>
      )}

      {/* Now Playing Widget */}
      {message.currentTrack && (
        <div className="mt-2 p-4 bg-white/10 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Now Playing</h3>
          <p className="font-medium text-white">
            {message.currentTrack.name}
          </p>
          <p className="text-white/80">
            by {message.currentTrack.artists.join(', ')}
          </p>
          <p className="text-sm text-white/60">
            Album: {message.currentTrack.album}
          </p>
        </div>
      )}
    </div>
  );
} 