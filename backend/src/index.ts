import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import { generateResponse, generateResponseWithConversation, generateShortGoalDescription, getInstructionsAnd3GoalsFromPrompt, generateAdvancedPrompt } from './claudeService';
import type { AdvancedLearningPrompt, AnalyzePromptResponse, ClaudeTextResponse, ShortGoalDescription } from '../../shared/claudeTypes';
import type { Message } from '../../shared/messageTypes';  
import path from 'path';

const allowedOrigins = [
  'https://curious-claude-8kzt36usl-elliott-hedmans-projects.vercel.app',
  'http://localhost:5173' // optional, for local dev
];




const app = express();
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}


app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));

dotenv.config();


const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Basic Claude completion endpoint
app.post(
  '/api/claude',
  async (
    req: Request<unknown, ClaudeTextResponse, { prompt?: string }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const result = await generateResponse(prompt);

      // ✅ Align with ClaudeTextResponse { content: string }
    res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/claude:', error);
      const message = error instanceof Error ? error.message : 'Failed to get response from Claude';
      res.status(500).json({ error: message });
    }
  }
);

// Conversation-based Claude completion endpoint
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

      const result = await generateResponseWithConversation(conversation);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/claude-conversation:', error);
      const message = error instanceof Error ? error.message : 'Failed to get response from Claude';
      res.status(500).json({ error: message });
    }
  }
);

//passes in prompt and returns external content and 3 goals
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

      const result = await getInstructionsAnd3GoalsFromPrompt(prompt);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/analyze-prompt:', error);
      const message = error instanceof Error ? error.message : 'Failed to analyze prompt';
      res.status(500).json({ error: message });
    }
  }
);

app.post('/api/get-short-goal', async (req: Request, res: Response<ShortGoalDescription | { error: string }>) => {
  try {
    const { goal } = req.body;

    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    const result = await generateShortGoalDescription(goal);
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


app.post(
  '/api/get-advanced-prompt',
  async (
    req: Request,
    res: Response<AdvancedLearningPrompt | { error: string }>
  ) => {
    try {
      const { prompt, goal } = req.body;

      if (!prompt || !goal) {
        return res.status(400).json({ error: 'Prompt and goal are required' });
      }

      const result = await generateAdvancedPrompt(goal, prompt);

      if (!result || !result.prompt) {
        return res
          .status(500)
          .json({ error: 'Failed to generate professional prompt' });
      }

      res.json( result );
    } catch (error: unknown) {
      console.error('Error in /api/get-professional-prompt:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate prompt';
      res.status(500).json({ error: message });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});
