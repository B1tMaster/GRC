import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CheckCircle2, XCircle, CircleSlash } from 'lucide-react'
import type { TestRun } from '@/payload-types'

import ReportCards from './report/report-cards'

import Link from 'next/link'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
interface ReportStepProps {
  setStep: (step: number) => void
  testRun?: TestRun
  isLoading: boolean
}

type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIALLY_COMPLIANT'

interface TestCase {
  id: string
  title: string
  statement: string
}

interface TestSuite {
  id: number
  title: string
}

interface CaseResult {
  case: TestCase
  summary: {
    status: ComplianceStatus
    confidenceLevel: string
  }
  gaps?: Array<{
    title: string
    description: string
    severity: string
    recommendation?: {
      description: string
      steps?: Array<{
        step: string
      }>
    }
  }>
  suiteId?: number // Add suiteId to track parent suite
}

export function ReportStep({ setStep, testRun, isLoading }: ReportStepProps) {
  const [selectedControl, setSelectedControl] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  if (isLoading || !testRun?.result) {
    return <div>Loading...</div>
  }

  const handleRowClick = (controlId: string) => {
    setSelectedControl(controlId)
    setIsDrawerOpen(true)
  }

  const renderStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'NON_COMPLIANT':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'PARTIALLY_COMPLIANT':
        return <CircleSlash className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  // Calculate summary counts
  const summary = testRun.result.reduce(
    (acc, result) => {
      if (!result.suites?.cases) return acc

      result.suites.cases.forEach(caseResult => {
        if (caseResult?.summary?.status) {
          const status = caseResult.summary.status as ComplianceStatus
          acc[status] = (acc[status] || 0) + 1
        }
      })
      return acc
    },
    {} as Record<ComplianceStatus, number>
  )

  const renderControlDetails = (selectedControl: string | null) => {
    if (!selectedControl || !testRun?.result) return null

    const control = testRun.result
      .flatMap(result =>
        (result.suites?.cases || []).map(caseResult => ({
          ...caseResult,
          suiteId: (result.suites?.suite as TestSuite)?.id,
        }))
      )
      .find(caseResult => {
        const testCase = caseResult?.case as unknown as TestCase
        return testCase?.id === selectedControl
      }) as CaseResult | undefined

    if (!control?.case) return null

    return (
      <div className="flex flex-col h-full">
        <div className="p-6 pb-4 pl-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {control.case.title}:<br /> {control.case.statement}
          </h3>
        </div>
        {control.gaps && control.gaps.length > 0 && (
          <div className="flex-1 overflow-hidden">
            <ReportCards jsonData={JSON.stringify(control.gaps)} />
          </div>
        )}
      </div>
    )
  }

  const cases = testRun.result
    .flatMap((result, resultIndex) =>
      (result.suites?.cases || []).map(caseResult => ({
        ...caseResult,
        case: caseResult?.case as unknown as TestCase,
        suiteId: (result.suites?.suite as TestSuite)?.id,
        resultIndex,
      }))
    )
    .filter(caseResult => caseResult?.case && caseResult?.summary) as (CaseResult & { resultIndex: number })[]

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Compliance Report</h1>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <Card className="p-6 flex flex-col items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
          <span className="text-4xl font-bold mb-1">{summary.COMPLIANT || 0}</span>
          <span className="text-gray-600">Compliant</span>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <XCircle className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-4xl font-bold mb-1">{summary.NON_COMPLIANT || 0}</span>
          <span className="text-gray-600">Non-Compliant</span>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <CircleSlash className="w-8 h-8 text-yellow-500 mb-2" />
          <span className="text-4xl font-bold mb-1">{summary.PARTIALLY_COMPLIANT || 0}</span>
          <span className="text-gray-600">Partially Compliant</span>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Detailed Report</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-[200px]">Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map(caseResult => (
              <TableRow
                key={`${caseResult.resultIndex}-${caseResult.suiteId}-${caseResult.case.id}`}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleRowClick(caseResult.case.id)}
              >
                <TableCell>{renderStatusIcon(caseResult.summary.status)}</TableCell>
                <TableCell>{caseResult.case.title}</TableCell>
                <TableCell>
                  <Button variant="secondary" size="sm" className="flex items-center gap-2">
                    {caseResult.summary.confidenceLevel}
                    {caseResult.gaps ? (
                      <div className="flex items-center gap-1">
                        {Object.entries(
                          caseResult.gaps.reduce(
                            (acc, gap) => {
                              acc[gap.severity] = (acc[gap.severity] || 0) + 1
                              return acc
                            },
                            {} as Record<string, number>
                          )
                        ).map(([severity, count], index) => (
                          <div
                            key={severity}
                            className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium ${
                              severity.toLowerCase() === 'high'
                                ? 'bg-red-100 text-red-700'
                                : severity.toLowerCase() === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {count}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={() => setStep(2)}>
            Back
          </Button>
          <Button asChild>
            <Link href="/tasks">Close</Link>
          </Button>
        </div>
      </Card>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="flex flex-col overflow-hidden h-full max-w-[80vw] min-w-[50vw]">
          <SheetHeader className="flex-shrink-0">
            <VisuallyHidden>
              <SheetTitle>Control Details: {selectedControl}</SheetTitle>
            </VisuallyHidden>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">{renderControlDetails(selectedControl)}</div>
        </SheetContent>
      </Sheet>
    </>
  )
}
