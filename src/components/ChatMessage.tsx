import { SupportLinks } from './SupportLinks';
import { ChatMessage as ChatMessageType } from '@/types';
import { useEffect } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  // Add debugging info
  useEffect(() => {
    console.log('=== MESSAGE RENDER DEBUG ===');
    console.log('Message role:', message.role);
    console.log('Content length:', message.content.length);
    console.log('First 50 chars:', message.content.substring(0, 50));
    console.log('Last 50 chars:', message.content.substring(message.content.length - 50));
    console.log('=== END DEBUG ===');
  }, [message]);

  useEffect(() => {
    if (message.role === 'assistant') {
      console.log('=== RENDERING MESSAGE ===');
      console.log('Content:', message.content);
      console.log('Sentence count:', message.content.split(/[.!?]+\s*/).length);
      console.log('Word count:', message.content.split(/\s+/).length);
      console.log('=== END MESSAGE ===');
    }
  }, [message]);

  return (
    <div className={`chat-message ${message.role === 'assistant' ? 'assistant' : 'user'} mb-4`}>
      <div className="message-content bg-white/10 p-4 rounded-lg overflow-hidden">
        <p className="text-white whitespace-pre-wrap break-words max-w-full overflow-visible">
          {message.content}
        </p>
      </div>
      
      {message.role === 'assistant' && 
       message.artistInfo?.supportLinks && (
        <div className="mt-4 space-y-2">
          <SupportLinks 
            links={message.artistInfo.supportLinks}
            artistName={message.artistInfo.name || 'Artist'}
          />
        </div>
      )}
    </div>
  );
}; 