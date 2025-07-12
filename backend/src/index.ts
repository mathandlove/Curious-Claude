// === Dependencies ===
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import { generateResponse, generateResponseWithConversation, generateShortGoalDescription, getInstructionsAnd3GoalsFromPrompt, generateAdvancedPrompt } from './claudeService.js';
import type { AdvancedLearningPrompt, AnalyzePromptResponse, ClaudeTextResponse, ShortGoalDescription } from '../shared/claudeTypes.js';
import type { Message } from '../shared/messageTypes.js';  
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility: recreate __dirname for file path operations This was required with backend in the same source file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config({ path: [ '.env'] });

// Parse comma-separated origins from env or use localhost fallback
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [''];

const app = express();

// === Middleware ===
// JSON parsing middleware
app.use(express.json());


console.log('Allowed Origins:', allowedOrigins);
// CORS configuration - allow requests from specified origins
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));


// === API Endpoints ===
// Health check endpoint for monitoring service status
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic Claude completion endpoint - single prompt to response
app.post(
  '/api/claude',
  async (
    req: Request<unknown, ClaudeTextResponse, { prompt?: string }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { prompt } = req.body;

      // Validate required prompt parameter
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Generate Claude response
      const result = await generateResponse(prompt);

      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/claude:', error);
      const message = error instanceof Error ? error.message : 'Failed to get response from Claude';
      res.status(500).json({ error: message });
    }
  }
);

// Conversation-based Claude completion endpoint - maintains chat history context
app.post(
  '/api/claude-conversation',
  async (
    req: Request<unknown, ClaudeTextResponse, { conversation?: Message[] }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { conversation } = req.body;


      if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
        return res.status(400).json({ error: 'Conversation array is required' });
      }

      // Generate response with conversation context
      const result = await generateResponseWithConversation(conversation);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/claude-conversation:', error);
      const message = error instanceof Error ? error.message : 'Failed to get response from Claude';
      res.status(500).json({ error: message });
    }
  }
);

// Analyze prompt and return external content with 3 learning goals
app.post(
  '/api/analyze-prompt',
  async (
    req: Request<unknown, AnalyzePromptResponse, { prompt?: string }>,
    res: Response<AnalyzePromptResponse | { error: string }>
  ) => {
    try {
      const { prompt } = req.body;


      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // Extract learning goals and external content from user prompt
      const result = await getInstructionsAnd3GoalsFromPrompt(prompt);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/analyze-prompt:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze prompt';
      res.status(500).json({ error: message });
    }
  }
);

// Generate shortened goal description for UI display
app.post(
  '/api/get-short-goal',
  async (
    req: Request<unknown, ShortGoalDescription, { goal?: string }>,
    res: Response<ShortGoalDescription | { error: string }>
  ) => {
  try {
    const { goal } = req.body;


    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    // Generate concise version of the goal for display purposes
    const result = await generateShortGoalDescription(goal);
    
    // Validate result has required shortDescription field
    if (!result || !result.shortDescription) {
      return res.status(500).json({ error: 'Failed to generate short goal description' });
    }

    res.json(result);
  } catch (error: unknown) {
    console.error('Error in /api/get-short-goal:', error);
    const message = error instanceof Error ? error.message : 'Failed to shorten goal';
    res.status(500).json({ error: message });
  }
});


// Generate advanced learning prompt from basic prompt and goal
app.post(
  '/api/get-advanced-prompt',
  async (
    req: Request,
    res: Response<AdvancedLearningPrompt | { error: string }>
  ) => {
    try {
      const { prompt, goal } = req.body;

      // Validate both prompt and goal are provided
      if (!prompt || !goal) {
        return res.status(400).json({ error: 'Prompt and goal are required' });
      }

      // Transform basic prompt into sophisticated learning prompt
      const result = await generateAdvancedPrompt(goal, prompt);

      // Ensure generated prompt is valid before returning
      if (!result || !result.prompt) {
        return res
          .status(500)
          .json({ error: 'Failed to generate professional prompt' });
      }

      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/get-advanced-prompt:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate prompt';
      res.status(500).json({ error: message });
    }
  }
);

// === Server Startup ===
// Server configuration: use PORT env var or default to 3001
const PORT = Number(process.env.PORT) || 3001;

// Start server with error handling
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});
