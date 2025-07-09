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
    <div className={`transition-all duration-700 ease-in-out transform ${
      visible ? '-translate-y-[72px] opacity-100 pointer-events-auto' : 'translate-y-0 opacity-0 pointer-events-none'
    }`}>
      <div className="inline-flex items-center rounded-lg bg-[#2a2a2a] px-4 py-3 shadow-md w-auto mx-5 mt-4 mb-2">
        <div className="flex items-center gap-8">
          <p className="text-white text-sm flex items-center gap-1">
            <span>
              Found prompt to help with{' '}
              <span className="text-[#8f4733] font-semibold">
                {learningGoal}
              </span>
              .
            </span>
          </p>
          <div className="flex gap-2">
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
                className={`h-6 w-6 transition-all duration-200 ${
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