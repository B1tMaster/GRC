'use client'

import { useEffect, useState } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Loader2, Target } from 'lucide-react'

interface GovernanceObjective {
  id: number
  objectiveId: string
  text: string
  sourceSection?: string
  sourceSectionType?: string
  extractionConfidence?: string
  reviewStatus: string
  frameworkMappings?: Array<{
    controlId?: string
    controlName?: string
    similarityScore?: number
    confidence?: string
    rationale?: string
  }>
}

const confidenceColor: Record<string, string> = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600',
}

export default function GovernancePage() {
  const [objectives, setObjectives] = useState<GovernanceObjective[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchObjectives() {
      try {
        const res = await fetch('/api/governance-objectives?limit=100&sort=-createdAt')
        if (res.ok) {
          const data = await res.json()
          setObjectives(data.docs || [])
        }
      } catch (err) {
        console.error('Failed to fetch objectives:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchObjectives()
  }, [])

  const approved = objectives.filter((o) => o.reviewStatus === 'approved').length
  const pending = objectives.filter((o) => o.reviewStatus === 'pending').length
  const withMappings = objectives.filter(
    (o) => o.frameworkMappings && o.frameworkMappings.length > 0
  ).length

  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/governance">GRC</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Governance Objectives</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-semibold">Governance Objectives</h1>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-3xl font-bold">{objectives.length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Approved</p>
            <p className="text-3xl font-bold text-green-600">{approved}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600">{pending}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Framework Mapped</p>
            <p className="text-3xl font-bold text-blue-600">{withMappings}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {objectives.map((obj) => (
              <div key={obj.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <code className="text-xs text-muted-foreground">{obj.objectiveId}</code>
                  <span className={`text-xs font-medium capitalize ${confidenceColor[obj.extractionConfidence || 'low']}`}>
                    {obj.extractionConfidence}
                  </span>
                  <span className={`text-xs font-medium capitalize ${
                    obj.reviewStatus === 'approved' ? 'text-green-600' :
                    obj.reviewStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {obj.reviewStatus}
                  </span>
                </div>
                <p className="text-sm">{obj.text}</p>
                {obj.frameworkMappings && obj.frameworkMappings.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {obj.frameworkMappings.map((m, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs"
                        title={m.rationale}
                      >
                        {m.controlId} ({Math.round((m.similarityScore || 0) * 100)}%)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
