const API_BASE_URL = 'http://localhost:3001';

export interface ClaudeResponse {
  response: string;
}

export interface ClaudeError {
  error: string;
}

export async function sendPromptToClaude(prompt: string): Promise<ClaudeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/claude`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData: ClaudeError = await response.json();
    throw new Error(errorData.error || 'Failed to get response from Claude');
  }

  return response.json();
}