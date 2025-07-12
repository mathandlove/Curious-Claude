import type {
  AnalyzePromptResponse,
  AdvancedLearningPrompt,
  ShortGoalDescription,
  ClaudeTextResponse,
} from '../shared/claudeTypes';
import type { Message } from '../shared/messageTypes';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_MODEL_STR = 'claude-3-haiku-20240307';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function getInstructionsAnd3GoalsFromPrompt(
  prompt: string
): Promise<AnalyzePromptResponse> {
  try {
    const { instructions, external } = await getSplitInstructions(prompt);
    const goals = await get3GoalsFromInstructions(instructions);

    return {
      promptInstructions: [instructions, external],
      goals,
    };
  } catch (error) {
    console.error('Error in getInstructionsAnd3GoalsFromPrompt:', error);
    throw new Error('Failed to analyze prompt and extract goals');
  }
}

export async function getSplitInstructions(
  studentPrompt: string
): Promise<{ instructions: string; external: string }> {
  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1024,
      system: `Analyze the student's prompt and separate it into two categories:
1. "instructions" - The actual instructions or commands the student is giving
2. "external" - Any external content, context, or information they're providing

Return ONLY valid JSON with this exact format:
{"instructions": "combined instruction string", "external": "combined external content string"}

If there is no external content, return an empty string for "external". Do not use arrays. Do not use markdown or formatting — return only the raw JSON object.`,
      messages: [
        {
          role: 'user',
          content: studentPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Invalid response format: content is not text');
    }

    const parsed = parseClaudeJSON(content.text);

    if (
      !parsed ||
      typeof parsed.instructions !== 'string' ||
      typeof parsed.external !== 'string'
    ) {
      throw new Error('Claude returned invalid string-based format');
    }

    return {
      instructions: parsed.instructions.trim(),
      external: parsed.external.trim(),
    };
  } catch (error) {
    console.error('Error analyzing prompt structure:', error);
    throw new Error('Failed to analyze prompt structure');
  }
}


export async function get3GoalsFromInstructions(prompt: string): Promise<string[]> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Analyze this student prompt and identify 3 different learning goals the student might have with this prompt. The skills should not be about writing something specific or generating text. Each example should be 8 or less words and easy for an 8th grade student to understand. Each goal should start with "Learn how to"

Good examples you can use:

1. Learn how to Critically analyze a complex topic.
2. Learn how to explain my thinking.
3. Learn how to go beyond the surface-level of a text.
...

Student prompt: ${prompt}

Return only JSON in this format: {"goals": [{"goal": "Learn how to [specific skill]"}, {"goal": "Learn how to [specific skill]"}, {"goal": "Learn how to [specific skill]"}]}

Do not include any markdown formatting or code blocks. Return only the JSON object.`,
        },
      ],
    });

    const content = response.content[0];
    const rawText = content.type === 'text' ? content.text : '';
    const parsed = parseClaudeJSON(rawText);

    if (
      !parsed.goals ||
      !Array.isArray(parsed.goals) ||
      parsed.goals.length !== 3
    ) {
      throw new Error('Claude returned invalid goals format');
    }

    return parsed.goals.map((g: { goal: string }) => g.goal);
  } catch (error) {
    console.error('Error in get3GoalsFromInstructions:', error);
    throw new Error('Failed to extract goals from Claude');
  }
}

export async function generateAdvancedPrompt(
  instructions: string,
  goal: string
): Promise<AdvancedLearningPrompt> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8024,
    messages: [
      {
        role: 'user',
        content: `I am a student who wants to learn how to ${goal}. I originally asked: ${instructions}

Please create a professional, prompt that I could give Claude that would provide output or a conversation that would help me learn this skill. In the instructions make sure to say, "Only ask one question at a time." Return ONLY valid JSON with: {"prompt": "professional prompt text"}

Do not include any markdown formatting or code blocks. Return only the JSON object.

Examples:
1. Can you ask me Socratic questions about my topic.
2. What assumptions am I making in this argument?
3. Give me some ideas on how I can improve this paper without making the changes yourself.
4. Can you ask me 3 questions that would challenge my main idea?;
5. Can you help me figure out what I really believe about this topic?
6. What’s something I’m not seeing because I’m too close to this topic?
7. Can you help me map out the different angles I could take before I pick one?
8. What question should I be asking myself as I write this?
9. Ask me questions to test my understanding of this topic.
10. Help me review the text I just read by having me answer questions.`
      },
    ],
  });

  const content = response.content[0];
  const rawText = content.type === 'text' ? content.text : '';

try {
    const parsed = JSON.parse(rawText);
    if (!parsed.prompt || typeof parsed.prompt !== 'string') {
      throw new Error('Claude returned malformed prompt');
    }
    return { prompt: parsed.prompt };
  } catch {
    console.error('Failed to parse Claude response:', rawText);
    throw new Error('Claude did not return valid JSON');
  }
}

export async function generateResponse(prompt: string): Promise<ClaudeTextResponse> {
  const response = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
  const content = response.content[0];
  const text = content.type === 'text' ? content.text : '';
   return { content: text };
}

export async function generateResponseWithConversation(conversation: Message[]): Promise<ClaudeTextResponse> {
  try {
    // Convert Message[] to Anthropic message format
    const anthropicMessages = conversation
      .filter(msg => !msg.isThinking && !msg.error && msg.content.trim()) // Filter out thinking/error messages
      .map(msg => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

    // Ensure we have at least one message
    if (anthropicMessages.length === 0) {
      throw new Error('No valid messages in conversation');
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: anthropicMessages,
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';
    
    if (!text.trim()) {
      throw new Error('Empty response from Claude');
    }

    return { content: text.trim() };
  } catch (error) {
    console.error('Error generating response with conversation:', error);
    return { 
      content: 'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.' 
    };
  }
}

export async function generateShortGoalDescription(selectedGoal: string): Promise<ShortGoalDescription> {
    try {
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: `Describe this goal in 2 to 5 easy-to-understand words. Do not include 'Learn how to.' Start with an gerund verb (ending in ing). Return ONLY valid JSON with: {"shortDescription": "phrase starting with -ing verb"}

Do not include any markdown formatting or code blocks. Return only the JSON object.

Goal: ${selectedGoal}`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === "text") {
        const result = parseClaudeJSON(content.text) as unknown as ShortGoalDescription;
        return result;
      }
      throw new Error("Invalid response format");
    } catch (error) {
      console.error("Error generating short goal description:", error);
      throw new Error("Failed to generate short goal description");
    }
  }

export function parseClaudeJSON(text: string): Record<string, unknown> {
  let cleanText = '';
  try {
    cleanText = text.trim();

    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json/, '').trim();
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.replace(/```$/, '').trim();
    }

    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found');

    const jsonText = jsonMatch[0];
    const normalized = jsonText.replace(/"\s*:\s*"/g, '": "');

    return JSON.parse(normalized);
  } catch {
    console.error('❌ Failed to parse Claude JSON');
    console.error('Raw text:', text);
    console.error('Cleaned text:', cleanText);
    throw new Error('Failed to parse JSON from Claude response');
  }
}
