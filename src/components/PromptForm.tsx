import React, { useState, useEffect } from 'react';
import { ArrowUp, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PromptSuggestionBanner from './PromptSuggestionBanner';
import './PromptForm.css';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
  response: string;
  error: string | null;
  isAtBottom?: boolean;
  showSuggestionBanner?: boolean;
  learningGoal?: string;
  suggestedPrompt?: string;
  onTryPrompt?: (prompt: string) => void;
  onBookmark?: (prompt: string) => void;
  onBannerHide?: () => void;
  loadingAdvancedPrompt: boolean;
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
  loadingAdvancedPrompt = false,
}: PromptFormProps) {
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (suggestedPrompt) {
      setPrompt(suggestedPrompt);
    }
  }, [suggestedPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  const handleRandomPrompt = () => {
    const prompts = [
      'Write a paragraph on how efficiency affects modern circuit design.',
      'Write a paragraph on how deforestation affects the environment.',
      'Write a paragraph on what you look forward to about college.',
      'Write a paragraph about the importance of integrity in leadership.',
      "Write a chapter summary for Chapter 3 of 'The Scarlet Letter'.",
    ];
    const random = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(random);
  };

  const handleTryPrompt = (suggestedPrompt: string) => {
    if (onBannerHide) onBannerHide();
    if (onTryPrompt) onTryPrompt(suggestedPrompt);
  };
return (
  <div className="w-full max-w-3xl mx-auto relative">
    
    {/* Banner positioned just above the prompt input */}
    <div className="absolute bottom-full mb-3 left-0 right-0 z-0">
      <PromptSuggestionBanner
        visible={showSuggestionBanner}
        learningGoal={learningGoal}
        suggestedPrompt={suggestedPrompt}
        onTryPrompt={handleTryPrompt}
        onBookmark={onBookmark || (() => {})}
      />
    </div>

    {/* Prompt input form */}
    <form onSubmit={handleSubmit} className="relative z-10">
      <div className="rounded-xl bg-[#2a2a2a] border border-muted/30 p-4 flex items-center gap-3 text-muted-foreground shadow-lg">
        {/* Input Field */}
        <div className="flex-1">
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              loadingAdvancedPrompt
                ? 'Loading advanced prompt...'
                : 'How can I help you today?'
            }
            disabled={loading || loadingAdvancedPrompt}
            className={`w-full bg-[#2a2a2a] text-white placeholder:text-[#999] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c4a3f] border-none ${
              loadingAdvancedPrompt ? 'pulse-placeholder' : ''
            }`}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {!isAtBottom && (
            <Button
              type="button"
              onClick={handleRandomPrompt}
              className="bg-[#7c4a3f] hover:bg-[#92574a] rounded-lg p-3 text-white shadow-md"
            >
              <Dices className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading || !prompt.trim() || loadingAdvancedPrompt}
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
