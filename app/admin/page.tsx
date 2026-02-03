"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Users, MessageSquare, Shield, Database } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnalyticsDashboard } from "./components/analytics-dashboard"

interface Stats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
  })
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats({
          totalUsers: data.totalUsers,
          adminUsers: data.adminUsers,
          regularUsers: data.regularUsers,
        })
        if (data.detailedAnalytics) {
          setAnalyticsData(data.detailedAnalytics)
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30 seconds for real-time analytics
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Shield className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Panel de Administración</h1>
            <p className="text-muted-foreground">Gestiona usuarios y monitorea la plataforma Agrilpa</p>
          </div>
        </div>

        {/* Stats Grid - System Health */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Usuarios</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-2">{stats.regularUsers} regulares</p>
              </div>
              <Users className="w-12 h-12 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Administradores</p>
                <p className="text-3xl font-bold text-foreground">{stats.adminUsers}</p>
                <p className="text-xs text-blue-600 mt-2">Con acceso completo</p>
              </div>
              <Shield className="w-12 h-12 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Suscripciones</p>
                <p className="text-3xl font-bold text-foreground">Activas</p>
                <p className="text-xs text-green-600 mt-2">Newsletter</p>
              </div>
              <MessageSquare className="w-12 h-12 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Base de Datos</p>
                <p className="text-3xl font-bold text-foreground">Activa</p>
                <p className="text-xs text-green-600 mt-2">Todas las tablas</p>
              </div>
              <Database className="w-12 h-12 text-primary/20" />
            </div>
          </Card>
        </div>

        {/* Vercel-Style Analytics Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Web Analytics</h2>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>

          {analyticsData ? (
            <AnalyticsDashboard data={analyticsData} />
          ) : (
            <div className="p-12 text-center border rounded-lg bg-muted/10">Cargando analíticas...</div>
          )}
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">Accesos Rápidos</h3>
              <p className="text-sm text-muted-foreground">Navega a las secciones principales</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Link href="/admin/usuarios">
              <Button
                variant="outline"
                className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
              >
                <Users className="w-8 h-8 text-primary" />
                <span className="font-semibold">Gestión de Usuarios</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
              disabled
            >
              <Database className="w-8 h-8 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">Sistema</span>
            </Button>
            <Button
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
              disabled
            >
              <Shield className="w-8 h-8 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">Configuración</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
