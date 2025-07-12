import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PromptForm from '@/components/PromptForm'

describe('PromptForm Component', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
    loading: false,
    response: '',
    error: null,
    isAtBottom: false,
    showSuggestionBanner: false,
    learningGoal: '',
    suggestedPrompt: '',
    onTryPrompt: vi.fn(),
    onBookmark: vi.fn(),
    onBannerHide: vi.fn(),
    loadingAdvancedPrompt: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form elements correctly', () => {
    render(<PromptForm {...defaultProps} />)
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles text input changes', async () => {
    const user = userEvent.setup()
    render(<PromptForm {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test input')
    
    expect(textarea).toHaveValue('Test input')
  })

  it('calls onSubmit when form is submitted', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    
    render(<PromptForm {...defaultProps} onSubmit={mockOnSubmit} />)
    
    const textarea = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { type: 'submit' })
    
    await user.type(textarea, 'Test submission')
    await user.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalledWith('Test submission')
  })

  it('handles Enter key submission', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    
    render(<PromptForm {...defaultProps} onSubmit={mockOnSubmit} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test enter submission')
    await user.keyboard('{Enter}')
    
    expect(mockOnSubmit).toHaveBeenCalledWith('Test enter submission')
  })

  it('prevents submission when loading', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    
    render(<PromptForm {...defaultProps} onSubmit={mockOnSubmit} loading={true} />)
    
    const textarea = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { type: 'submit' })
    
    await user.type(textarea, 'Test loading submission')
    await user.click(submitButton)
    
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('prevents submission of empty input', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    
    render(<PromptForm {...defaultProps} onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)
    
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('shows suggestion banner when showSuggestionBanner is true', () => {
    render(<PromptForm 
      {...defaultProps} 
      showSuggestionBanner={true}
      learningGoal="Test Goal"
      suggestedPrompt="Test Prompt"
    />)
    
    // Check for banner elements (adjust selectors based on actual implementation)
    expect(screen.getByText('Test Goal')).toBeInTheDocument()
    expect(screen.getByText('Test Prompt')).toBeInTheDocument()
  })

  it('handles try prompt action', async () => {
    const user = userEvent.setup()
    const mockOnTryPrompt = vi.fn()
    
    render(<PromptForm 
      {...defaultProps} 
      showSuggestionBanner={true}
      onTryPrompt={mockOnTryPrompt}
      suggestedPrompt="Try this prompt"
    />)
    
    // Find and click the try prompt button (adjust selector as needed)
    const tryButton = screen.getByText(/try/i)
    await user.click(tryButton)
    
    expect(mockOnTryPrompt).toHaveBeenCalled()
  })

  it('handles bookmark action', async () => {
    const user = userEvent.setup()
    const mockOnBookmark = vi.fn()
    
    render(<PromptForm 
      {...defaultProps} 
      showSuggestionBanner={true}
      onBookmark={mockOnBookmark}
      suggestedPrompt="Bookmark this prompt"
    />)
    
    // Find and click the bookmark button (adjust selector as needed)
    const bookmarkButton = screen.getByRole('button', { name: /bookmark/i })
    await user.click(bookmarkButton)
    
    expect(mockOnBookmark).toHaveBeenCalledWith('Bookmark this prompt')
  })

  it('handles banner hide action', async () => {
    const user = userEvent.setup()
    const mockOnBannerHide = vi.fn()
    
    render(<PromptForm 
      {...defaultProps} 
      showSuggestionBanner={true}
      onBannerHide={mockOnBannerHide}
    />)
    
    // Find and click the hide/close button (adjust selector as needed)
    const hideButton = screen.getByRole('button', { name: /hide|close|dismiss/i })
    await user.click(hideButton)
    
    expect(mockOnBannerHide).toHaveBeenCalled()
  })

  it('shows loading state correctly', () => {
    render(<PromptForm {...defaultProps} loading={true} />)
    
    // Check for loading indicators (spinner, disabled state, etc.)
    const submitButton = screen.getByRole('button', { type: 'submit' })
    expect(submitButton).toBeDisabled()
  })

  it('shows advanced prompt loading state', () => {
    render(<PromptForm 
      {...defaultProps} 
      loadingAdvancedPrompt={true}
      showSuggestionBanner={true}
    />)
    
    // Check for advanced prompt loading indicators
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('adjusts layout when isAtBottom is true', () => {
    render(<PromptForm {...defaultProps} isAtBottom={true} />)
    
    // Check for layout changes when form is at bottom
    const formContainer = screen.getByRole('textbox').closest('div')
    expect(formContainer).toHaveClass(/bottom/i) // or whatever class indicates bottom position
  })

  it('handles keyboard shortcuts correctly', async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()
    
    render(<PromptForm {...defaultProps} onSubmit={mockOnSubmit} />)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test Shift+Enter')
    
    // Test Shift+Enter (should add new line, not submit)
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    expect(mockOnSubmit).not.toHaveBeenCalled()
    
    // Test Ctrl+Enter or Cmd+Enter (should submit)
    await user.keyboard('{Control>}{Enter}{/Control}')
    expect(mockOnSubmit).toHaveBeenCalledWith('Test Shift+Enter\n')
  })

  it('handles character limits appropriately', async () => {
    const user = userEvent.setup()
    render(<PromptForm {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    const longText = 'a'.repeat(1000) // Adjust based on your actual limits
    
    await user.type(textarea, longText)
    
    // Check if character limit is enforced or displayed
    if (textarea.hasAttribute('maxlength')) {
      expect(textarea.value.length).toBeLessThanOrEqual(Number(textarea.getAttribute('maxlength')))
    }
  })

  it('maintains focus appropriately', async () => {
    const user = userEvent.setup()
    render(<PromptForm {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.click(textarea)
    
    expect(textarea).toHaveFocus()
    
    // After submission, focus should be maintained or reset appropriately
    await user.type(textarea, 'Test focus')
    const submitButton = screen.getByRole('button', { type: 'submit' })
    await user.click(submitButton)
    
    // Check focus behavior after submission
  })

  it('handles paste events correctly', async () => {
    const user = userEvent.setup()
    render(<PromptForm {...defaultProps} />)
    
    const textarea = screen.getByRole('textbox')
    await user.click(textarea)
    
    // Simulate paste event
    await user.paste('Pasted content')
    
    expect(textarea).toHaveValue('Pasted content')
  })

  it('responds to prop changes correctly', () => {
    const { rerender } = render(<PromptForm {...defaultProps} />)
    
    // Change props and check if component updates
    rerender(<PromptForm 
      {...defaultProps} 
      suggestedPrompt="New suggested prompt"
      showSuggestionBanner={true}
    />)
    
    expect(screen.getByText('New suggested prompt')).toBeInTheDocument()
  })
})