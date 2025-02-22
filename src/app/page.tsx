'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import ChatMessage from './components/ChatMessage';

// Move interfaces to separate types file
import { SpotifyTrack, ChatMessage as ChatMessageType } from '@/types';

export default function Home() {
  const { data: session, status } = useSession();
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  // Scroll to bottom when chat updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

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

  // Function to fetch current track
  const getCurrentTrack = async () => {
    if (!session?.accessToken) return;
    
    try {
      const response = await fetch('/api/spotify/now-playing');
      const data = await response.json();
      
      if (data.playing && data.track) {
        const newTrackId = `${data.track.name}-${data.track.artists[0].name}`;
        if (newTrackId !== lastChecked) {
          setCurrentTrack(data.track);
          setLastChecked(newTrackId);
        }
      } else {
        setCurrentTrack(null);
      }
    } catch (error) {
      console.error('Error fetching current track:', error);
    }
  };

  // Handle chat submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    const newUserMessage: ChatMessageType = {
      role: 'user',
      content: message
    };
    
    setChat(prev => [...prev, newUserMessage]);
    setMessage('');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          conversationHistory: chat.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const assistantMessage: ChatMessageType = { 
        role: 'assistant', 
        content: data.response,
        currentTrack: data.currentTrack,
        artistInfo: data.artistInfo
      };
      
      setChat(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessageType = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setChat(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Check for track changes
  useEffect(() => {
    if (session?.accessToken) {
      getCurrentTrack();
      const interval = setInterval(async () => {
        const response = await fetch('/api/spotify/now-playing/check', {
          method: 'HEAD'
        });
        if (response.status === 200) {
          getCurrentTrack();
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [session]);

  const handleReauthorize = async () => {
    await signOut({ redirect: false });
    await signIn('spotify');
  };

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

        {/* Now Playing Widget - Make sure this is visible */}
        {isPlaying && currentTrack && (
          <div className="mb-4 p-4 bg-white/10 rounded-lg">
            <p className="text-white/80">Currently Playing:</p>
            <div className="text-white">
              <p className="font-bold text-lg">
                {currentTrack.name}
              </p>
              <p className="text-white/80">
                {currentTrack.artists.map((artist: string) => artist).join(', ')}
              </p>
              {currentTrack.album && (
                <p className="text-sm text-white/60">
                  Album: {currentTrack.album}
                </p>
              )}
            </div>
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

        {session?.error === 'RefreshAccessTokenError' && (
          <button
            onClick={handleReauthorize}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Re-authenticate with Spotify
          </button>
        )}
      </div>
    </main>
  );
} 