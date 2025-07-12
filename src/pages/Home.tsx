import { useState, useRef, useEffect } from 'react';
import HeroPromptUI from '@/components/HeroPromptUI';
import PromptForm from '@/components/PromptForm';
import ClaudeResponse from '@/components/ClaudeResponse';
import { postToClaude } from '@/api/claude';
import { type ShortGoalDescription, type AnalyzePromptResponse,type ClaudeTextResponse, type AdvancedLearningPrompt } from '../../shared/claudeTypes';
import type { Message } from '../../shared/messageTypes';


import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { useFinalizeClaudeResponse } from '@/hooks/useFinalizeClaudeResponse';



export default function Home() {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [showGoalPrompt, setShowGoalPrompt] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [shortGoal, setShortGoal] = useState<string | null>(null);
  const [showSuggestionBanner, setShowSuggestionBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [dynamicGoals, setDynamicGoals] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [pendingClaudeResponse, setPendingClaudeResponse] = useState<string | null>(null);
  const [readyToShowClaudeResponse, setReadyToShowClaudeResponse] = useState<boolean | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [advancedPrompt, setAdvancedPrompt] = useState<string | null>(null);
    const [localAdvancedPrompt, setLocalAdvancedPrompt] = useState<string | null>(null);
  const [loadingAdvancedPrompt, setLoadingAdvancedPrompt] = useState(false);
  const [tryPromptActivated, setTryPromptActivated] = useState(false);
  
useScrollToBottom(scrollContainerRef, [conversation, showSuggestionBanner]);

useFinalizeClaudeResponse({
  pendingClaudeResponse,
  readyToShowClaudeResponse,
  setConversation,
  setPendingClaudeResponse,
  setLoading,
  bannerDismissed,
  setShowSuggestionBanner,
});


useEffect(() => {
  if (tryPromptActivated && localAdvancedPrompt) {
    setAdvancedPrompt(localAdvancedPrompt);
  }
}, [tryPromptActivated, localAdvancedPrompt]);

  const handleTryPrompt = () => {
    // This will be handled by PromptForm - we'll pass the suggested prompt to it
    setTryPromptActivated(true);
    setShowSuggestionBanner(false); // Hide the banner after trying a prompt
    setBannerDismissed(true); // Mark banner as permanently dismissed
  if (localAdvancedPrompt === null) {
    setLoadingAdvancedPrompt(true);
  }

  };

  const handleBannerHide = () => {
    setShowSuggestionBanner(false);
    setBannerDismissed(true); // Mark banner as permanently dismissed
  };

  const handleBookmark = (prompt: string) => {
    // Handle bookmarking logic here
    console.log('Bookmark prompt:', prompt);
  };

const handleGoalSelected = async (goal: string) => {
  setSelectedGoal(goal);
  setShowGoalPrompt(false);
  setShowGoalSelector(false);

  const response = await postToClaude<ShortGoalDescription>('get-short-goal', {
    goal, 
  });

  setShortGoal(response.shortDescription);

  // Optional: wait to reveal Claude response
  setReadyToShowClaudeResponse(true);

  // Only generate advanced prompt if instructions are available
  
if (!instructions) {
  console.warn("Instructions not yet available");
  return;
}


const response2 = await postToClaude<AdvancedLearningPrompt>('get-advanced-prompt', {
  goal,
  prompt: instructions,
});

setLocalAdvancedPrompt(response2.prompt);
setLoadingAdvancedPrompt(false);


};


const handleSubmit = async (submittedPrompt: string) => {
  setIsSubmitted(true);
  setLoading(true);

  const userMessage: Message = {
    id: Date.now().toString(),
    type: 'user',
    content: submittedPrompt,
  };

  const claudeMessage: Message = {
    id: (Date.now() + 1).toString(),
    type: 'claude',
    content: '',
    isThinking: true,
  };

  // Use functional update to avoid stale state
  setConversation(prev => [...prev, userMessage, claudeMessage]);

  // Store this before state updates
  const isFirstPrompt = conversation.length === 0;

  // Analyze prompt (only on first prompt)
  if (isFirstPrompt) {
    try {
const response = await postToClaude<AnalyzePromptResponse>('analyze-prompt', {
  prompt: submittedPrompt,
});
      const [instructions] = response.promptInstructions;
      setInstructions(instructions);
      setDynamicGoals(response.goals);
      // setExternalSummary(external); // if needed later
      setShowGoalPrompt(true);
      setShowGoalSelector(true);
    } catch (error) {
      console.error('Error getting goals:', error);
      setShowGoalPrompt(true);
      setShowGoalSelector(true);
    }
  }

  // Call Claude API to generate a response
  try {
    let response: ClaudeTextResponse;
    
    if (isFirstPrompt) {
      // For first prompt, use single prompt endpoint
      response = await postToClaude<ClaudeTextResponse>('claude', {
        prompt: submittedPrompt,
      });
    } else {
      // For subsequent prompts, use conversation endpoint with full history
      const conversationForAPI = conversation.concat([userMessage]);
      response = await postToClaude<ClaudeTextResponse>('claude-conversation', {
        conversation: conversationForAPI,
      });
    }

    setPendingClaudeResponse(response.content);

  } catch (error) {
    console.error('Error from Claude API:', error);
    setConversation(prev => {
      const updated = [...prev];
      const lastMessage = updated[updated.length - 1];
      if (lastMessage?.isThinking) {
        lastMessage.error = 'An error occurred while processing your prompt.';
        lastMessage.content = '';
        lastMessage.isThinking = false;
      }
      return updated;
    });
    setLoading(false);
  }
};


 return (
  <div className="min-h-screen bg-background relative">
    {/* Hero section - takes up available space above form */}
    <div className="pb-20 h-[80vh] flex items-center justify-center">
      <HeroPromptUI visible={!isSubmitted} />
    </div>

    {/* Claude Response - fills space above form when submitted */}
    {isSubmitted && (
<div
  ref={scrollContainerRef}
  className="absolute top-0 left-0 md:left-20 right-0 bottom-0 overflow-y-auto"
>
        <div className="pb-32">
          <ClaudeResponse
            visible={isSubmitted}
            conversation={conversation}
            showGoalPrompt={showGoalPrompt}
            showGoalSelector={showGoalSelector}
            onGoalSelected={handleGoalSelected}
            selectedGoal={selectedGoal}
            dynamicGoals={dynamicGoals}
          />
        </div>
      </div>
    )}

    {/* Prompt Form - fixed to bottom of screen */}
<div
  className={`fixed left-0 right-0 transition-all duration-1000 ease-in-out flex justify-center px-6 z-20`}
  style={{
    bottom: isSubmitted ? '0vh' : '15vh', // was 40vh
    alignItems: isSubmitted ? 'flex-end' : 'center',
    overflow: 'visible',
  }}
>
      <div className="w-full max-w-sm sm:max-w-3xl mx-auto px-4 sm:px-6">
        <PromptForm
          onSubmit={handleSubmit}
          loading={loading}
          response=""
          error={null}
          isAtBottom={isSubmitted}
          showSuggestionBanner={showSuggestionBanner}
          learningGoal={shortGoal || ''}
          suggestedPrompt={advancedPrompt || ''}
          onTryPrompt={handleTryPrompt}
          onBookmark={handleBookmark}
          onBannerHide={handleBannerHide}
          loadingAdvancedPrompt={loadingAdvancedPrompt}
        />
      </div>
    </div>
  </div>
);

}
