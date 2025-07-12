import { useState } from 'react';
import {Bookmark } from 'lucide-react';

interface PromptSuggestionBannerProps {
  visible: boolean;
  learningGoal: string;
  suggestedPrompt: string;
  onTryPrompt: (prompt: string) => void;
  onBookmark: (prompt: string) => void;
}

export default function PromptSuggestionBanner({ 
  visible, 
  learningGoal, 
  suggestedPrompt, 
  onTryPrompt, 
  onBookmark 
}: PromptSuggestionBannerProps) {
  const [bookmarked, setBookmarked] = useState(false);

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark(suggestedPrompt);
  };

 return (
<div
  className={`absolute left-0 w-full max-w-4xl mx-auto transition-transform duration-500 ease-in-out
    ${visible ? 'translate-y-[20%] opacity-100' : 'translate-y-[100%] opacity-0 pointer-events-none'}
  `}
  style={{ bottom: '00' }}
>
      <div className="rounded-lg bg-[#2a2a2a] px-4 py-3 shadow-md w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Prompt Text */}
          <p className="text-white text-sm">
            Found prompt to help with{' '}
            <span className="text-[#8f4733] font-semibold">{learningGoal}</span>.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => onTryPrompt(suggestedPrompt)}
              className="whitespace-nowrap bg-[#8f4733] hover:bg-[#7a3e2b] text-white px-4 py-1 rounded-md text-sm transition-colors duration-200"
            >
              Try Prompt
            </button>
            <button
              onClick={handleBookmark}
              className="bg-transparent hover:bg-gray-700 px-2 py-1 rounded-md text-sm transition-colors duration-200 cursor-pointer active:scale-90"
            >
              <Bookmark
                className={`h-5 w-5 transition-all duration-200 ${
                  bookmarked
                    ? 'fill-[#8f4733] text-[#8f4733]'
                    : 'text-[#8f4733] hover:text-orange-400'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );



}