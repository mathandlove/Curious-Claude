import { useState } from 'react';
import './PromptForm.css';

interface PromptFormProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
  response: string;
  error: string | null;
}

export default function PromptForm({ onSubmit, loading, response, error }: PromptFormProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="prompt-form">
      <h2>Chat with Claude</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={4}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="error">
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {response && (
        <div className="response">
          <h3>Claude's Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}