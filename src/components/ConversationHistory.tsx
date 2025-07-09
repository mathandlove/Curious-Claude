import { useState } from 'react';
import './ConversationHistory.css';

export interface ConversationEntry {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  conversations: ConversationEntry[];
  onClear?: () => void;
}

export default function ConversationHistory({ conversations, onClear }: ConversationHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="conversation-history">
      <div className="history-header">
        <button 
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼' : '▶'} Conversation History ({conversations.length})
        </button>
        {onClear && (
          <button className="clear-button" onClick={onClear}>
            Clear History
          </button>
        )}
      </div>
      
      {isExpanded && (
        <div className="history-content">
          {conversations.map((entry) => (
            <div key={entry.id} className="conversation-entry">
              <div className="entry-timestamp">
                {entry.timestamp.toLocaleString()}
              </div>
              <div className="entry-prompt">
                <strong>You:</strong> {entry.prompt}
              </div>
              <div className="entry-response">
                <strong>Claude:</strong> {entry.response}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}