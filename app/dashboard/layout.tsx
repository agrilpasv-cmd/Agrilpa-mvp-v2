"use client"

import { DashboardProvider } from "./context"
import DashboardShell from "./dashboard-shell"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
    </DashboardProvider>
  )
}
