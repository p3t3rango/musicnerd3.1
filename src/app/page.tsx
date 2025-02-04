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

  // Poll for current track
  useEffect(() => {
    if (!session) return;

    const checkCurrentTrack = async () => {
      try {
        const response = await fetch('/api/spotify/now-playing/check');
        if (response.status === 200) {
          const trackData = await fetch('/api/spotify/now-playing').then(res => res.json());
          if (trackData.playing) {
            setCurrentTrack(trackData.track);
          }
        }
      } catch (error) {
        console.error('Error checking current track:', error);
      }
    };

    // Check immediately and then every 30 seconds
    checkCurrentTrack();
    const interval = setInterval(checkCurrentTrack, 30000);
    return () => clearInterval(interval);
  }, [session]);

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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Debug log the response
      console.log('Frontend received response:', {
        responseData: data,
        contentLength: data.content?.length,
        content: data.content
      });

      const assistantMessage: ChatMessageType = { 
        role: 'assistant', 
        content: data.content,
        currentTrack: data.currentTrack,
        artistInfo: data.artistInfo
      };
      
      console.log('Message being added to chat:', assistantMessage);
      
      setChat(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: ChatMessageType = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      };
      setChat(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Now Playing Widget */}
        {currentTrack && (
          <div className="bg-white/10 p-4 rounded-lg mb-4">
            <h2 className="text-white font-semibold mb-2">Now Playing</h2>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-white text-lg font-medium">
                  {currentTrack.name}
                </p>
                <p className="text-white/80">
                  {currentTrack.artists.join(', ')}
                </p>
                {currentTrack.album && (
                  <p className="text-white/60 text-sm">
                    {currentTrack.album}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="chat-container h-[600px] mb-4 p-4 overflow-y-auto"
        >
          <div className="max-w-full overflow-visible">
            {chat.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
          </div>
          
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