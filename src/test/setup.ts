import '@testing-library/jest-dom'

// Mock API calls
global.fetch = vi.fn()

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
})

// Setup before each test
beforeEach(() => {
  vi.clearAllMocks()
})