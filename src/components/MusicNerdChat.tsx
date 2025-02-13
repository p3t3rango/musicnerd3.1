import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Artist, ChatMessageType } from '@/types';
import ArtistChat from './ArtistChat';

interface MusicNerdChatProps {
  artist: Artist;
  initialBio: string;
}

export default function MusicNerdChat({ artist, initialBio }: MusicNerdChatProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<ChatMessageType[]>([]);

  // Handle initial greeting
  useEffect(() => {
    async function initializeChat() {
      setLoading(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Give a brief, friendly intro as Zane and share ONE interesting fact about ${artist.name}. Keep it under 2 sentences.`,
            artist: artist,
            isGreeting: true,
            persona: 'zane'
          })
        });
        
        const data = await response.json();
        setChat([data]);
        // Only show chat after we have the response
        setIsVisible(true);
        setIsOpen(true);
      } catch (error) {
        console.error('Chat error:', error);
      } finally {
        setLoading(false);
      }
    }

    // Start the chat initialization after a delay
    const timer = setTimeout(() => {
      initializeChat();
    }, 2000);

    return () => clearTimeout(timer);
  }, [artist.name, artist]);

  const handleFollowUpQuestion = async (question: string) => {
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          artist: artist,
          conversationHistory: chat,
          persona: 'zane'
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
    <AnimatePresence>
      {isVisible && (
        <ArtistChat
          artistName={artist.name}
          onAskQuestion={handleFollowUpQuestion}
          loading={loading}
          messages={chat}
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
      )}
    </AnimatePresence>
  );
} 