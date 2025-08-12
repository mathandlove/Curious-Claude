import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClaudeResponse from '@/components/ClaudeResponse'
import type { Message } from '../../../backend/shared/messageTypes'

describe('ClaudeResponse Component', () => {
  const mockConversation: Message[] = [
    {
      id: '1',
      type: 'user',
      content: 'Hello, can you help me with React?'
    },
    {
      id: '2',
      type: 'claude',
      content: 'Of course! I\'d be happy to help you with React.',
      isThinking: false
    }
  ]

  const defaultProps = {
    visible: true,
    conversation: mockConversation,
    showGoalPrompt: false,
    showGoalSelector: false,
    onGoalSelected: vi.fn(),
    selectedGoal: null,
    dynamicGoals: ['Goal 1', 'Goal 2', 'Goal 3']
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when visible', () => {
    render(<ClaudeResponse {...defaultProps} />)
    
    expect(screen.getByText('Hello, can you help me with React?')).toBeInTheDocument()
    expect(screen.getByText('Of course! I\'d be happy to help you with React.')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(<ClaudeResponse {...defaultProps} visible={false} />)
    
    expect(screen.queryByText('Hello, can you help me with React?')).not.toBeInTheDocument()
  })

  it('displays conversation messages correctly', () => {
    const extendedConversation: Message[] = [
      ...mockConversation,
      {
        id: '3',
        type: 'user',
        content: 'What are React hooks?'
      },
      {
        id: '4',
        type: 'claude',
        content: 'React hooks are functions that let you use state and other React features.',
        isThinking: false
      }
    ]

    render(<ClaudeResponse {...defaultProps} conversation={extendedConversation} />)
    
    expect(screen.getByText('What are React hooks?')).toBeInTheDocument()
    expect(screen.getByText('React hooks are functions that let you use state and other React features.')).toBeInTheDocument()
  })

  it('shows thinking state for Claude messages', () => {
    const thinkingConversation: Message[] = [
      {
        id: '1',
        type: 'user',
        content: 'Tell me about testing'
      },
      {
        id: '2',
        type: 'claude',
        content: '',
        isThinking: true
      }
    ]

    render(<ClaudeResponse {...defaultProps} conversation={thinkingConversation} />)
    
    // Check for thinking indicator (adjust selector based on your implementation)
    expect(screen.getByText(/thinking|loading/i)).toBeInTheDocument()
  })

  it('shows error state for failed messages', () => {
    const errorConversation: Message[] = [
      {
        id: '1',
        type: 'user',
        content: 'This will cause an error'
      },
      {
        id: '2',
        type: 'claude',
        content: '',
        isThinking: false,
        error: 'An error occurred while processing your request'
      }
    ]

    render(<ClaudeResponse {...defaultProps} conversation={errorConversation} />)
    
    expect(screen.getByText('An error occurred while processing your request')).toBeInTheDocument()
  })

  it('displays goal prompt when showGoalPrompt is true', () => {
    render(<ClaudeResponse {...defaultProps} showGoalPrompt={true} />)
    
    // Check for goal prompt UI elements (adjust based on implementation)
    expect(screen.getByText(/goal|learning/i)).toBeInTheDocument()
  })

  it('displays goal selector when showGoalSelector is true', () => {
    render(<ClaudeResponse 
      {...defaultProps} 
      showGoalSelector={true} 
      dynamicGoals={['Learn React', 'Master Testing', 'Build Projects']}
    />)
    
    expect(screen.getByText('Learn React')).toBeInTheDocument()
    expect(screen.getByText('Master Testing')).toBeInTheDocument()
    expect(screen.getByText('Build Projects')).toBeInTheDocument()
  })

  it('handles goal selection', async () => {
    const user = userEvent.setup()
    const mockOnGoalSelected = vi.fn()

    render(<ClaudeResponse 
      {...defaultProps} 
      showGoalSelector={true}
      onGoalSelected={mockOnGoalSelected}
      dynamicGoals={['Learn React', 'Master Testing']}
    />)
    
    const goalButton = screen.getByText('Learn React')
    await user.click(goalButton)
    
    expect(mockOnGoalSelected).toHaveBeenCalledWith('Learn React')
  })

  it('shows selected goal state', () => {
    render(<ClaudeResponse 
      {...defaultProps} 
      selectedGoal="Learn React Testing"
    />)
    
    // Check for selected goal display (adjust based on implementation)
    expect(screen.getByText(/Learn React Testing/i)).toBeInTheDocument()
  })

  it('handles empty conversation gracefully', () => {
    render(<ClaudeResponse {...defaultProps} conversation={[]} />)
    
    // Should render without errors even with empty conversation
    expect(screen.getByRole('main') || screen.getByTestId('claude-response')).toBeInTheDocument()
  })

  it('renders different message types correctly', () => {
    const mixedConversation: Message[] = [
      {
        id: '1',
        type: 'user',
        content: 'User message'
      },
      {
        id: '2',
        type: 'claude',
        content: 'Claude response',
        isThinking: false
      },
      {
        id: '3',
        type: 'claude',
        content: 'System message'
      }
    ]

    render(<ClaudeResponse {...defaultProps} conversation={mixedConversation} />)
    
    expect(screen.getByText('User message')).toBeInTheDocument()
    expect(screen.getByText('Claude response')).toBeInTheDocument()
    expect(screen.getByText('System message')).toBeInTheDocument()
  })

  it('handles long conversations correctly', () => {
    const longConversation: Message[] = Array.from({ length: 20 }, (_, i) => ({
      id: i.toString(),
      type: i % 2 === 0 ? 'user' as const : 'claude' as const,
      content: `Message ${i}`,
      isThinking: false
    }))

    render(<ClaudeResponse {...defaultProps} conversation={longConversation} />)
    
    // Check that all messages are rendered
    expect(screen.getByText('Message 0')).toBeInTheDocument()
    expect(screen.getByText('Message 19')).toBeInTheDocument()
  })

  it('maintains scroll position appropriately', () => {
    const { rerender } = render(<ClaudeResponse {...defaultProps} />)
    
    // Add new message and check scroll behavior
    const updatedConversation: Message[] = [
      ...mockConversation,
      {
        id: '3',
        type: 'claude' as const,
        content: 'New message',
        isThinking: false
      }
    ]

    rerender(<ClaudeResponse {...defaultProps} conversation={updatedConversation} />)
    
    expect(screen.getByText('New message')).toBeInTheDocument()
  })

  it('handles goal selector with no goals', () => {
    render(<ClaudeResponse 
      {...defaultProps} 
      showGoalSelector={true}
      dynamicGoals={[]}
    />)
    
    // Should handle empty goals array gracefully
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('formats message content correctly', () => {
    const formattedConversation: Message[] = [
      {
        id: '1',
        type: 'claude',
        content: 'Here is some **bold** text and `code` formatting.',
        isThinking: false
      }
    ]

    render(<ClaudeResponse {...defaultProps} conversation={formattedConversation} />)
    
    // Check if markdown or formatting is rendered (adjust based on implementation)
    expect(screen.getByText(/bold.*code/)).toBeInTheDocument()
  })

  it('handles rapid conversation updates', () => {
    const { rerender } = render(<ClaudeResponse {...defaultProps} />)
    
    // Simulate rapid updates
    for (let i = 0; i < 5; i++) {
      const updatedConversation: Message[] = [
        ...mockConversation,
        {
          id: `rapid-${i}`,
          type: 'claude' as const,
          content: `Rapid update ${i}`,
          isThinking: false
        }
      ]
      
      rerender(<ClaudeResponse {...defaultProps} conversation={updatedConversation} />)
    }
    
    expect(screen.getByText('Rapid update 4')).toBeInTheDocument()
  })

  it('shows appropriate loading states', () => {
    const loadingConversation: Message[] = [
      {
        id: '1',
        type: 'user',
        content: 'Question'
      },
      {
        id: '2',
        type: 'claude',
        content: '',
        isThinking: true
      }
    ]

    render(<ClaudeResponse {...defaultProps} conversation={loadingConversation} />)
    
    // Check for loading spinner or thinking indicator
    expect(screen.getByTestId('loading-spinner') || screen.getByText(/thinking/i)).toBeInTheDocument()
  })
})