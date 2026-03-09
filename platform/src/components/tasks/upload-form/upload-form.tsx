import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { TestRun } from '@/payload-types'

interface UploadFormProps {
  onSubmit: (data: UploadFormValues) => void
  isLoading?: boolean
  onCancel?: () => void
  currentTask?: TestRun
}

const uploadFormSchema = z.object({
  file: z.instanceof(File).refine(file => file.type === 'application/pdf', {
    message: 'Only PDF files are allowed',
  }),
})

type UploadFormValues = z.infer<typeof uploadFormSchema>

export function UploadForm({ onSubmit, isLoading, onCancel, currentTask }: UploadFormProps) {
  const [isDragging, setIsDragging] = useState(false)
  const { register, handleSubmit, setValue, watch, reset } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
  })

  const selectedFile = watch('file')

  useEffect(() => {
    if (currentTask?.status !== 'CREATED' && currentTask?.input?.[0]) {
      const input = currentTask.input[0]
      // Pre-populate form with existing file name
      if (typeof input !== 'number' && input.title) {
        const existingFile = new File([], input.title, { type: 'application/pdf' })
        setValue('file', existingFile)
      }
    } else {
      // Reset form when status is CREATED
      reset()
    }
  }, [currentTask, setValue, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setValue('file', e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      setValue('file', files[0])
    }
  }

  return (
    <form id="upload-form" onSubmit={handleSubmit(onSubmit)}>
      <div
        className={cn(
          'flex justify-center p-8 border-2 border-dashed rounded-lg transition-colors mb-8',
          isDragging && 'border-primary bg-primary/10',
          !isDragging && 'border-border'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept=".pdf" 
            {...register('file')} 
            onChange={handleFileChange}
            disabled={currentTask?.status !== 'CREATED'} 
          />
          <Label 
            htmlFor="file-upload" 
            className={cn(
              'cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md',
              currentTask?.status !== 'CREATED' && 'opacity-50 cursor-not-allowed'
            )}
          >
            {selectedFile ? selectedFile.name : 'Choose or drag PDF file'}
          </Label>
          {!selectedFile && <p className="mt-2 text-sm text-muted-foreground">Drag and drop your PDF file here, or click to select</p>}
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        {onCancel ? (
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/">Cancel</Link>
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={!selectedFile || isLoading || currentTask?.status !== 'CREATED'}
        >
          {isLoading ? 'Uploading...' : 'Next'}
        </Button>
      </div>
    </form>
  )
}
