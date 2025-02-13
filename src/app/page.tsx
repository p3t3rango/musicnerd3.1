'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import ArtistSearch from '@/components/ArtistSearch';
import ArtistPanel from '@/components/ArtistPanel';
import ArtistChat from '@/components/ArtistChat';
import { Artist, ChatMessageType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import MusicNerdChat from '@/components/MusicNerdChat';

export default function Home() {
  const { data: session, status } = useSession();
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [chat, setChat] = useState<ChatMessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleArtistSelect = async (artist: Artist) => {
    setSelectedArtist(artist);
    setSearchLoading(true);
    try {
      const response = await fetch('/api/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artist: artist,
          prompt: `Generate a concise, informative bio for ${artist.name}. Focus on their musical journey, significant achievements, and artistic style. Keep it professional and factual.`
        })
      });
      
      const data = await response.json();
      setChat([data]);
    } catch (error) {
      console.error('Bio generation error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleFollowUpQuestion = async (question: string) => {
    if (!selectedArtist) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          artist: selectedArtist,
          conversationHistory: chat
        })
      });
      
      const data = await response.json();
      setChat(prev => [...prev, 
        { role: 'user', content: question },
        data
      ]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-5xl font-bold text-[#FF1493]">MusicNerd</h1>
          {status !== 'loading' && !session && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => signIn('spotify')}
              className="px-6 py-2 bg-[#FF1493] text-white rounded-full"
            >
              Sign in with Spotify
            </motion.button>
          )}
        </motion.div>

        {/* Main Search */}
        {session && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <ArtistSearch onArtistSelect={handleArtistSelect} />
          </motion.div>
        )}

        {/* Loading State */}
        {searchLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block animate-spin text-pink-500 text-4xl mb-4">
              ⭐
            </div>
            <p className="text-white/80">
              Gathering information about {selectedArtist?.name}...
            </p>
          </motion.div>
        )}

        {/* Artist Info Panel */}
        <AnimatePresence mode="wait">
          {selectedArtist && chat[0] && !searchLoading && chat[0].artistData && (
            <>
              <motion.div
                key={selectedArtist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                <ArtistPanel 
                  artist={selectedArtist}
                  bio={chat[0].content}
                  musicNerdData={chat[0].artistData}
                  loading={loading}
                />
              </motion.div>
              
              <MusicNerdChat 
                artist={selectedArtist}
                initialBio={chat[0].content}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
} 