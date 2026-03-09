'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

interface TestCaseResponse {
  testCases: Array<{
    suiteId: string
    id: string
  }>
  summary: string
}

const CompletionTestCasesButton = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { id } = useDocumentInfo()

  const handleGenerateTestCases = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/test-runs/${id}/completions/related-test-suites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate test cases')
      }

      const data: TestCaseResponse = await response.json()
      console.log('Generated test cases:', data.testCases)
      console.log('Document summary:', data.summary)
    } catch (error) {
      console.error('Error generating test cases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button onClick={handleGenerateTestCases} disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
      {isLoading ? 'Generating...' : 'Generate Test Cases completions'}
    </button>
  )
}

export default CompletionTestCasesButton
