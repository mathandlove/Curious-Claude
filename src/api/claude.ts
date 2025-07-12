const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export interface ClaudeError {
  error: string;
}

// Generic POST helper
export async function postToClaude<TResponse>(
  route: string,
  body: Record<string, unknown>
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}/api/${route}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorText = 'Failed to fetch';
    try {
      const errorData: ClaudeError = await response.json();
      errorText = errorData.error || errorText;
    } catch {
      errorText = await response.text();
    }
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}
