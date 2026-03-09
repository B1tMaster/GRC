"use client"

import * as React from "react"
import { SquareCheckBig } from "lucide-react"

import { NavTasks } from "@/components/nav-tasks"
import { NavGrc } from "@/components/nav-grc"
import { NavUser } from "@/components/nav-user"
import { SidebarLogo } from "@/components/sidebar-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useUser } from "@/lib/providers/user-provider"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, tasks, isLoading } = useUser()
  
  const navUser = user ? {
    email: user.email || '',
    avatar: '/avatars/default.jpg', // Fallback avatar
  } : null
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavGrc />
        <NavTasks tasks={tasks} isLoading={isLoading}/>
      </SidebarContent>
      <SidebarFooter>
        {navUser && <NavUser user={navUser} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
