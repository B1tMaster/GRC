'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, ArrowLeft, Target, Shield, AlertTriangle } from 'lucide-react'

interface GovernanceObjective {
  id: number
  objectiveId: string
  text: string
  sourceSection?: string
  sourceSectionType?: string
  extractionConfidence?: string
  reviewStatus: string
  keywords?: string[]
}

interface RiskAppetiteStatement {
  id: number
  statementId: string
  statement: string
  riskCategory?: string
  appetiteLevel?: string
  reviewStatus: string
}

const confidenceBadge = (confidence?: string) => {
  const colors: Record<string, string> = {
    high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors[confidence || 'low'] || colors.low}`}>
      {confidence || 'unknown'}
    </span>
  )
}

export default function ExtractionPage() {
  const { id } = useParams()
  const [objectives, setObjectives] = useState<GovernanceObjective[]>([])
  const [riskStatements, setRiskStatements] = useState<RiskAppetiteStatement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchExtractions() {
      try {
        const [objRes, riskRes] = await Promise.all([
          fetch(`/api/governance-objectives?where[sourceDocument.value][equals]=${id}&limit=100`),
          fetch(`/api/risk-appetite-statements?where[sourceDocument.value][equals]=${id}&limit=100`),
        ])
        if (objRes.ok) {
          const data = await objRes.json()
          setObjectives(data.docs || [])
        }
        if (riskRes.ok) {
          const data = await riskRes.json()
          setRiskStatements(data.docs || [])
        }
      } catch (err) {
        console.error('Failed to fetch extractions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchExtractions()
  }, [id])

  const handleReview = async (collection: string, docId: number, status: string) => {
    try {
      await fetch(`/api/${collection}/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewStatus: status }),
      })
      if (collection === 'governance-objectives') {
        setObjectives((prev) =>
          prev.map((o) => (o.id === docId ? { ...o, reviewStatus: status } : o))
        )
      } else {
        setRiskStatements((prev) =>
          prev.map((r) => (r.id === docId ? { ...r, reviewStatus: status } : r))
        )
      }
    } catch (err) {
      console.error('Failed to update review status:', err)
    }
  }

  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/documents">Documents</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Extraction Review</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-4">
          <Link href="/documents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">Extraction Review</h1>
        </div>

        <Tabs defaultValue="objectives">
          <TabsList>
            <TabsTrigger value="objectives">
              <Target className="mr-2 h-4 w-4" />
              Governance Objectives ({objectives.length})
            </TabsTrigger>
            <TabsTrigger value="risk">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Risk Appetite ({riskStatements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="objectives" className="mt-4 space-y-3">
            {objectives.map((obj) => (
              <div key={obj.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground">{obj.objectiveId}</code>
                      {confidenceBadge(obj.extractionConfidence)}
                      {obj.sourceSectionType && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {obj.sourceSectionType.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{obj.text}</p>
                    {obj.sourceSection && (
                      <p className="text-xs text-muted-foreground">
                        Source: {obj.sourceSection}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {obj.reviewStatus === 'pending' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => handleReview('governance-objectives', obj.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleReview('governance-objectives', obj.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className={`text-xs font-medium capitalize ${
                        obj.reviewStatus === 'approved' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {obj.reviewStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="risk" className="mt-4 space-y-3">
            {riskStatements.map((stmt) => (
              <div key={stmt.id} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground">{stmt.statementId}</code>
                      {stmt.riskCategory && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                          {stmt.riskCategory}
                        </span>
                      )}
                      {stmt.appetiteLevel && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {stmt.appetiteLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{stmt.statement}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {stmt.reviewStatus === 'pending' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600"
                          onClick={() => handleReview('risk-appetite-statements', stmt.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleReview('risk-appetite-statements', stmt.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className={`text-xs font-medium capitalize ${
                        stmt.reviewStatus === 'approved' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stmt.reviewStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
