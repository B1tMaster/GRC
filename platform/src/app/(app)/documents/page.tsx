'use client'

import { useEffect, useState } from 'react'
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
import { FileText, Upload, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface DocumentRow {
  id: number
  title: string
  organization?: string
  extractionStatus: string
  createdAt: string
}

const statusIcon = (status: string) => {
  switch (status) {
    case 'complete':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />
    case 'parsing':
    case 'extracting':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function DocumentTable({ docs }: { docs: DocumentRow[] }) {
  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mb-4" />
        <p>No documents uploaded yet</p>
      </div>
    )
  }
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-3 text-left text-sm font-medium">Title</th>
            <th className="p-3 text-left text-sm font-medium">Organization</th>
            <th className="p-3 text-left text-sm font-medium">Status</th>
            <th className="p-3 text-left text-sm font-medium">Uploaded</th>
            <th className="p-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => (
            <tr key={doc.id} className="border-b hover:bg-muted/30 transition-colors">
              <td className="p-3 font-medium">{doc.title}</td>
              <td className="p-3 text-muted-foreground">{doc.organization || '—'}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {statusIcon(doc.extractionStatus)}
                  <span className="text-sm capitalize">{doc.extractionStatus}</span>
                </div>
              </td>
              <td className="p-3 text-sm text-muted-foreground">
                {new Date(doc.createdAt).toLocaleDateString()}
              </td>
              <td className="p-3 text-right">
                <Link href={`/documents/${doc.id}/extraction`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DocumentsPage() {
  const [boardCirculars, setBoardCirculars] = useState<DocumentRow[]>([])
  const [annualReports, setAnnualReports] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDocs() {
      try {
        const [bcRes, arRes] = await Promise.all([
          fetch('/api/board-circulars?limit=50&sort=-createdAt'),
          fetch('/api/annual-reports?limit=50&sort=-createdAt'),
        ])
        if (bcRes.ok) {
          const bcData = await bcRes.json()
          setBoardCirculars(bcData.docs || [])
        }
        if (arRes.ok) {
          const arData = await arRes.json()
          setAnnualReports(arData.docs || [])
        }
      } catch (err) {
        console.error('Failed to fetch documents:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/documents">GRC Documents</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">GRC Documents</h1>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="board-circulars">
            <TabsList>
              <TabsTrigger value="board-circulars">
                Board Circulars ({boardCirculars.length})
              </TabsTrigger>
              <TabsTrigger value="annual-reports">
                Annual Reports ({annualReports.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="board-circulars" className="mt-4">
              <DocumentTable docs={boardCirculars} />
            </TabsContent>
            <TabsContent value="annual-reports" className="mt-4">
              <DocumentTable docs={annualReports} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  )
}
