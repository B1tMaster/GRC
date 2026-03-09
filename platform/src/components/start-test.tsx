'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'

const StartTest = () => {
  const [isLoading, setIsLoading] = useState(false)

  const { id } = useDocumentInfo()

  const handleStartTest = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/test-runs/${id}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authoritativeDocument: 'nist',
          choosedTestSuitesIds: [1],
        }),
        credentials: 'include', // Important for auth cookies
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to start test')
      }

      const data = await response.json()

      // Handle successful response here
      console.log(data)
    } catch (error) {
      console.error('Error starting test:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button onClick={handleStartTest} disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
      {isLoading ? 'Starting...' : 'Start Test'}
    </button>
  )
}

export default StartTest
