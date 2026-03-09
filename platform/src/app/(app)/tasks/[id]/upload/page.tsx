'use client'

import { UploadStep } from '@/components/tasks/upload'
import { useTask } from '@/lib/providers/task-provider'

export default function UploadPage() {
  const { setCurrentStep } = useTask()
  return <UploadStep setStep={setCurrentStep} />
}