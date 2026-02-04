"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { AdminDashboard } from "./components/admin-dashboard"
import { UserDashboard } from "./components/user-dashboard"

export default function DashboardPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { user } } = await supabase.auth.getUser()

      if (user && user.email === "agrilpasv@gmail.com") {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    }

    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return isAdmin ? <AdminDashboard /> : <UserDashboard />
}
