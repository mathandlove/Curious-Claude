import { Loader2 } from 'lucide-react';

interface ClaudeMessageProps {
  response?: string;
  error?: string | null;
  isThinking: boolean;
}

export default function ClaudeMessage({ response, error, isThinking }: ClaudeMessageProps) {
  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-2xl">
        {isThinking && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-[#7c4a3f]" />
            <p className="text-sm">Thinking...</p>
          </div>
        )}
        
        {error && !isThinking && (
          <div className="text-red-400">
            <p className="text-sm font-medium mb-1">Something went wrong</p>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
        
        {response && !isThinking && !error && (
          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
            {response}
          </p>
        )}
      </div>
    </div>
  );
}