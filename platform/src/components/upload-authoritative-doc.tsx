'use client'

import React, { useState, useRef } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'

const UploadAuthoritativeDocButton = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { id } = useDocumentInfo()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/authoritative-documents/${id}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to upload file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" style={{ display: 'none' }} />
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Uploading...' : 'Upload file'}
      </Button>
    </>
  )
}

export default UploadAuthoritativeDocButton
