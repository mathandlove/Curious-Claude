import { describe, it, expect, vi, beforeEach } from 'vitest'
import { postToClaude } from '@/api/claude'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Claude API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('makes successful API calls', async () => {
    const mockResponse = {
      content: 'Test response from Claude'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    const result = await postToClaude('claude', {
      prompt: 'Test prompt'
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/claude'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({ prompt: 'Test prompt' })
      })
    )

    expect(result).toEqual(mockResponse)
  })

  it('handles API errors correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' })
    })

    await expect(postToClaude('claude', { prompt: 'Test' }))
      .rejects
      .toThrow()
  })

  it('handles network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(postToClaude('claude', { prompt: 'Test' }))
      .rejects
      .toThrow('Network error')
  })

  it('handles different endpoint types', async () => {
    const endpoints = [
      'claude',
      'claude-conversation',
      'analyze-prompt',
      'get-short-goal',
      'get-advanced-prompt'
    ]

    for (const endpoint of endpoints) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await postToClaude(endpoint as any, { test: 'data' })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/${endpoint}`),
        expect.any(Object)
      )
    }
  })

  it('sends correct headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })

    await postToClaude('claude', { prompt: 'Test' })

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers).toEqual({
      'Content-Type': 'application/json'
    })
  })

  it('handles large payloads', async () => {
    const largePrompt = 'x'.repeat(10000)
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: 'Response to large prompt' })
    })

    await postToClaude('claude', { prompt: largePrompt })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ prompt: largePrompt })
      })
    )
  })

  it('handles special characters in data', async () => {
    const specialData = {
      prompt: 'Test with special chars: àáâãäå ñ 中文 🚀'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: 'Response' })
    })

    await postToClaude('claude', specialData)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify(specialData)
      })
    )
  })

  it('handles timeout scenarios', async () => {
    // Mock a request that takes too long
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ content: 'Delayed response' })
        }), 100)
      )
    )

    const result = await postToClaude('claude', { prompt: 'Test' })
    expect((result as any).content).toBe('Delayed response')
  })

  it('handles malformed JSON responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON')
      }
    })

    await expect(postToClaude('claude', { prompt: 'Test' }))
      .rejects
      .toThrow('Invalid JSON')
  })

  it('constructs correct URLs for different environments', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })

    await postToClaude('claude', { prompt: 'Test' })

    const [url] = mockFetch.mock.calls[0]
    expect(url).toMatch(/\/api\/claude$/)
  })

  it('handles conversation endpoint correctly', async () => {
    const conversation = [
      { id: '1', type: 'user', content: 'Hello' },
      { id: '2', type: 'claude', content: 'Hi there!' }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: 'Conversation response' })
    })

    await postToClaude('claude-conversation', { conversation })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/claude-conversation'),
      expect.objectContaining({
        body: JSON.stringify({ conversation })
      })
    )
  })

  it('handles analyze-prompt endpoint correctly', async () => {
    const prompt = 'Analyze this prompt for learning goals'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        goals: ['Goal 1', 'Goal 2', 'Goal 3'],
        promptInstructions: ['Learn about testing']
      })
    })

    await postToClaude('analyze-prompt', { prompt })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/analyze-prompt'),
      expect.objectContaining({
        body: JSON.stringify({ prompt })
      })
    )
  })
})