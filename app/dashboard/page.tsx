"use client"

import { useEffect, useState } from "react"
import { AdminDashboard } from "./components/admin-dashboard"
import { UserDashboard } from "./components/user-dashboard"
import { AuthStorage } from "@/lib/auth-storage"

const ADMIN_EMAIL = "agrilpasv@gmail.com"

export default function DashboardPage() {
  // Read from localStorage synchronously — no spinner on repeated visits
  const localSession = AuthStorage.getSession()
  const initialIsAdmin = localSession?.email === ADMIN_EMAIL

  const [isAdmin, setIsAdmin] = useState(initialIsAdmin)
  const [loading, setLoading] = useState(!localSession) // skip loading if we have local session

  useEffect(() => {
    if (localSession) {
      // Already decided from local storage — verify in background silently
      setLoading(false)
    }

    const verify = async () => {
      try {
        const { createBrowserClient } = await import("@/lib/supabase/client")
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const admin = user.email === ADMIN_EMAIL
          setIsAdmin(admin)
        }
      } catch {
        // Silently fail — local session is still valid
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return isAdmin ? <AdminDashboard /> : <UserDashboard />
}
