import React, { useState } from 'react';
import { ArrowUp, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PromptSuggestionBanner from './PromptSuggestionBanner';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
  response: string;
  error: string | null;
  isAtBottom?: boolean; // Optional prop to trigger the position change
  showSuggestionBanner?: boolean;
  learningGoal?: string;
  suggestedPrompt?: string;
  onTryPrompt?: (prompt: string) => void;
  onBookmark?: (prompt: string) => void;
  onBannerHide?: () => void;
}

export default function PromptForm({ 
  onSubmit, 
  loading, 
  isAtBottom,
  showSuggestionBanner = false,
  learningGoal = '',
  suggestedPrompt = '',
  onTryPrompt,
  onBookmark,
  onBannerHide, 
}: PromptFormProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  const handleRandomPrompt = () => {
    const prompts = [
      "What is something you've changed your mind about recently?",
      "Explain AI to a 10-year-old.",
      "What would a utopian version of social media look like?",
      "How would you teach curiosity in school?",
      "Design a tool that helps people think more clearly."
    ];
    const random = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(random);
  };

  const handleTryPrompt = (suggestedPrompt: string) => {
    setPrompt(suggestedPrompt);
    if (onBannerHide) onBannerHide();
    if (onTryPrompt) onTryPrompt(suggestedPrompt);
  };

  return (
    
    <div className={`w-full max-w-3xl mx-auto relative`}>

      {/* Prompt Suggestion Banner - Starts under form, rises above */}
      <div className="absolute left-0 z-10">
        <PromptSuggestionBanner
          visible={showSuggestionBanner}
          learningGoal={learningGoal}
          suggestedPrompt={suggestedPrompt}
          onTryPrompt={handleTryPrompt}
          onBookmark={onBookmark || (() => {})}
        />
      </div>
      

      {/* Dark Chat Input Box */}
      <form onSubmit={handleSubmit} className="w-full relative z-10">
        <div className="rounded-xl bg-[#2a2a2a] border border-muted/30 p-4 flex items-center gap-3 text-muted-foreground shadow-lg">
          {/* Input Field */}
          <div className="flex-1">
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="How can I help you today?"
              disabled={loading}
              className="w-full bg-[#2a2a2a] text-white placeholder:text-[#999] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c4a3f] border-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleRandomPrompt}
              disabled={false}
              className={`bg-[#7c4a3f] hover:bg-[#92574a] rounded-lg p-3 text-white shadow-md transition-opacity duration-1000 ease-in-out ${
                isAtBottom ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <Dices className="h-4 w-4" />
            </Button>
            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-[#7c4a3f] hover:bg-[#92574a] rounded-lg p-3 text-white shadow-md"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
