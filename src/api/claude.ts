const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export interface ClaudeError {
  error: string;
}

// Generic POST helper
export async function postToClaude<TResponse>(
  route: string,
  body: Record<string, unknown>
): Promise<TResponse> {
  console.log(import.meta.env.VITE_API_BASE_URL);

  // Add timeout for policy options API calls
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), route === 'get-all-policy-options' ? 30000 : 30000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/${route}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
          signal: controller.signal,
    });

    clearTimeout(timeoutId);

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
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timed out after ${route === 'get-all-policy-options' ? 30 : 30} seconds`);
    }
    throw error;
  }
}
