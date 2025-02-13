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
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white font-semibold">Ask about {artistName}</h3>
              <button 
                onClick={() => onToggle()}
                className="text-white/60 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            {/* Messages */}
            <div className="h-[60vh] md:h-96 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-pink-500/10 ml-8' 
                        : 'bg-white/5 mr-8'
                    }`}
                  >
                    {msg.content}
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex space-x-2 justify-center text-pink-500"
                >
                  <span className="animate-bounce">•</span>
                  <span className="animate-bounce delay-100">•</span>
                  <span className="animate-bounce delay-200">•</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!question.trim() || loading) return;
                onAskQuestion(question);
                setQuestion('');
              }} 
              className="p-4 border-t border-white/10"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything about the artist..."
                  className="flex-1 p-2 bg-white/5 rounded border border-white/10 text-white focus:outline-none focus:border-pink-500/50"
                  disabled={loading}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="px-4 py-2 bg-pink-500 rounded text-white disabled:opacity-50"
                >
                  Send
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 