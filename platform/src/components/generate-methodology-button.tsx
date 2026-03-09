'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'
import { toast } from '@payloadcms/ui'

const GenerateMethodologyButton = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { id } = useDocumentInfo()

  const handleAction = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/test-cases/${id}/generate/methodology`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to generate methodology')
      }

      const data = await response.json()
      console.log(data)
      toast.success('Methodology generated successfully. Refresh the page to see the changes.')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to generate methodology')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleAction} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Generate methodology'}
    </Button>
  )
}

export default GenerateMethodologyButton
