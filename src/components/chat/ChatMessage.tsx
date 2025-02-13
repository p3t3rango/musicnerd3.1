import React from 'react';
import { ChatMessageType, SupportLinks as SupportLinksType } from '@/types';
import SupportLinks from './SupportLinks';
import { useEffect } from 'react';

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

  // Add debugging info
  useEffect(() => {
    console.log('=== MESSAGE RENDER DEBUG ===');
    console.log('Message role:', message.role);
    console.log('Content length:', message.content.length);
    console.log('First 50 chars:', message.content.substring(0, 50));
    console.log('Last 50 chars:', message.content.substring(message.content.length - 50));
    console.log('=== END DEBUG ===');
  }, [message]);

  useEffect(() => {
    if (message.role === 'assistant') {
      console.log('=== RENDERING MESSAGE ===');
      console.log('Content:', message.content);
      console.log('Sentence count:', message.content.split(/[.!?]+\s*/).length);
      console.log('Word count:', message.content.split(/\s+/).length);
      console.log('=== END MESSAGE ===');
    }
  }, [message]);

  return (
    <div className={`message-bubble ${
      message.role === 'user' ? 'user-message' : 'assistant-message'
    }`}>
      {/* Message Content */}
      <div className="message-content mb-4">
        {message.content}
      </div>

      {/* Support Links Widget */}
      {message.role === 'assistant' && formattedLinks && Object.keys(formattedLinks).length > 0 && (
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

const extractSupportLinks = (musicData: any) => {
  if (!musicData?.musicNerdData) return [];
  
  const platforms: any[] = [];
  
  try {
    musicData.musicNerdData.forEach((data: any) => {
      // Prioritize direct support platforms
      if (data?.musicBrainz?.links?.bandcamp) {
        platforms.push({
          type: 'bandcamp',
          url: data.musicBrainz.links.bandcamp,
          icon: '/icons/bandcamp.svg',
          priority: 1
        });
      }
      
      if (data?.musicBrainz?.links?.official) {
        platforms.push({
          type: 'official',
          url: data.musicBrainz.links.official,
          icon: '/icons/store.svg',
          priority: 2
        });
      }

      // Add web3 platforms
      if (data?.musicNerdInfo?.artistData?.soundxyz) {
        platforms.push({
          type: 'sound.xyz',
          url: data.musicNerdInfo.artistData.soundxyz,
          icon: '/icons/soundxyz.svg',
          priority: 3
        });
      }

      // Sort platforms by priority
      return platforms.sort((a, b) => a.priority - b.priority);
    });
  } catch (error) {
    console.error('Error extracting support links:', error);
    return [];
  }
}; 