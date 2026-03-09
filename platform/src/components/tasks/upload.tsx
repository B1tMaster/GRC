import { Card } from '@/components/ui/card'
import { Dispatch, SetStateAction } from 'react'
import { useMutation } from '@tanstack/react-query'
import { createInputFile, deleteInputFile, updateTestRun } from '@/lib/actions/payload-collections'
import { api } from '@/lib/api'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { UploadForm } from './upload-form/upload-form'
import { useTask } from '@/lib/providers/task-provider'
import { TestRun } from '@/payload-types'

interface UploadStepProps {
  setStep: (step: number) => void;
}

export function UploadStep({ setStep }: UploadStepProps) {
  const { currentTask } = useTask()
  const { id: currentTestRunId } = useParams()

  // Create input file
  const createInputFileMutation = useMutation({
    mutationFn: createInputFile,
    onError: error => {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
    },
  })

  // Delete input file
  const deleteInputFileMutation = useMutation({
    mutationFn: deleteInputFile,
  })

  // Update test run
  const updateTestRunMutation = useMutation({
    mutationFn: ({ id, inputFileId, status }: { id: number; inputFileId: number; status: NonNullable<TestRun['status']> }) => updateTestRun(id, inputFileId, status),
    onSuccess: () => {
      setStep(2)
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
    },
  })

  // Upload file
  const uploadMutation = useMutation({
    mutationFn: async ({ id, file }: { id: number; file: File }) => {
      await api.uploadFile(id, file, file.name)
      return id
    },
    onError: error => {
      toast.error(error instanceof Error ? error.message : 'Failed to upload file')
    },
    onSuccess: id => {
      updateTestRunMutation.mutate({ id: Number(currentTestRunId), inputFileId: Number(id), status: 'FULFILLED' })
    },
  })

  // Handle upload
  const handleUpload = ({ file }: { file: File }) => {
    createInputFileMutation.mutate(file.name, {
      onSuccess: id => {
        uploadMutation.mutate({ id, file })
      },
      onError: (error, id) => {
        deleteInputFileMutation.mutate(Number(id))
        toast.error(error instanceof Error ? error.message : 'Failed to create input file')
      },
    })
  }

  return (
    <Card className="p-6">
      <UploadForm
        onSubmit={handleUpload}
        isLoading={createInputFileMutation.isPending || uploadMutation.isPending || updateTestRunMutation.isPending || deleteInputFileMutation.isPending}
        currentTask={currentTask}
      />
    </Card>
  )
}
