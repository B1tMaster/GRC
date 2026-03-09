"use client"

import { FileText, Target, Shield, AlertTriangle } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

const grcNavItems = [
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Governance Objectives",
    href: "/governance",
    icon: Target,
  },
  {
    title: "Control Objectives",
    href: "/controls",
    icon: Shield,
  },
  {
    title: "Risk Appetite",
    href: "/risk-appetite",
    icon: AlertTriangle,
  },
]

export function NavGrc() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>GRC</SidebarGroupLabel>
      <SidebarMenu>
        {grcNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton asChild tooltip={item.title} isActive={pathname?.startsWith(item.href)}>
              <Link href={item.href}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
