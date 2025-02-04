import { SupportLinks } from './SupportLinks';
import { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  return (
    <div className={`chat-message ${message.role === 'assistant' ? 'assistant' : 'user'}`}>
      <div className="message-content">
        {message.content}
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