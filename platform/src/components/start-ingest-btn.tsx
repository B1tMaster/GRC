'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'
import { parsePagesRange } from '@/server/lib/utils'

const StartIngestBtn = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [pagesRange, setPagesRange] = useState('')
  const { id } = useDocumentInfo()

  const validatePagesRange = (input: string): boolean => {
    if (input === '') return true

    // Allow partial entries (hyphen or comma)
    if (input.endsWith('-') || input.endsWith(',')) {
      // Check if everything before the last character is valid
      const beforePartial = input.slice(0, -1).trim()
      return /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/.test(beforePartial)
    }

    // Validate complete input
    return /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/.test(input)
  }

  const handleClick = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/authoritative-documents/${id}/ingest`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pagesRange: pagesRange,
        }),
      })

      if (!response.ok) {
        throw new Error('Ingest failed')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to start ingest')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <input
        type="text"
        value={pagesRange}
        onChange={e => {
          if (validatePagesRange(e.target.value)) {
            setPagesRange(e.target.value)
          }
        }}
        placeholder="Pages (e.g., 1,2,3)"
        style={{
          padding: '8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
        }}
      />
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Start Ingest'}
      </Button>
    </div>
  )
}

export default StartIngestBtn
