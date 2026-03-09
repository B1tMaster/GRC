"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { SidebarMenuButton } from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
interface CreateTaskDialogProps {
  children?: React.ReactNode
}

import { createTestRun } from "@/lib/actions/payload-collections"

export function CreateTaskDialog({ children }: CreateTaskDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [name, setName] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const createTaskMutation = useMutation({
    mutationFn: createTestRun,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      router.push(`/tasks/${id}/upload`)
      setName("")
      setOpen(false)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create task")
    }
  })

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      createTaskMutation.mutate(name)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setName("")
      }
    }}>
      <DialogTrigger asChild>
        {children || (
          <SidebarMenuButton asChild tooltip="New Task">
            <button className="flex items-center gap-2 cursor-pointer focus:outline-none">
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </SidebarMenuButton>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Enter a name for your new task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Task name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || createTaskMutation.isPending}>
              {createTaskMutation.isPending ? "Creating..." : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 