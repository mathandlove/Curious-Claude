// Types shared between frontend (src) and backend (backend)

//
// Used in analyze-prompt
//
export interface AnalyzePromptResponse {
  promptInstructions: [instructions: string, externalText: string];
  goals: string[];
}

//
// Used in respond-to-prompt
//
export interface ClaudeTextResponse {
  content: string;
}

//
// Used for conversation-based prompts
//
export interface ConversationRequest {
  conversation: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

//
// Used in get-short-description
//
export interface ShortGoalDescription {
  shortDescription: string;
}


//
// Used in get-advanced-prompt
//
export interface AdvancedLearningPrompt {
  prompt: string;
}


//
// Used internally when parsing goal objects from Claude
// (get3GoalsFromInstructions)
export interface ClaudeGoalObject {
  goal: string;
}