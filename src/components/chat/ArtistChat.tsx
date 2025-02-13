import { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessageType } from '@/types';

interface ArtistChatProps {
  artistName: string;
  onAskQuestion: (question: string) => Promise<void>;
  loading: boolean;
  messages: ChatMessageType[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function ArtistChat({ artistName, onAskQuestion, loading, messages, isOpen, onToggle }: ArtistChatProps) {
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-8 md:right-8">
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="bg-pink-500 p-4 rounded-full shadow-lg hover:bg-pink-600 transition-colors"
      >
        <FaComments className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[calc(100vw-2rem)] md:w-96 bg-black border border-white/10 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Rest of the component... */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 