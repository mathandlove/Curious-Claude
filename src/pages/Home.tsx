import { useState, useEffect, useRef } from 'react';
import HeroPromptUI from '@/components/HeroPromptUI';
import PromptForm from '@/components/PromptForm';
import ClaudeResponse from '@/components/ClaudeResponse';


interface Message {
  id: string;
  type: 'user' | 'claude';
  content: string;
  isThinking?: boolean;
  error?: string | null;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [showGoalPrompt, setShowGoalPrompt] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [showSuggestionBanner, setShowSuggestionBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [conversation, showSuggestionBanner]);

  const handleTryPrompt = (prompt: string) => {
    // This will be handled by PromptForm - we'll pass the suggested prompt to it
    console.log('Try prompt:', prompt);
    setShowSuggestionBanner(false); // Hide the banner after trying a prompt
  };

  const handleBannerHide = () => {
    setShowSuggestionBanner(false);
    setBannerDismissed(true); // Mark banner as permanently dismissed
  };

  const handleBookmark = (prompt: string) => {
    // Handle bookmarking logic here
    console.log('Bookmark prompt:', prompt);
  };

  const handleGoalSelected = (goal: string) => {
    setSelectedGoal(goal);
    setShowGoalPrompt(false); // Hide the "Select Your Learning Goal" box
    setShowGoalSelector(false); // Hide the goal selector as well
    
    // Process the response now that goal is selected
    setTimeout(() => {
      setConversation(prev => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        
        if (lastMessage && lastMessage.isThinking) {
          lastMessage.content = `Based on your learning goal: "${goal}"\n\nThis is a detailed response that demonstrates how Claude would engage with your prompt. I would provide comprehensive, helpful information while maintaining a conversational and engaging tone.`;
          lastMessage.isThinking = false;
        }
        
        return updated;
      });
      setLoading(false);
      
      // Show suggestion banner after response is complete (only if not dismissed)
      if (!bannerDismissed) {
        setTimeout(() => {
          setShowSuggestionBanner(true);
        }, 50);
      }
    }, 10);
  };

  const handleSubmit = (submittedPrompt: string) => {
    setIsSubmitted(true);
    setLoading(true);

    // Add user message to conversation
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: submittedPrompt
    };

    // Add thinking Claude message
    const claudeMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'claude',
      content: '',
      isThinking: true
    };

    setConversation(prev => [...prev, userMessage, claudeMessage]);

    // Only show goal prompt and selector for the first submission
    if (conversation.length === 0) {
      // Show goal prompt after 1 second
      setTimeout(() => {
        setShowGoalPrompt(true);
      }, 10);

      // Show goal selector after 2 seconds
      setTimeout(() => {
        setShowGoalSelector(true);
      }, 20);
    }

    // For first submission, don't show Claude response until goal is selected
    // For subsequent submissions, show response immediately
    if (conversation.length === 0) {
      // First submission - wait for goal selection
      const processResponse = () => {
        if (!selectedGoal) return;
        
        setConversation(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          
          if (submittedPrompt.trim() === 'error') {
            lastMessage.error = 'An error occurred while processing your prompt.';
            lastMessage.content = '';
          } else {
            lastMessage.content = `Thank you for your thoughtful question: "${submittedPrompt}"\n\nBased on your learning goal: "${selectedGoal}"\n\nThis is a detailed response that demonstrates how Claude would engage with your prompt. I would provide comprehensive, helpful information while maintaining a conversational and engaging tone.`;
          }
          
          lastMessage.isThinking = false;
          return updated;
        });
        setLoading(false);
      };

      // Check if goal is already selected, otherwise wait for selection
      if (selectedGoal) {
        setTimeout(processResponse, 2000);
      }
    } else {
      // Subsequent submissions - respond immediately
      setTimeout(() => {
        setConversation(prev => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          
          if (submittedPrompt.trim() === 'error') {
            lastMessage.error = 'An error occurred while processing your prompt.';
            lastMessage.content = '';
          } else {
            lastMessage.content = `Based on your learning goal: "${selectedGoal}"\n\nThis is a detailed response that demonstrates how Claude would engage with your prompt. I would provide comprehensive, helpful information while maintaining a conversational and engaging tone.`;
          }
          
          lastMessage.isThinking = false;
          return updated;
        });
        setLoading(false);
        
        // Show suggestion banner after response is complete (only if not dismissed)
        if (!bannerDismissed) {
          setTimeout(() => {
            setShowSuggestionBanner(true);
          }, 50);
        }
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background relative ">
      {/* Hero section - takes up available space above form */}
      <div className="pb-20 h-[80vh] flex items-center justify-center">
        <HeroPromptUI visible={!isSubmitted} />
      </div>

      {/* Claude Response - fills space above form when submitted */}
      {isSubmitted && (
        <div ref={scrollContainerRef} className="absolute top-0 left-0 right-0 bottom-0 overflow-y-auto">
          <div className="pb-32">
            <ClaudeResponse
              visible={isSubmitted}
              conversation={conversation}
              showGoalPrompt={showGoalPrompt}
              showGoalSelector={showGoalSelector}
              onGoalSelected={handleGoalSelected}
              selectedGoal={selectedGoal}
            />
          </div>
        </div>
      )}

      {/* Prompt Form - fixed to bottom of screen */}
<div
  className={`fixed left-0 right-0 transition-all duration-1000 ease-in-out flex justify-center px-6 z-20`}
  style={{
    bottom: isSubmitted ? '0vh' : '40vh', // Move to bottom on submit
    alignItems: isSubmitted ? 'flex-end' : 'center', // Align content at the bottom after submission
    overflow: 'visible', // Allow banner to show above
  }}
>
        <div className="w-full max-w-3xl mx-auto">
          <PromptForm
            onSubmit={handleSubmit}
            loading={loading}
            response=""
            error={null}
            isAtBottom={isSubmitted}
            showSuggestionBanner={showSuggestionBanner}
            learningGoal={selectedGoal || ''}
            suggestedPrompt="Can you explain this concept using simple examples and real-world applications?"
            onTryPrompt={handleTryPrompt}
            onBookmark={handleBookmark}
            onBannerHide={handleBannerHide}
          />
        </div>
      </div>
    </div>
  );
}
