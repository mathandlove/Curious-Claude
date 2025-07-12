// src/hooks/useFinalizeClaudeResponse.ts
import { useEffect } from 'react';
import type { Message } from '../../shared/messageTypes';




interface UseFinalizeClaudeResponseProps {
  pendingClaudeResponse: string | null;
  readyToShowClaudeResponse: boolean | null;
  setConversation: React.Dispatch<React.SetStateAction<Message[]>>;
  setPendingClaudeResponse: React.Dispatch<React.SetStateAction<string | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  bannerDismissed: boolean;
  setShowSuggestionBanner: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useFinalizeClaudeResponse({
  pendingClaudeResponse,
  readyToShowClaudeResponse,
  setConversation,
  setPendingClaudeResponse,
  setLoading,
  bannerDismissed,
  setShowSuggestionBanner,
}: UseFinalizeClaudeResponseProps) {
  useEffect(() => {
    if (pendingClaudeResponse && readyToShowClaudeResponse) {

      
      setConversation(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage?.isThinking) {
          lastMessage.content = pendingClaudeResponse;
          lastMessage.isThinking = false;
        }
        return updated;
      });
      setPendingClaudeResponse(null);
      setLoading(false);

      if (!bannerDismissed) {
        setTimeout(() => setShowSuggestionBanner(true), 50);
      }
    }
  }, [pendingClaudeResponse, readyToShowClaudeResponse]);
}
