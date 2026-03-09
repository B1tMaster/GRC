"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { SquareCheckBig } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

import type { TestRun } from "@/payload-types"
import { deleteTestRun } from "@/lib/actions/payload-collections"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter, useParams } from "next/navigation"

export function NavTasks({
  tasks,
  isLoading,
}: {
  tasks: TestRun[]
  isLoading?: boolean
}) {
  const { isMobile } = useSidebar()
  const queryClient = useQueryClient()
  const router = useRouter()
  const params = useParams()

  const { mutate: deleteTask } = useMutation({
    mutationFn: async (id: number) => {
      await deleteTestRun(id)
    },
    onSuccess: (_, deletedId) => {
      // Remove the task from the cache immediately
      queryClient.setQueryData(['tasks'], (oldTasks: TestRun[] | undefined) => 
        oldTasks?.filter(task => task.id !== deletedId) || []
      )
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task", deletedId] })
      
      toast.success("Task deleted successfully")
      
      // If the deleted task is currently opened, redirect to /tasks
      if (params.id === String(deletedId)) {
        router.replace("/tasks")
      }
    },
    onError: (error) => {
      toast.error("Failed to delete task")
      console.error("Error deleting task:", error)
    },
    onSettled: () => {
      // Ensure UI is unlocked by refetching tasks
      queryClient.refetchQueries({ 
        queryKey: ["tasks"],
        exact: true 
      })
    }
  })

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tasks</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarMenuItem>
          <CreateTaskDialog />
        </SidebarMenuItem>
        {isLoading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <SidebarMenuItem key={i}>
                <div className="flex items-center gap-2 px-2 py-1.5 w-full">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              </SidebarMenuItem>
            ))}
          </>
        ) : (
          tasks.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild tooltip={item.title ?? ""} isActive={item.id === Number(params.id)}>
                <Link href={`/tasks/${item.id}`}>
                  <SquareCheckBig />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem asChild>
                    <Link href={`/tasks/${item.id}`}>
                      <Folder className="text-muted-foreground" />
                      <span>View Task</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Forward className="text-muted-foreground" />
                    <span>Share Task</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <ConfirmationDialog
                    title="Delete Task"
                    description="Are you sure you want to delete this task? This action cannot be undone."
                    confirmText="Delete"
                    variant="destructive"
                    onConfirm={() => deleteTask(item.id)}
                  >
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2/>
                      <span>Delete Task</span>
                    </DropdownMenuItem>
                  </ConfirmationDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
