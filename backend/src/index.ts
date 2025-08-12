// === Dependencies ===
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import { generateResponse, generateResponseWithConversation, generateShortGoalDescription, getInstructionsAnd3GoalsFromPrompt, generateAdvancedPrompt } from './claudeService.js';
import { generateAbsenceResponse, generateAbsenceConversationResponse, generateClarifyingQuestions, generatePolicyRecommendation, getCompanyPolicy, getAllPolicyOptions, getFederalAndStatePolicies } from './absenceClaudeService.js';
import type { AdvancedLearningPrompt, AnalyzePromptResponse, ClaudeTextResponse, ShortGoalDescription } from '../shared/claudeTypes.js';
import type { Message } from '../shared/messageTypes.js';  
import path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility: recreate __dirname for file path operations This was required with backend in the same source file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config({ path: '../.env' });

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
  origin: (origin, callback) => {
    if (!origin) {
      // Allow requests like Postman or curl
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`❌ Blocked by CORS: ${origin}`);
    return callback(new Error(`CORS error: ${origin} not allowed`));
  },
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

// Absence Navigator endpoint - Step 1: empathy + confirmation
app.post(
  '/api/absence',
  async (
    req: Request<unknown, ClaudeTextResponse, { request?: string }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { request } = req.body;

      if (!request) {
        return res.status(400).json({ error: 'Employee request is required' });
      }

      // Generate empathetic acknowledgment and confirmation response
      const result = await generateAbsenceResponse(request);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/absence:', error);
      const message = error instanceof Error ? error.message : 'Failed to process absence request';
      res.status(500).json({ error: message });
    }
  }
);

// Absence Navigator conversation endpoint - Step 2: Yes/No handling + policy options
app.post(
  '/api/absence-conversation',
  async (
    req: Request<unknown, ClaudeTextResponse, { conversation?: Message[] }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { conversation } = req.body;

      if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
        return res.status(400).json({ error: 'Conversation array is required' });
      }

      // Generate response based on conversation context (Yes/No handling + step 2)
      const result = await generateAbsenceConversationResponse(conversation);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/absence-conversation:', error);
      const message = error instanceof Error ? error.message : 'Failed to process conversation';
      res.status(500).json({ error: message });
    }
  }
);

// Absence Navigator clarifying questions endpoint - generates questions to help choose policies
app.post(
  '/api/absence-clarifying-questions',
  async (
    req: Request<unknown, ClaudeTextResponse, { policies?: any[] }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { policies } = req.body;

      if (!policies || !Array.isArray(policies)) {
        return res.status(400).json({ error: 'Policy options are required' });
      }

      // Generate clarifying questions based on available policies
      const result = await generateClarifyingQuestions(policies);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/absence-clarifying-questions:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate clarifying questions';
      res.status(500).json({ error: message });
    }
  }
);

// Absence Navigator policy recommendation endpoint - provides final recommendation based on answers
app.post(
  '/api/absence-policy-recommendation',
  async (
    req: Request<unknown, ClaudeTextResponse, { policies?: any[]; answers?: Record<string, string> }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { policies, answers } = req.body;

      if (!policies || !Array.isArray(policies)) {
        return res.status(400).json({ error: 'Policy options are required' });
      }

      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ error: 'Question answers are required' });
      }

      console.log('Received recommendation request with policies:', policies?.length, 'and answers:', Object.keys(answers));
      
      // Generate policy recommendation based on policies and user answers
      const result = await generatePolicyRecommendation(policies, answers);
      console.log('Recommendation result:', result);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/absence-policy-recommendation:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate policy recommendation';
      res.status(500).json({ error: message });
    }
  }
);

// Get federal and state policy options endpoint - no tool calling
app.post(
  '/api/federal-state-policies',
  async (
    req: Request<unknown, ClaudeTextResponse, { request?: string }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { request } = req.body;

      if (!request) {
        return res.status(400).json({ error: 'User request is required' });
      }

      console.log('Received federal state policies request:', request);
      
      // Get federal and state policy options without tool calling
      const result = await getFederalAndStatePolicies(request);
      console.log('Federal state policies result:', result);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/federal-state-policies:', error);
      const message = error instanceof Error ? error.message : 'Failed to get federal state policies';
      res.status(500).json({ error: message });
    }
  }
);

// Get all policy options endpoint - retrieves comprehensive policy list with company policies via tool calling
app.post(
  '/api/get-all-policy-options',
  async (
    req: Request<unknown, ClaudeTextResponse, { request?: string }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { request } = req.body;

      if (!request) {
        return res.status(400).json({ error: 'User request is required' });
      }

      console.log('Received all policy options request:', request);
      
      // Get all policy options using GetCompanyPolicy tool calling
      const result = await getAllPolicyOptions(request);
      console.log('All policy options result:', result);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/get-all-policy-options:', error);
      const message = error instanceof Error ? error.message : 'Failed to get all policy options';
      res.status(500).json({ error: message });
    }
  }
);

// Get company policy endpoint - retrieves Google's internal policies
app.post(
  '/api/get-company-policy',
  async (
    req: Request<unknown, ClaudeTextResponse, { request?: string }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { request } = req.body;

      if (!request) {
        return res.status(400).json({ error: 'Policy request is required' });
      }

      console.log('Received company policy request:', request);
      
      // Get company policy based on the request
      const result = await getCompanyPolicy(request);
      console.log('Company policy result:', result);
      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/get-company-policy:', error);
      const message = error instanceof Error ? error.message : 'Failed to get company policy';
      res.status(500).json({ error: message });
    }
  }
);

// Absence Navigator decision help endpoint - assists with policy selection
app.post(
  '/api/absence-decision-help',
  async (
    req: Request<unknown, ClaudeTextResponse, { question?: string; policies?: any[]; originalRequest?: string }>,
    res: Response<ClaudeTextResponse | { error: string }>
  ) => {
    try {
      const { question, policies, originalRequest } = req.body;

      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      // Mock decision help response for now - would integrate with absenceClaudeService
      const result: ClaudeTextResponse = {
        content: `I understand you need help deciding between the available policies. Let me help you think through this:

Based on your original request "${originalRequest || 'your situation'}", here's what I'd consider:

${policies?.map((policy: any, index: number) => 
  `${index + 1}. **${policy.title}**: ${policy.rationale}`
).join('\n\n') || 'Consider the specific policies that best match your situation.'}

Regarding your question "${question}", I'd recommend:
- Look at the confidence level and jurisdiction that applies to your specific state/location
- Consider whether you prefer a formal form process or direct request submission
- Think about timeline - some policies have specific deadlines or waiting periods

What specific aspect would you like me to help clarify further?`
      };

      res.json(result);
    } catch (error: unknown) {
      console.error('Error in /api/absence-decision-help:', error);
      const message = error instanceof Error ? error.message : 'Failed to provide decision help';
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
