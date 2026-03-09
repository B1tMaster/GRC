'use client'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Forward, Trash2, SquareCheckBig, Plus } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CreateTaskDialog } from '@/components/create-task-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ConfirmationDialog } from '@/components/confirmation-dialog'

import { deleteTestRun } from '@/lib/actions/payload-collections'
import type { TestRun } from '@/payload-types'

import Link from 'next/link'

import { useUser } from '@/lib/providers/user-provider'

export default function Page() {
  const { tasks, isLoading } = useUser()
  const queryClient = useQueryClient()
  const { mutate: deleteTask } = useMutation({
    mutationFn: async (id: number) => {
      await deleteTestRun(id)
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['tasks'], (oldTasks: TestRun[] | undefined) => 
        oldTasks?.filter(task => task.id !== deletedId) || []
      )
      
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', deletedId] })
      toast.success('Task deleted successfully')
    },
    onError: error => {
      toast.error('Failed to delete task')
      console.error('Error deleting task:', error)
    },
    onSettled: () => {
      queryClient.refetchQueries({ 
        queryKey: ['tasks'],
        exact: true 
      })
    }
  })
  return (
    <main>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Tasks</BreadcrumbLink>
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
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <div className="ml-auto">
            <CreateTaskDialog>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </CreateTaskDialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {isLoading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col justify-between rounded-xl bg-card p-6 shadow-md border border-border/50">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 rounded" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="mt-4 h-9 w-full" />
                </div>
              ))}
            </>
          ) : (
            tasks.map(run => (
              <div key={run.id} className="flex flex-col justify-between rounded-xl bg-card p-6 shadow-md border border-border/50 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <SquareCheckBig className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-medium">{run.title}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Forward className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Share Task</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <ConfirmationDialog
                          title="Delete Task"
                          description="Are you sure you want to delete this task? This action cannot be undone."
                          confirmText="Delete"
                          variant="destructive"
                          onConfirm={() => deleteTask(run.id)}
                        >
                          <DropdownMenuItem onSelect={e => e.preventDefault()}>
                            <Trash2 />
                            <span>Delete Task</span>
                          </DropdownMenuItem>
                        </ConfirmationDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-sm text-muted-foreground">
                      Status: <span className="font-medium">Not Started</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${0}%` }} />
                    </div>
                  </div>
                </div>
                <Link href={`/tasks/${run.id}`} className="mt-4 w-full">
                  <Button variant="outline" className="w-full">
                    Open Task
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
