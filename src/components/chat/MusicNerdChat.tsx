import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaComments, FaTimes } from 'react-icons/fa';
import { Artist, ChatMessageType } from '@/types';

interface MusicNerdChatProps {
  artist: Artist;
  initialBio: string;
}

export default function MusicNerdChat({ artist, initialBio }: MusicNerdChatProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<ChatMessageType[]>([]);
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Handle initial greeting
  useEffect(() => {
    async function initializeChat() {
      setLoading(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Using only verified information, give a brief, friendly intro as Zane and share one VERIFIED fact about ${artist.name}. If you don't have enough verified information, just give a friendly greeting and ask to learn more about the artist.`,
            artist: artist,
            verifiedData: initialBio,
            isGreeting: true,
            persona: 'zane'
          })
        });
        
        const data = await response.json();
        setChat([data]);
        setIsVisible(true);
        setIsOpen(true);
      } catch (error) {
        console.error('Chat error:', error);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      initializeChat();
    }, 2000);

    return () => clearTimeout(timer);
  }, [artist.name, initialBio]);

  const handleFollowUpQuestion = async (newQuestion: string) => {
    if (!newQuestion.trim() || loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newQuestion,
          artist: artist,
          conversationHistory: chat,
          persona: 'zane'
        })
      });
      
      const data = await response.json();
      setChat(prev => [...prev, 
        { role: 'user', content: newQuestion },
        data
      ]);
      setQuestion('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-4 right-4 z-50 md:bottom-8 md:right-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="bg-pink-500 p-4 rounded-full shadow-lg hover:bg-pink-600 transition-colors"
          >
            <FaComments className="w-6 h-6 text-white" />
          </motion.button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] md:w-96 bg-black border border-white/10 rounded-lg shadow-xl overflow-hidden"
              >
                {/* Chat content */}
                {/* ... rest of the chat UI ... */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
} 