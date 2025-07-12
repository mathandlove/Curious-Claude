// Application constants
export const API_ENDPOINTS = {
  CLAUDE: 'claude',
  CLAUDE_CONVERSATION: 'claude-conversation',
  ANALYZE_PROMPT: 'analyze-prompt',
  GET_SHORT_GOAL: 'get-short-goal',
  GET_ADVANCED_PROMPT: 'get-advanced-prompt',
} as const;

export const MODELS = {
  HAIKU: 'claude-3-haiku-20240307',
  SONNET: 'claude-sonnet-4-20250514',
} as const;

export const UI_CONSTANTS = {
  MAX_RETRIES: 3,
  TRANSITION_DURATION: 1000,
  BANNER_DELAY: 50,
  SCROLL_BEHAVIOR: 'smooth',
} as const;

export const FALLBACK_GOALS = [
  'Learn how to understand core concepts',
  'Learn how to apply practical knowledge',
  'Learn how to think critically about topics',
] as const;