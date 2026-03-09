'use client'

import { Stepper } from '@/components/ui/stepper'

import { TaskProvider } from '@/lib/providers/task-provider'
export default function TaskLayout({ children }: { children: React.ReactNode }) {
  return (
    <TaskProvider>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <div className="w-full">
            <Stepper />
          </div>
        </div>
        {children}
      </div>
    </TaskProvider>
  )
}
