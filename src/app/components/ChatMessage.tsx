import React from 'react';
import SupportLinks from './SupportLinks';

interface ChatMessageProps {
  message: {
    role: string;
    content: string;
    musicData?: {
      spotifyData: any[];
      musicNerdData: any[];
    };
    currentTrack?: {
      name: string;
      artists: string[];
      album: string;
      url: string;
    };
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const extractSupportLinks = (musicData: any) => {
    // Early return if no music data
    if (!musicData?.musicNerdData || !Array.isArray(musicData.musicNerdData)) {
      return [];
    }
    
    const platforms: any[] = [];
    
    try {
      musicData.musicNerdData.forEach((data: any) => {
        if (data?.musicNerdInfo?.artistData) {
          const { artistData } = data.musicNerdInfo;
          
          // Add available platforms with null check
          if (artistData.soundxyz) {
            platforms.push({
              type: 'sound.xyz',
              url: artistData.soundxyz,
              icon: '/icons/soundxyz.svg'
            });
          }
          if (artistData.catalog) {
            platforms.push({
              type: 'catalog',
              url: artistData.catalog,
              icon: '/icons/catalog.svg'
            });
          }
          if (artistData.zora) {
            platforms.push({
              type: 'zora',
              url: artistData.zora,
              icon: '/icons/zora.svg'
            });
          }
          if (artistData.beatport) {
            platforms.push({
              type: 'beatport',
              url: artistData.beatport,
              icon: '/icons/beatport.svg'
            });
          }
          if (artistData.bandlab) {
            platforms.push({
              type: 'bandlab',
              url: artistData.bandlab,
              icon: '/icons/bandlab.svg'
            });
          }
        }
      });
    } catch (error) {
      console.error('Error extracting support links:', error);
      return [];
    }
    
    return platforms;
  };

  return (
    <div className={`message-bubble ${
      message.role === 'user' ? 'user-message' : 'assistant-message'
    }`}>
      <div className="message-content">
        {message.content}
      </div>
      
      {message.role === 'assistant' && message.musicData && (
        <SupportLinks 
          platforms={extractSupportLinks(message.musicData)}
          artistName={message.musicData.spotifyData?.[0]?.artists?.[0]?.name || ''}
        />
      )}

      {message.currentTrack && (
        <div className="mt-2 p-2 bg-black/20 rounded">
          <p className="text-sm">🎵 Currently Playing:</p>
          <p className="font-medium">
            {message.currentTrack.name} - {message.currentTrack.artists.join(', ')}
          </p>
          <p className="text-sm opacity-75">Album: {message.currentTrack.album}</p>
        </div>
      )}
    </div>
  );
} 