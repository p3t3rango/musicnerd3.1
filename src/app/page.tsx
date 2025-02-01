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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-bold text-[#FF1493] text-center">
            MusicNerd
          </h1>
          {/* Temporarily hide Spotify login
          {!session ? (
            <button
              onClick={() => signIn('spotify')}
              className="bg-[#1DB954] text-white px-4 py-2 rounded-full hover:bg-[#1ed760] transition-colors"
            >
              Connect Spotify
            </button>
          ) : (
            // ... session UI
          )} */}
        </div>

        {/* Temporarily show placeholder */}
        <div className="text-center text-white mt-20">
          <h2 className="text-2xl mb-4">Coming Soon</h2>
          <p>Our music AI chat is being configured. Check back soon!</p>
        </div>
      </div>
    </main>
  );
} 