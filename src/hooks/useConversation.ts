import { useState, useCallback } from 'react';
import type { ConversationEntry } from '../components/ConversationHistory';
import { sendPromptToClaude } from '../api/claude';

export interface UseConversationReturn {
  conversations: ConversationEntry[];
  loading: boolean;
  error: string | null;
  currentResponse: string;
  sendMessage: (prompt: string) => Promise<void>;
  clearHistory: () => void;
  clearError: () => void;
}

export function useConversation(): UseConversationReturn {
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState('');

  const sendMessage = useCallback(async (prompt: string) => {
    setLoading(true);
    setError(null);
    setCurrentResponse('');

    try {
      const result = await sendPromptToClaude(prompt);
      const newEntry: ConversationEntry = {
        id: Date.now().toString(),
        prompt,
        response: result.response,
        timestamp: new Date(),
      };

      setConversations(prev => [...prev, newEntry]);
      setCurrentResponse(result.response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setConversations([]);
    setCurrentResponse('');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    conversations,
    loading,
    error,
    currentResponse,
    sendMessage,
    clearHistory,
    clearError,
  };
}