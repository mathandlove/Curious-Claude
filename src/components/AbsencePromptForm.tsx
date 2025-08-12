import React, { useState } from 'react';
import { ArrowUp, Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import './PromptForm.css';

interface AbsencePromptFormProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
  response: string;
  error: string | null;
}

export default function AbsencePromptForm({
  onSubmit,
  loading,
}: AbsencePromptFormProps) {
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
      'I need to file for medical leave. I got in a car accident.',
      'I need to take time off for a family emergency.',
      'I need to request FMLA for the birth of my child.',
      'I need sick leave for surgery recovery.',
      'I need bereavement leave for a family member.',
      'I need to extend my current medical leave.',
      'I need to request unpaid time off for personal reasons.',
    ];
    const random = prompts[Math.floor(Math.random() * prompts.length)];
    setPrompt(random);
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative">
      {/* Prompt input form */}
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="rounded-xl bg-[#2a2a2a] border border-muted/30 p-4 flex items-center gap-3 text-muted-foreground shadow-lg">
          {/* Input Field */}
          <div className="flex-1">
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your absence or leave request..."
              disabled={loading}
              className="w-full bg-[#2a2a2a] text-white placeholder:text-[#999] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c4a3f] border-none"
            />
          </div>

          {/* Random Prompt Button */}
          <Button
            type="button"
            onClick={handleRandomPrompt}
            disabled={loading}
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-white hover:bg-muted/20 rounded-lg transition-colors"
            title="Get random example request"
          >
            <Dices className="h-5 w-5" />
          </Button>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="bg-[#7c4a3f] hover:bg-[#92574a] text-white rounded-lg px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
        </div>
      </form>
    </div>
  );
}