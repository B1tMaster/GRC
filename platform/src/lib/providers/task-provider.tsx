'use client'

import type { TestRun } from '@/payload-types'
import { getTestRunById } from '@/lib/actions/payload-collections'
import { useQuery } from '@tanstack/react-query'
import { createContext, useContext, useState, useEffect } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import { defaultSteps, Step } from "@/lib/steps"

type TaskStatus = NonNullable<TestRun['status']>

interface TaskContextType {
  currentTask?: TestRun
  isLoading: boolean
  step: number
  setStep: (step: number) => void
  setCurrentStep: (step: number) => void
  stepsCount: number
  steps: Step[]
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { id } = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const [step, setStep] = useState<number | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  
  const { data: task, isLoading } = useQuery({
    queryKey: ['task', id],
    queryFn: () => getTestRunById(Number(id)),
  })

  // Redirect to tasks page if task is not found
  useEffect(() => {
    if (!isLoading && !task && id) {
      router.replace('/tasks')
      // Reset state when task is not found
      setStep(null)
      setHasInitialized(false)
    }
  }, [task, isLoading, router, id])

  const stepsCount: number = defaultSteps.length
  const steps: Step[] = defaultSteps

  const setCurrentStep = (step: number) => {
    const currentStep = defaultSteps.find((defaultStep) => defaultStep.id === step)
    if (currentStep) {
      setStep(step)
      router.push(`/tasks/${id}/${currentStep.path}`)
    }
  }

  useEffect(() => {
    // Skip effect if still loading or task is not available
    if (isLoading || !task || hasInitialized) return

    // Skip if status is undefined - wait for it to be set
    if (task.status === undefined) return

    const currentStepFromStatus = defaultSteps.find(step => 
      step.taskStatus.includes(task.status as TaskStatus)
    )

    if (currentStepFromStatus) {
      setStep(currentStepFromStatus.id)
      if (!pathname.includes(currentStepFromStatus.path)) {
        router.push(`/tasks/${id}/${currentStepFromStatus.path}`)
      }
    }
    setHasInitialized(true)
  }, [task, pathname, router, id, hasInitialized, isLoading])

  // Manual step navigation effect
  useEffect(() => {
    if (!step) return
    const currentStep = defaultSteps.find((defaultStep) => defaultStep.id === step)
    if (currentStep && !pathname.includes(currentStep.path)) {
      router.push(`/tasks/${id}/${currentStep.path}`)
    }
  }, [step, router, id, pathname])

  // Ensure we have a valid step for the context
  const currentStep = step ?? 1

  return (
    <TaskContext.Provider
      value={{
        currentTask: task,
        isLoading,
        step: currentStep,
        setStep,
        setCurrentStep,
        stepsCount,
        steps
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
}
