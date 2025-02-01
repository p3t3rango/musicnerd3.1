'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import ChatMessage from './components/ChatMessage';

interface MusicData {
  spotifyData: any[];
  musicNerdData: any[];
}

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: string;
  url: string;
}

interface NowPlayingResponse {
  playing: boolean;
  track?: SpotifyTrack;
  message?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  currentTrack?: {
    name: string;
    artists: string[];
    album: string;
    url: string;
  };
  musicProfile?: {
    recentTracks: any[];
    topTracks: any[];
  };
}

export default function Home() {
  const { data: session, status } = useSession();
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Get initial welcome message
  useEffect(() => {
    const getWelcome = async () => {
      if (status === 'authenticated' && chat.length === 0) {
        try {
          const response = await fetch('/api/chat/welcome');
          const data = await response.json();
          
          if (data.welcome) {
            setChat([{
              role: 'assistant',
              content: data.welcome,
              currentTrack: data.currentTrack,
              musicProfile: {
                recentTracks: data.recentTracks,
                topTracks: data.topTracks
              }
            }]);
          }
        } catch (error) {
          console.error('Error getting welcome message:', error);
        }
      }
    };

    getWelcome();
  }, [status, chat.length]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setChat(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        musicData: {
          spotifyData: data.spotifyData,
          musicNerdData: data.musicNerdData
        },
        currentTrack: data.currentTrack
      }]);
    } catch (error) {
      console.error('Error:', error);
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const getCurrentTrack = async () => {
    if (status === 'authenticated' && session?.accessToken) {
      try {
        const response = await fetch('/api/spotify/now-playing');
        const data: NowPlayingResponse = await response.json();
        
        if (data.playing && data.track) {
          setCurrentTrack(data.track);
          setIsPlaying(true);
        } else {
          setCurrentTrack(null);
          setIsPlaying(false);
        }
      } catch (error) {
        console.error('Error fetching current track:', error);
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      getCurrentTrack();
      const interval = setInterval(getCurrentTrack, 30000);
      return () => clearInterval(interval);
    }
  }, [status, session]);

  return (
    <main className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Login */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-bold text-[#FF1493] text-center">
            MusicNerd
          </h1>
          {!session ? (
            <button
              onClick={() => signIn('spotify')}
              className="bg-[#1DB954] text-white px-4 py-2 rounded-full hover:bg-[#1ed760] transition-colors"
            >
              Connect Spotify
            </button>
          ) : (
            <div className="flex items-center gap-4">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <button
                onClick={() => signOut()}
                className="text-white/80 hover:text-white"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Only show Currently Playing when there's a track */}
        {isPlaying && currentTrack && (
          <div className="mb-4 p-4 bg-white/10 rounded-lg">
            <p className="text-white/80">Currently Playing:</p>
            <p className="text-white font-bold">
              {currentTrack.name} - {currentTrack.artists[0].name}
            </p>
          </div>
        )}

        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="chat-container h-[600px] mb-4 p-4 overflow-y-auto"
        >
          {chat.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <div className="animate-pulse">
                Loading...
              </div>
            </div>
          ) : (
            <>
              {chat.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
            </>
          )}
          
          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-pulse text-[#FF1493]">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="input-container flex items-center p-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-transparent text-white p-2 focus:outline-none"
              placeholder="Ask about any song, artist, or album..."
            />
            <button
              type="submit"
              disabled={loading}
              className="send-button px-6 py-2 rounded-md text-white font-semibold disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-4 text-gray-400 text-sm">
          Powered by Spotify API & Claude
        </div>
      </div>
    </main>
  );
} 