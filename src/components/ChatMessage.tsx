import { ArtistLinks } from './ArtistLinks';
import { SupportLinks } from './SupportLinks';

export const ChatMessage = ({ message }) => {
  return (
    <div className={`chat-message ${message.role === 'assistant' ? 'assistant' : 'user'}`}>
      <div className="message-content">
        {message.content}
      </div>
      
      {message.role === 'assistant' && message.artistInfo && (
        <div className="mt-4 space-y-2">
          <ArtistLinks artistInfo={message.artistInfo} />
          <SupportLinks 
            links={message.artistInfo.supportLinks}
            artistName={message.artistInfo.name}
          />
        </div>
      )}
    </div>
  );
}; 