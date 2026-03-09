'use client'

import { useState } from 'react'
import { ComplianceStep } from '@/components/tasks/compliance'
import { useTask } from '@/lib/providers/task-provider'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getTestSuites } from '@/lib/actions/payload-collections'
import { api } from '@/lib/api'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { toast } from 'sonner'

import type { TestSuite, RelatedTestSuite, TestSuiteWithDocType } from '@/lib/api/types'

export default function CompliancePage() {
  const { setCurrentStep } = useTask()
  const [relatedTestSuites, setRelatedTestSuites] = useState<TestSuiteWithDocType[]>([])
  const [summary, setSummary] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const { id } = useParams()

  const { data: testSuites, isLoading: isLoadingTestSuites } = useQuery({
    queryKey: ['test-suites'],
    queryFn: getTestSuites,
  })

  const { isLoading: isLoadingRelatedTestSuites } = useQuery({
    queryKey: ['related-test-suites', testSuites],
    queryFn: async () => {
      const response = await api.getRelatedTestSuites(Number(id))
      const nistSuite = response.relatedTestSuites.find((suite: RelatedTestSuite) => suite.docType === 'nist')?.relevantAuthoritativeDocumentSections.map((suite: TestSuite) => ({
        ...suite,
        docType: 'nist'
      }))
      const pciSuite = response.relatedTestSuites.find((suite: RelatedTestSuite) => suite.docType === 'pci-dss')?.relevantAuthoritativeDocumentSections.map((suite: TestSuite) => ({
        ...suite,
        docType: 'pci-dss'
      }))
      
      const sections = [
        ...(nistSuite || []),
        ...(pciSuite || [])
      ]
      
      setRelatedTestSuites(sections)
      setSummary(response.docSummary)
      return response
    },
    enabled: !!testSuites,
    refetchOnMount: true,
    staleTime: 0
  })

  const { mutate: startAnalysis, isPending } = useMutation({
    mutationFn: async () => {
      setIsLoading(true)
      const nistTestSuites = relatedTestSuites.filter(testSuite => testSuite.docType === 'nist')
      const pciTestSuites = relatedTestSuites.filter(testSuite => testSuite.docType === 'pci-dss')
      await Promise.all([
        nistTestSuites.length > 0 && api.startAnalysis(
          Number(id),
          {
            authoritativeDocument: 'nist',
            choosedTestSuitesIds: nistTestSuites.map(testSuite => testSuite.testSuiteId).filter((id): id is number => id !== null)
          }
        ),
        pciTestSuites.length > 0 && api.startAnalysis(
          Number(id),
          {
            authoritativeDocument: 'pci-dss',
            choosedTestSuitesIds: pciTestSuites.map(testSuite => testSuite.testSuiteId).filter((id): id is number => id !== null)
          }
        )
      ])
    },
    onSuccess: () => {
      setCurrentStep(3)
    },
    onError: error => {
      toast.error(error.message)
      setIsLoading(false)
    },
  })

  const startAnalysisHandler = () => {
    if (relatedTestSuites.length === 0) {
      toast.error('No test suites selected')
      setIsLoading(false)
      return
    }

    startAnalysis()
  }

  if (isLoadingTestSuites || isLoadingRelatedTestSuites) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <ComplianceStep
        testSuites={testSuites ?? null}
        relatedTestSuites={relatedTestSuites}
        setRelatedTestSuites={setRelatedTestSuites}
        startAnalysis={startAnalysisHandler}
        setStep={setCurrentStep}
        isPending={isPending || isLoading}
        summary={summary}
      />
    </div>
  )
}
