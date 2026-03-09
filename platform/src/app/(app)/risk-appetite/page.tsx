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
import { Loader2, AlertTriangle } from 'lucide-react'

interface RiskAppetiteStatement {
  id: number
  statementId: string
  statement: string
  riskCategory?: string
  appetiteLevel?: string
  toleranceThreshold?: string
  sourceSection?: string
  extractionConfidence?: string
  reviewStatus: string
}

const appetiteColors: Record<string, string> = {
  averse: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  minimal: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  cautious: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  open: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  hungry: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
}

const categoryColors: Record<string, string> = {
  strategic: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  operational: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  financial: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  compliance: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  technology: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  reputational: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  cyber: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export default function RiskAppetitePage() {
  const [statements, setStatements] = useState<RiskAppetiteStatement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStatements() {
      try {
        const res = await fetch('/api/risk-appetite-statements?limit=100&sort=-createdAt')
        if (res.ok) {
          const data = await res.json()
          setStatements(data.docs || [])
        }
      } catch (err) {
        console.error('Failed to fetch risk appetite statements:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStatements()
  }, [])

  const byCategory = statements.reduce<Record<string, RiskAppetiteStatement[]>>((acc, s) => {
    const cat = s.riskCategory || 'unclassified'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/risk-appetite">GRC</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Risk Appetite</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-semibold">Risk Appetite Statements</h1>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Statements</p>
            <p className="text-3xl font-bold">{statements.length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Risk Categories</p>
            <p className="text-3xl font-bold">{Object.keys(byCategory).length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600">
              {statements.filter((s) => s.reviewStatus === 'pending').length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : statements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p>No risk appetite statements extracted yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(byCategory).map(([category, stmts]) => (
              <div key={category}>
                <h2 className="text-lg font-medium capitalize mb-3 flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`}>
                    {category}
                  </span>
                  <span className="text-sm text-muted-foreground">({stmts.length})</span>
                </h2>
                <div className="space-y-2">
                  {stmts.map((stmt) => (
                    <div key={stmt.id} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-muted-foreground">{stmt.statementId}</code>
                        {stmt.appetiteLevel && (
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${appetiteColors[stmt.appetiteLevel] || ''}`}>
                            {stmt.appetiteLevel}
                          </span>
                        )}
                        <span className={`text-xs font-medium capitalize ${
                          stmt.reviewStatus === 'approved' ? 'text-green-600' :
                          stmt.reviewStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {stmt.reviewStatus}
                        </span>
                      </div>
                      <p className="text-sm">{stmt.statement}</p>
                      {stmt.toleranceThreshold && (
                        <p className="text-xs text-muted-foreground">
                          Tolerance: {stmt.toleranceThreshold}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
