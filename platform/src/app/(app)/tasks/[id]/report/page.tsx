'use client'

import { ReportStep } from '@/components/tasks/report'
import { ReportLoading } from '@/components/tasks/report/loading'

import { useTask } from '@/lib/providers/task-provider'

import { getTestRunById } from '@/lib/actions/payload-collections'
import { useQuery } from '@tanstack/react-query'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'


export default function CompliancePage() {
  const { id } = useParams()
  const { setCurrentStep } = useTask()

  const { data: testRun, isLoading, refetch } = useQuery({
    queryKey: ['report', id],
    queryFn: () => getTestRunById(Number(id)),
  })

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | undefined;

    if (testRun && testRun.status !== 'COMPLETED') {
      pollingInterval = setInterval(() => {
        refetch();
      }, 5000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [testRun?.status, refetch]);

  if (isLoading || (testRun && testRun.status !== 'COMPLETED')) {
    return <ReportLoading />
  }

  return <ReportStep setStep={setCurrentStep} testRun={testRun} isLoading={isLoading} />
}
