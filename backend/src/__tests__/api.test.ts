import request from 'supertest';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Mock the claudeService module
jest.mock('../claudeService', () => ({
  generateResponse: jest.fn(),
  generateResponseWithConversation: jest.fn(),
  generateShortGoalDescription: jest.fn(),
  getInstructionsAnd3GoalsFromPrompt: jest.fn(),
  generateAdvancedPrompt: jest.fn()
}));

// Import mocked functions
import {
  generateResponse,
  generateResponseWithConversation,
  generateShortGoalDescription,
  getInstructionsAnd3GoalsFromPrompt,
  generateAdvancedPrompt
} from '../claudeService';

describe('API Endpoints', () => {
  let app: express.Application;

  beforeAll(() => {
    // Load test environment
    dotenv.config({ path: ['.env.test', '.env.local', '.env'] });
    
    // Create test app with same configuration as main app
    app = express();
    
    // Parse comma-separated origins from env or use localhost fallback
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:5173'];

    // JSON parsing middleware
    app.use(express.json());

    // CORS configuration - allow requests from specified origins
    app.use(cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }));

    // Health check endpoint for monitoring service status
    app.get('/health', (_req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Basic Claude completion endpoint - single prompt to response
    app.post(
      '/api/claude',
      async (req, res) => {
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
      async (req, res) => {
        try {
          const { conversation } = req.body;

          // Validate conversation array exists and has messages
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
      async (req, res) => {
        try {
          const { prompt } = req.body;

          // Validate required prompt parameter
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
      async (req, res) => {
        try {
          const { goal } = req.body;

          // Validate required goal parameter
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
      }
    );

    // Generate advanced learning prompt from basic prompt and goal
    app.post(
      '/api/get-advanced-prompt',
      async (req, res) => {
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
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  describe('GET /health', () => {
    it('should return OK status with timestamp', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('POST /api/claude', () => {
    it('should return Claude response for valid prompt', async () => {
      const mockResponse = { content: 'Test response from Claude' };
      (generateResponse as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/claude')
        .send({ prompt: 'Test prompt' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(generateResponse).toHaveBeenCalledWith('Test prompt');
    });

    it('should return 400 for missing prompt', async () => {
      const response = await request(app)
        .post('/api/claude')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Prompt is required' });
    });

    it('should return 400 for empty prompt', async () => {
      const response = await request(app)
        .post('/api/claude')
        .send({ prompt: '' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Prompt is required' });
    });

    it('should handle service errors gracefully', async () => {
      (generateResponse as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app)
        .post('/api/claude')
        .send({ prompt: 'Test prompt' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Service unavailable' });
    });

    it('should handle unknown errors', async () => {
      (generateResponse as jest.Mock).mockRejectedValue('Unknown error');

      const response = await request(app)
        .post('/api/claude')
        .send({ prompt: 'Test prompt' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to get response from Claude' });
    });
  });

  describe('POST /api/claude-conversation', () => {
    const validConversation = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' }
    ];

    it('should return Claude response for valid conversation', async () => {
      const mockResponse = { content: 'Conversation response' };
      (generateResponseWithConversation as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/claude-conversation')
        .send({ conversation: validConversation });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(generateResponseWithConversation).toHaveBeenCalledWith(validConversation);
    });

    it('should return 400 for missing conversation', async () => {
      const response = await request(app)
        .post('/api/claude-conversation')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Conversation array is required' });
    });

    it('should return 400 for empty conversation array', async () => {
      const response = await request(app)
        .post('/api/claude-conversation')
        .send({ conversation: [] });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Conversation array is required' });
    });

    it('should return 400 for non-array conversation', async () => {
      const response = await request(app)
        .post('/api/claude-conversation')
        .send({ conversation: 'not an array' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Conversation array is required' });
    });

    it('should handle service errors gracefully', async () => {
      (generateResponseWithConversation as jest.Mock).mockRejectedValue(new Error('Conversation failed'));

      const response = await request(app)
        .post('/api/claude-conversation')
        .send({ conversation: validConversation });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Conversation failed' });
    });
  });

  describe('POST /api/analyze-prompt', () => {
    it('should return analysis for valid prompt', async () => {
      const mockResponse = { goals: ['goal1', 'goal2', 'goal3'], externalContent: 'content' };
      (getInstructionsAnd3GoalsFromPrompt as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/analyze-prompt')
        .send({ prompt: 'Analyze this prompt' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(getInstructionsAnd3GoalsFromPrompt).toHaveBeenCalledWith('Analyze this prompt');
    });

    it('should return 400 for missing prompt', async () => {
      const response = await request(app)
        .post('/api/analyze-prompt')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Prompt is required' });
    });

    it('should handle service errors gracefully', async () => {
      (getInstructionsAnd3GoalsFromPrompt as jest.Mock).mockRejectedValue(new Error('Analysis failed'));

      const response = await request(app)
        .post('/api/analyze-prompt')
        .send({ prompt: 'Test prompt' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Analysis failed' });
    });
  });

  describe('POST /api/get-short-goal', () => {
    it('should return short goal description for valid goal', async () => {
      const mockResponse = { shortDescription: 'Short goal' };
      (generateShortGoalDescription as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/get-short-goal')
        .send({ goal: 'This is a very long goal that needs to be shortened' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(generateShortGoalDescription).toHaveBeenCalledWith('This is a very long goal that needs to be shortened');
    });

    it('should return 400 for missing goal', async () => {
      const response = await request(app)
        .post('/api/get-short-goal')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Goal is required' });
    });

    it('should return 500 for null result', async () => {
      (generateShortGoalDescription as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/get-short-goal')
        .send({ goal: 'Test goal' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to generate short goal description' });
    });

    it('should return 500 for result without shortDescription', async () => {
      (generateShortGoalDescription as jest.Mock).mockResolvedValue({ other: 'field' });

      const response = await request(app)
        .post('/api/get-short-goal')
        .send({ goal: 'Test goal' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to generate short goal description' });
    });

    it('should handle service errors gracefully', async () => {
      (generateShortGoalDescription as jest.Mock).mockRejectedValue(new Error('Goal shortening failed'));

      const response = await request(app)
        .post('/api/get-short-goal')
        .send({ goal: 'Test goal' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Goal shortening failed' });
    });
  });

  describe('POST /api/get-advanced-prompt', () => {
    it('should return advanced prompt for valid inputs', async () => {
      const mockResponse = { prompt: 'Advanced prompt' };
      (generateAdvancedPrompt as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/get-advanced-prompt')
        .send({ prompt: 'Basic prompt', goal: 'Learning goal' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(generateAdvancedPrompt).toHaveBeenCalledWith('Learning goal', 'Basic prompt');
    });

    it('should return 400 for missing prompt', async () => {
      const response = await request(app)
        .post('/api/get-advanced-prompt')
        .send({ goal: 'Learning goal' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Prompt and goal are required' });
    });

    it('should return 400 for missing goal', async () => {
      const response = await request(app)
        .post('/api/get-advanced-prompt')
        .send({ prompt: 'Basic prompt' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Prompt and goal are required' });
    });

    it('should return 400 for missing both prompt and goal', async () => {
      const response = await request(app)
        .post('/api/get-advanced-prompt')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Prompt and goal are required' });
    });

    it('should return 500 for null result', async () => {
      (generateAdvancedPrompt as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/get-advanced-prompt')
        .send({ prompt: 'Basic prompt', goal: 'Learning goal' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to generate professional prompt' });
    });

    it('should return 500 for result without prompt', async () => {
      (generateAdvancedPrompt as jest.Mock).mockResolvedValue({ other: 'field' });

      const response = await request(app)
        .post('/api/get-advanced-prompt')
        .send({ prompt: 'Basic prompt', goal: 'Learning goal' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to generate professional prompt' });
    });

    it('should handle service errors gracefully', async () => {
      (generateAdvancedPrompt as jest.Mock).mockRejectedValue(new Error('Prompt generation failed'));

      const response = await request(app)
        .post('/api/get-advanced-prompt')
        .send({ prompt: 'Basic prompt', goal: 'Learning goal' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Prompt generation failed' });
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle very large JSON payloads', async () => {
      const largePrompt = 'x'.repeat(10000);
      const mockResponse = { content: 'Response to large prompt' };
      (generateResponse as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/claude')
        .send({ prompt: largePrompt });

      expect(response.status).toBe(200);
      expect(generateResponse).toHaveBeenCalledWith(largePrompt);
    });

    it('should handle special characters in prompts', async () => {
      const specialPrompt = 'Test prompt with special chars: àáâãäå ñ <script>alert("xss")</script>';
      const mockResponse = { content: 'Response to special chars' };
      (generateResponse as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/claude')
        .send({ prompt: specialPrompt });

      expect(response.status).toBe(200);
      expect(generateResponse).toHaveBeenCalledWith(specialPrompt);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/claude')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should handle non-string prompt types', async () => {
      const response = await request(app)
        .post('/api/claude')
        .send({ prompt: 123 });

      // Should work as JavaScript will coerce to string
      const mockResponse = { content: 'Response' };
      (generateResponse as jest.Mock).mockResolvedValue(mockResponse);
      
      expect(response.status).toBe(200);
    });

    it('should handle null and undefined values', async () => {
      const response1 = await request(app)
        .post('/api/claude')
        .send({ prompt: null });

      const response2 = await request(app)
        .post('/api/claude')
        .send({ prompt: undefined });

      expect(response1.status).toBe(400);
      expect(response2.status).toBe(400);
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});