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
import { Loader2, Shield } from 'lucide-react'

interface ControlObjective {
  id: number
  controlId: string
  title: string
  description: string
  category?: string
  owner?: string
  frequency?: string
  extractionConfidence?: string
  reviewStatus: string
  frameworkReferences?: Array<{
    controlId?: string
    controlName?: string
  }>
}

const categoryBadge: Record<string, string> = {
  preventive: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  detective: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  corrective: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  directive: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
}

export default function ControlsPage() {
  const [controls, setControls] = useState<ControlObjective[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchControls() {
      try {
        const res = await fetch('/api/control-objectives?limit=100&sort=-createdAt')
        if (res.ok) {
          const data = await res.json()
          setControls(data.docs || [])
        }
      } catch (err) {
        console.error('Failed to fetch controls:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchControls()
  }, [])

  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/controls">GRC</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Control Objectives</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <h1 className="text-2xl font-semibold">Control Objectives</h1>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total Controls</p>
            <p className="text-3xl font-bold">{controls.length}</p>
          </div>
          {['preventive', 'detective', 'corrective', 'directive'].map((cat) => {
            const count = controls.filter((c) => c.category === cat).length
            return count > 0 ? (
              <div key={cat} className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground capitalize">{cat}</p>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            ) : null
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : controls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mb-4" />
            <p>No control objectives derived yet</p>
            <p className="text-sm">Upload documents and run extraction to generate controls</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left text-sm font-medium">ID</th>
                  <th className="p-3 text-left text-sm font-medium">Title</th>
                  <th className="p-3 text-left text-sm font-medium">Category</th>
                  <th className="p-3 text-left text-sm font-medium">Owner</th>
                  <th className="p-3 text-left text-sm font-medium">Frequency</th>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {controls.map((ctrl) => (
                  <tr key={ctrl.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <code className="text-xs">{ctrl.controlId}</code>
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-sm">{ctrl.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{ctrl.description}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      {ctrl.category && (
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${categoryBadge[ctrl.category] || ''}`}>
                          {ctrl.category}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{ctrl.owner || '—'}</td>
                    <td className="p-3 text-sm text-muted-foreground capitalize">
                      {ctrl.frequency?.replace(/_/g, ' ') || '—'}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-medium capitalize ${
                        ctrl.reviewStatus === 'approved' ? 'text-green-600' :
                        ctrl.reviewStatus === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {ctrl.reviewStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
