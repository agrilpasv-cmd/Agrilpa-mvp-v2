"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Users, MessageSquare, Shield, Database, ClipboardList, Package, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnalyticsDashboard } from "@/app/admin/components/analytics-dashboard"

interface Stats {
    totalUsers: number
    adminUsers: number
    regularUsers: number
}

export function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
    })
    const [analyticsData, setAnalyticsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [analyticsLoading, setAnalyticsLoading] = useState(false)
    const [range, setRange] = useState("7d")
    const rangeRef = useRef(range)
    const abortControllerRef = useRef<AbortController | null>(null)

    const fetchData = useCallback(async (currentRange?: string) => {
        const fetchRange = currentRange || rangeRef.current

        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        const controller = new AbortController()
        abortControllerRef.current = controller

        try {
            const response = await fetch(`/api/admin/stats?range=${fetchRange}&t=${Date.now()}`, {
                cache: "no-store",
                signal: controller.signal,
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                },
            })

            if (controller.signal.aborted) return

            if (response.ok) {
                const data = await response.json()
                if (rangeRef.current === fetchRange) {
                    setStats({
                        totalUsers: data.totalUsers,
                        adminUsers: data.adminUsers,
                        regularUsers: data.regularUsers,
                    })
                    if (data.detailedAnalytics) {
                        setAnalyticsData(data.detailedAnalytics)
                    }
                }
            }
        } catch (error: any) {
            if (error?.name === "AbortError") return
            console.error("Error fetching stats:", error)
        } finally {
            if (!controller.signal.aborted) {
                setLoading(false)
                setAnalyticsLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        fetchData()
        // Auto-refresh every 30 seconds for real-time analytics
        const interval = setInterval(() => fetchData(), 30000)
        return () => {
            clearInterval(interval)
            if (abortControllerRef.current) abortControllerRef.current.abort()
        }
    }, [fetchData])

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
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
                        <p className="text-muted-foreground">Vista exclusiva para administradores de Agrilpa</p>
                    </div>
                </div>

                {/* Stats Grid - System Health */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Link href="/admin/usuarios">
                        <Card className="p-6 border-l-4 border-l-primary cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Total Usuarios</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                                    <p className="text-xs text-green-600 mt-2">{stats.regularUsers} regulares</p>
                                </div>
                                <Users className="w-12 h-12 text-primary/20" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/admin/cotizaciones">
                        <Card className="p-6 border-l-4 border-l-primary cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Cotizaciones</p>
                                    <p className="text-3xl font-bold text-foreground">{stats.adminUsers}</p>
                                    <p className="text-xs text-blue-600 mt-2">Gestionar solicitudes</p>
                                </div>
                                <ClipboardList className="w-12 h-12 text-primary/20" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/admin/suscripciones">
                        <Card className="p-6 border-l-4 border-l-primary cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Suscripciones</p>
                                    <p className="text-3xl font-bold text-foreground">Activas</p>
                                    <p className="text-xs text-green-600 mt-2">Newsletter</p>
                                </div>
                                <MessageSquare className="w-12 h-12 text-primary/20" />
                            </div>
                        </Card>
                    </Link>

                    <Link href="/admin/publicaciones">
                        <Card className="p-6 border-l-4 border-l-primary cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Publicaciones</p>
                                    <p className="text-3xl font-bold text-foreground">Ver</p>
                                    <p className="text-xs text-green-600 mt-2">Todas las publicaciones</p>
                                </div>
                                <Package className="w-12 h-12 text-primary/20" />
                            </div>
                        </Card>
                    </Link>
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
                        <AnalyticsDashboard
                            data={analyticsData}
                            currentRange={range}
                            loading={analyticsLoading}
                            onRangeChange={(newRange) => {
                                setRange(newRange)
                                rangeRef.current = newRange
                                setAnalyticsLoading(true)
                                fetchData(newRange)
                            }}
                        />
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
                                className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent hover:border-primary"
                            >
                                <Users className="w-8 h-8 text-primary" />
                                <span className="font-semibold">Gestión de Usuarios</span>
                            </Button>
                        </Link>
                        <Link href="/admin/publicaciones">
                            <Button
                                variant="outline"
                                className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent hover:border-primary"
                            >
                                <Package className="w-8 h-8 text-primary" />
                                <span className="font-semibold">Publicaciones</span>
                            </Button>
                        </Link>
                        <Link href="/admin/contactanos">
                            <Button
                                variant="outline"
                                className="w-full h-24 flex flex-col items-center justify-center gap-2 bg-transparent hover:border-primary"
                            >
                                <MessageSquare className="w-8 h-8 text-primary" />
                                <span className="font-semibold">Contáctanos</span>
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}
