export interface AnalyzePromptResponse {
    promptInstructions: [instructions: string, externalText: string];
    goals: string[];
}
export interface ClaudeTextResponse {
    content: string;
}
export interface ConversationRequest {
    conversation: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}
export interface ShortGoalDescription {
    shortDescription: string;
}
export interface AdvancedLearningPrompt {
    prompt: string;
}
export interface ClaudeGoalObject {
    goal: string;
}
//# sourceMappingURL=claudeTypes.d.ts.map