import { useState } from 'react'
import PromptForm from './components/PromptForm'
import { sendPromptToClaude } from './api/claude'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (prompt: string) => {
    setLoading(true)
    setError(null)
    setResponse('')

    try {
      const result = await sendPromptToClaude(prompt)
      setResponse(result.response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <h1>Claude Chat Interface</h1>
      <PromptForm
        onSubmit={handleSubmit}
        loading={loading}
        response={response}
        error={error}
      />
    </div>
  )
}

export default App
