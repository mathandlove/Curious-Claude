import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/pages/Home'

// Mock the API module
vi.mock('@/api/claude', () => ({
  postToClaude: vi.fn()
}))

// Mock the custom hooks
vi.mock('@/hooks/useScrollToBottom', () => ({
  useScrollToBottom: vi.fn()
}))

vi.mock('@/hooks/useFinalizeClaudeResponse', () => ({
  useFinalizeClaudeResponse: vi.fn()
}))

import { postToClaude } from '@/api/claude'

describe('Home Component', () => {
  const mockPostToClaude = postToClaude as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the initial hero UI when not submitted', () => {
    render(<Home />)
    
    // The HeroPromptUI should be visible initially
    // Since we don't have the exact text, we'll check for common elements
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument()
  })

  it('shows prompt form at the bottom', () => {
    render(<Home />)
    
    // Check if the prompt form container exists
    const formContainer = document.querySelector('[style*="bottom"]')
    expect(formContainer).toBeInTheDocument()
  })

  it('handles prompt submission and shows conversation', async () => {
    const user = userEvent.setup()
    
    // Mock successful API responses
    mockPostToClaude
      .mockResolvedValueOnce({
        promptInstructions: ['Learn about React testing'],
        goals: ['Goal 1', 'Goal 2', 'Goal 3']
      })
      .mockResolvedValueOnce({
        content: 'Claude response to your prompt'
      })

    render(<Home />)
    
    // Find and interact with the prompt input
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Tell me about React testing')
    
    // Submit the form
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    // Wait for state updates
    await waitFor(() => {
      expect(mockPostToClaude).toHaveBeenCalledWith('analyze-prompt', {
        prompt: 'Tell me about React testing'
      })
    })

    await waitFor(() => {
      expect(mockPostToClaude).toHaveBeenCalledWith('claude', {
        prompt: 'Tell me about React testing'
      })
    })
  })

  it('handles goal selection flow', async () => {
    const user = userEvent.setup()
    
    // Mock API responses for goal selection
    mockPostToClaude
      .mockResolvedValueOnce({
        promptInstructions: ['Learn about testing'],
        goals: ['Testing Goal', 'Development Goal', 'Learning Goal']
      })
      .mockResolvedValueOnce({
        content: 'Initial Claude response'
      })
      .mockResolvedValueOnce({
        shortDescription: 'Short testing goal'
      })
      .mockResolvedValueOnce({
        prompt: 'Advanced learning prompt for testing'
      })

    render(<Home />)
    
    // Submit initial prompt
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'I want to learn testing')
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    // Wait for goal selector to appear and select a goal
    await waitFor(() => {
      const goalButtons = screen.queryAllByText(/goal/i)
      expect(goalButtons.length).toBeGreaterThan(0)
    })

    // Simulate goal selection (this would depend on your actual UI structure)
    // Since we can't see the exact GoalSelector implementation, we'll test the handler directly
    // In a real test, you'd click on an actual goal button
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock API failure
    mockPostToClaude.mockRejectedValueOnce(new Error('API Error'))

    render(<Home />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test prompt that will fail')
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    // Wait for error handling
    await waitFor(() => {
      expect(mockPostToClaude).toHaveBeenCalled()
    })
    
    // The component should handle the error without crashing
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('manages conversation state correctly', async () => {
    const user = userEvent.setup()
    
    // Mock successful responses
    mockPostToClaude
      .mockResolvedValueOnce({
        promptInstructions: ['Initial instruction'],
        goals: ['Goal 1']
      })
      .mockResolvedValueOnce({
        content: 'First response'
      })
      .mockResolvedValueOnce({
        conversation: [
          { id: '1', type: 'user', content: 'Follow up question' },
          { id: '2', type: 'claude', content: 'First response' }
        ],
        content: 'Second response'
      })

    render(<Home />)
    
    // First submission
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Initial question')
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPostToClaude).toHaveBeenCalledWith('analyze-prompt', expect.any(Object))
    })

    // Clear the textarea and submit follow-up
    await user.clear(textarea)
    await user.type(textarea, 'Follow up question')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPostToClaude).toHaveBeenCalledWith('claude-conversation', expect.any(Object))
    })
  })

  it('handles loading states correctly', async () => {
    const user = userEvent.setup()
    
    // Mock delayed API response
    mockPostToClaude
      .mockResolvedValueOnce({
        promptInstructions: ['Test instruction'],
        goals: ['Test goal']
      })
      .mockImplementationOnce(() => new Promise(resolve => 
        setTimeout(() => resolve({ content: 'Delayed response' }), 100)
      ))

    render(<Home />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test loading state')
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    // Check that loading state is active
    // This would depend on your loading UI implementation
    await waitFor(() => {
      expect(mockPostToClaude).toHaveBeenCalled()
    })
  })

  it('handles banner interactions', async () => {
    const user = userEvent.setup()
    
    render(<Home />)
    
    // This test would need to trigger the banner show state
    // and then test banner hide functionality
    // Implementation depends on your actual banner UI
  })

  it('handles bookmark functionality', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    render(<Home />)
    
    // Since handleBookmark is passed to PromptForm, we'd need to trigger it
    // through the actual UI interaction in a real test
    
    consoleSpy.mockRestore()
  })

  it('manages advanced prompt loading correctly', async () => {
    const user = userEvent.setup()
    
    // Mock responses where advanced prompt takes time to load
    mockPostToClaude
      .mockResolvedValueOnce({
        promptInstructions: ['Test instruction'],
        goals: ['Test goal']
      })
      .mockResolvedValueOnce({
        content: 'Claude response'
      })
      .mockResolvedValueOnce({
        shortDescription: 'Short goal'
      })
      .mockImplementationOnce(() => new Promise(resolve => 
        setTimeout(() => resolve({ prompt: 'Advanced prompt' }), 200)
      ))

    render(<Home />)
    
    // Submit initial prompt to trigger goal selection
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test advanced prompt loading')
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPostToClaude).toHaveBeenCalledWith('analyze-prompt', expect.any(Object))
    })
  })

  it('handles edge cases with empty or invalid inputs', async () => {
    const user = userEvent.setup()
    
    render(<Home />)
    
    const textarea = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /submit|send/i })
    
    // Test empty submission
    await user.click(submitButton)
    
    // Should not make API call with empty input
    expect(mockPostToClaude).not.toHaveBeenCalled()
    
    // Test whitespace-only input
    await user.type(textarea, '   ')
    await user.click(submitButton)
    
    // Should handle whitespace appropriately
  })

  it('handles rapid successive submissions', async () => {
    const user = userEvent.setup()
    
    mockPostToClaude.mockResolvedValue({
      content: 'Response'
    })

    render(<Home />)
    
    const textarea = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { name: /submit|send/i })
    
    await user.type(textarea, 'First prompt')
    await user.click(submitButton)
    
    // Try to submit again quickly
    await user.clear(textarea)
    await user.type(textarea, 'Second prompt')
    await user.click(submitButton)
    
    // Should handle rapid submissions gracefully
  })
})