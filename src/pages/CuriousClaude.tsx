import { useState, useRef, useEffect } from 'react';
import HeroPromptUI from '@/components/HeroPromptUI';
import PromptForm from '@/components/PromptForm';
import ClaudeResponse from '@/components/ClaudeResponse';
import { postToClaude } from '@/api/claude';
import { type ShortGoalDescription, type AnalyzePromptResponse,type ClaudeTextResponse, type AdvancedLearningPrompt } from '../../backend/shared/claudeTypes';
import type { Message } from '../../backend/shared/messageTypes';
import './CuriousClaude.css';


import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { useFinalizeClaudeResponse } from '@/hooks/useFinalizeClaudeResponse';



export default function CuriousClaude() {
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

//Only show the advanced prompt if it has been loaded, and the user has clicked "Try this prompt".
useEffect(() => {
  if (tryPromptActivated && localAdvancedPrompt) {
    setAdvancedPrompt(localAdvancedPrompt);
  }
}, [tryPromptActivated, localAdvancedPrompt]);

  
//When the user clickes "Try this prompt", "The banner is dismmised, and we showing a loading animation, only if the advanced prompt is still loading.
const handleTryPrompt = () => {
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

  //I did not have time to make a bookmarking feature, but I imagine a way for users to save and use prompts they learned later.
  //This is a placeholder that could help with user interviews.
  const handleBookmark = (prompt: string) => {
    // Handle bookmarking logic here
    console.log('Bookmark prompt:', prompt);
  };

  //After a goal is selected, we 1. minimize the goal selector, 2. get a shortened description of that goal for the banner
  //3. Run a Backend call to get an advanced prompt (which takes more time),

const handleGoalSelected = async (goal: string) => {
  setSelectedGoal(goal);
  setShowGoalPrompt(false);
  setShowGoalSelector(false);

  const response = await postToClaude<ShortGoalDescription>('get-short-goal', {
    goal, 
  });

  setShortGoal(response.shortDescription);

  // We show claude response after the call to Claude for better user flow and timing (could be placed at beginning)
  setReadyToShowClaudeResponse(true);

//We do not show "loading" here as the user needs to click on "Try this prompt" before they can see we are loading.

const response2 = await postToClaude<AdvancedLearningPrompt>('get-advanced-prompt', {
  goal,
  prompt: instructions,
});

setLocalAdvancedPrompt(response2.prompt);
setLoadingAdvancedPrompt(false);


};

//The first submit triggers the showing a goal, but future submits mimic a chat conversation with Claude.

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

//Keeps history of conversation in conversation
  setConversation(prev => [...prev, userMessage, claudeMessage]);

  // Store this before state updates
  const isFirstPrompt = conversation.length === 0;

  // Analyze prompt (only on first prompt)
  if (isFirstPrompt) {
    try {

      //Looks for what learning goals the user has, and returns a list of 3 goals, and what the user actually requested in their instructions to be referenced in the advanced prompt.
      //TODO: This prompt works alright but I would like to do user research to understand what Learning Goals users resonate with rather than what Claude picks up.
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
  //TODO: This can be ran in parallel, but for for ease of prototyping was left sequential.
  try {
    let response: ClaudeTextResponse;
    
    if (isFirstPrompt) {

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
  className="absolute top-0 left-0 right-0 bottom-0 overflow-y-auto"
  style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
>
        <div className="pb-32 px-4 sm:px-6">
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
  className={`fixed left-0 right-0 transition-all duration-1000 ease-in-out flex justify-center px-3 sm:px-6 z-20`}
  style={{
    bottom: isSubmitted ? 'env(safe-area-inset-bottom, 0px)' : '15vh',
    alignItems: isSubmitted ? 'flex-end' : 'center',
    overflow: 'visible',
    paddingBottom: isSubmitted ? '1rem' : '0',
  }}
>
      <div className="w-full max-w-full sm:max-w-3xl mx-auto">
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
