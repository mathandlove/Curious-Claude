import { useState, useEffect } from 'react';
import PolicyOption from './PolicyOption';
import { ArrowRight, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface PolicyOptionData {
  title: string;
  actionType: 'form' | 'request';
  description: string;
  keyBenefits?: string[];
  eligibilityRequirements?: string[];
  requestEndpoint?: string;
  jurisdiction: 'federal' | 'state' | 'company';
  confidence: 'high' | 'medium' | 'low';
  citations: string[];
  rationale: string;
}

interface PolicySelectorProps {
  options: PolicyOptionData[];
  onSelect: (option: PolicyOptionData) => void;
  onNeedHelp: () => void;
  onViewForm?: () => void;
}

export default function PolicySelector({ options, onSelect, onNeedHelp, onViewForm }: PolicySelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? options.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === options.length - 1 ? 0 : prev + 1));
  };

  const handleOptionSelect = (option: PolicyOptionData) => {
    onSelect(option);
  };

  const getVisibleCards = () => {
    if (options.length === 0) return [];
    
    if (options.length === 1) {
      return [{
        option: options[0],
        position: 0,
        index: 0
      }];
    }
    
    // On mobile, show only one card at a time
    if (isMobile) {
      return [{
        option: options[currentIndex],
        position: 0,
        index: currentIndex
      }];
    }
    
    if (options.length === 2) {
      return [
        {
          option: options[currentIndex === 0 ? 1 : 0],
          position: -1,
          index: currentIndex === 0 ? 1 : 0
        },
        {
          option: options[currentIndex],
          position: 0,
          index: currentIndex
        }
      ];
    }

    // Desktop: show 3 cards when we have 3+ policies
    const cards = [];
    for (let i = -1; i <= 1; i++) {
      const index = (currentIndex + i + options.length) % options.length;
      cards.push({
        option: options[index],
        position: i,
        index: index
      });
    }
    return cards;
  };

  const visibleCards = getVisibleCards();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 overflow-x-hidden px-2 sm:px-0">
      {/* Header - positioned to be below progress bar on desktop, top on mobile */}
      <div className="text-center pt-4 sm:pt-16 pb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Choose Your Best Option</h2>
        <p className="text-gray-400 text-xs sm:text-sm px-4 sm:px-0">
          Based on your situation, here are {options.length} policies that may apply. Navigate through them to find the best fit.
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        {options.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-30 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-full p-3 transition-all shadow-lg"
              aria-label="Previous policy"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-30 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-full p-3 transition-all shadow-lg"
              aria-label="Next policy"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </button>
          </>
        )}

        {/* Cards Container */}
        <div className="px-8 sm:px-20 py-4">
          <div className="relative flex items-center justify-center min-h-[350px] sm:min-h-[400px]">
            {visibleCards.map((card) => (
              <div
                key={card.index}
                className={`absolute transition-all duration-500 ease-in-out w-[250px] sm:w-[420px] ${
                  card.position === 0
                    ? 'z-20 scale-100 translate-x-0 opacity-100' // Center card
                    : card.position === -1
                    ? 'z-10 scale-[0.8] -translate-x-[85%] sm:-translate-x-[75%] opacity-70' // Left card
                    : 'z-10 scale-[0.8] translate-x-[85%] sm:translate-x-[75%] opacity-70' // Right card
                }`}
              >
                <div
                  className={`transform transition-all duration-300 h-[350px] ${
                    card.position === 0 ? 'cursor-default' : 'cursor-pointer hover:scale-105'
                  }`}
                  onClick={() => {
                    // On desktop, clicking side cards navigates
                    if (window.innerWidth >= 640) {
                      if (card.position === -1) {
                        handlePrevious();
                      } else if (card.position === 1) {
                        handleNext();
                      }
                    }
                    // Mobile uses only navigation arrows
                  }}
                >
                  <div className={`h-full overflow-y-auto overflow-x-hidden rounded-lg border-2 transition-all scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600 hover:scrollbar-thumb-gray-500 ${
                    card.position === 0 
                      ? 'border-[#7c4a3f] bg-[#1a1a1a] shadow-2xl shadow-[#7c4a3f]/30' 
                      : 'border-gray-700 bg-[#1a1a1a] hover:border-gray-600 shadow-lg shadow-black/20'
                  }`}>
                    <PolicyOption
                      option={card.option}
                      isSelected={card.position === 0}
                      onSelect={() => {}} // No-op - using dedicated button below
                      onViewForm={onViewForm}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicators */}
      {options.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-2">
          {options.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-[#7c4a3f] w-8'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to policy ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 pt-4 border-t border-gray-700 px-4 sm:px-0">
        <button
          onClick={onNeedHelp}
          className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#7c4a3f] hover:bg-[#92574a] text-white border-2 border-[#7c4a3f] hover:border-[#92574a] rounded-xl font-semibold text-sm sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full max-w-xs sm:max-w-none sm:w-auto"
        >
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-center">I need help deciding between these options</span>
        </button>
        
        <button
          onClick={() => handleOptionSelect(options[currentIndex])}
          className="flex items-center gap-2 sm:gap-3 px-8 sm:px-10 py-3 sm:py-4 bg-white hover:bg-gray-100 text-[#7c4a3f] border-2 border-[#7c4a3f] hover:border-[#92574a] rounded-xl font-bold text-lg sm:text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full max-w-xs sm:max-w-none sm:w-auto"
        >
          Choose This Policy
          <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </div>
  );
}