"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts"
import { TrendingUp, Users, FileText, MessageSquare, Activity } from 'lucide-react'
import { useState, useEffect } from "react"

export function UserDashboard() {
    const [stats, setStats] = useState({
        totalSales: 0,
        activeProducts: 0,
        totalPurchases: 0,
        messagesCount: 5,
        transaccionesCount: 0,
        quotationsCount: 0
    })
    const [salesData, setSalesData] = useState<any[]>([])
    const [activityData, setActivityData] = useState<any[]>([])
    const [recentActivity, setRecentActivity] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            // 1. Fetch Stats & Visuals from API
            const statsRes = await fetch("/api/dashboard/stats")
            if (statsRes.ok) {
                const data = await statsRes.json()
                setStats(prev => ({
                    ...prev,
                    totalSales: data.totalSales, // mapped to 'totalPurchases' really
                    totalPurchases: data.totalSales,
                    transaccionesCount: data.totalTransactions,
                    quotationsCount: data.quotationsCount
                }))
                setSalesData(data.monthlyData)
                setActivityData(data.weeklyData)
                setRecentActivity(data.recentActivity)
            }

            // 2. Fetch Active Products Count (Keep existing logic or API)
            const productsRes = await fetch("/api/products/get-user-products")
            if (productsRes.ok) {
                const pData = await productsRes.json()
                setStats(prev => ({ ...prev, activeProducts: pData.products?.length || 0 }))
            }

        } catch (e) {
            console.error("Dashboard fetch error:", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
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
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-foreground mb-2">Bienvenido de vuelta</h1>
                    <p className="text-muted-foreground">Aquí está el resumen de tu actividad en Agrilpa</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="p-6 border-l-4 border-l-primary">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Mis Compras</p>
                                <p className="text-3xl font-bold text-foreground">${stats.totalSales.toLocaleString()}</p>
                                <p className="text-xs text-green-600 mt-2">Total gastado</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-primary/20" />
                        </div>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-primary">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Cotizaciones</p>
                                <p className="text-3xl font-bold text-foreground">{stats.quotationsCount}</p>
                                <p className="text-xs text-blue-600 mt-2">Solicitudes pendientes</p>
                            </div>
                            <MessageSquare className="w-12 h-12 text-primary/20" />
                        </div>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-primary">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Productos Activos</p>
                                <p className="text-3xl font-bold text-foreground">{stats.activeProducts}</p>
                                <p className="text-xs text-green-600 mt-2">Todos verificados</p>
                            </div>
                            <FileText className="w-12 h-12 text-primary/20" />
                        </div>
                    </Card>

                    <Card className="p-6 border-l-4 border-l-primary">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Mensajes</p>
                                <p className="text-3xl font-bold text-foreground">5</p>
                                <p className="text-xs text-orange-600 mt-2">3 sin leer</p>
                            </div>
                            <MessageSquare className="w-12 h-12 text-primary/20" />
                        </div>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6 bg-gradient-to-br from-card to-card/50 shadow-lg border-2">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Compras por Mes</h3>
                                <p className="text-sm text-muted-foreground mt-1">Gasto mensual del año</p>
                            </div>
                            <div className="bg-primary/10 p-3 rounded-full">
                                <TrendingUp className="w-6 h-6 text-primary" />
                            </div>
                        </div>

                        <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Acumulado</p>
                                    <p className="text-3xl font-bold text-primary mt-1">${stats.totalSales.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Promedio / Compra</p>
                                    <p className="text-xl font-semibold text-foreground mt-1">
                                        {stats.transaccionesCount > 0 ? `$${(stats.totalSales / stats.transaccionesCount).toFixed(0)}` : '$0'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesData.length > 0 ? salesData : [{ name: 'Sin datos', ventas: 0 }]}>
                                <defs>
                                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--color-muted-foreground)"
                                    fontSize={12}
                                    fontWeight={500}
                                />
                                <YAxis
                                    stroke="var(--color-muted-foreground)"
                                    fontSize={12}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--color-card)",
                                        border: "2px solid var(--color-primary)",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                    labelStyle={{ fontWeight: "bold", color: "var(--color-foreground)" }}
                                    formatter={(value: any) => [`$${value.toLocaleString()}`, "Gasto"]}
                                />
                                <Bar
                                    dataKey="ventas"
                                    fill="url(#colorVentas)"
                                    radius={[12, 12, 0, 0]}
                                    maxBarSize={60}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-card to-card/50 shadow-lg border-2">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-foreground">Transacciones Recientes</h3>
                                <p className="text-sm text-muted-foreground mt-1">Actividad por semana</p>
                            </div>
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Activity className="w-6 h-6 text-primary" />
                            </div>
                        </div>

                        <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total de Compras</p>
                                    <p className="text-3xl font-bold text-primary mt-1">{stats.transaccionesCount}</p>
                                </div>
                            </div>
                        </div>

                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={activityData.length > 0 ? activityData : [{ name: 'Sin datos', transacciones: 0 }]}>
                                <defs>
                                    <linearGradient id="colorTransacciones" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--color-muted-foreground)"
                                    fontSize={12}
                                    fontWeight={500}
                                />
                                <YAxis
                                    stroke="var(--color-muted-foreground)"
                                    fontSize={12}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "var(--color-card)",
                                        border: "2px solid var(--color-primary)",
                                        borderRadius: "12px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                    labelStyle={{ fontWeight: "bold", color: "var(--color-foreground)" }}
                                    formatter={(value: any) => [value, "Compras"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="transacciones"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fill="url(#colorTransacciones)"
                                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7, strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card className="p-6 mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Actividad Reciente</h3>
                    <div className="space-y-4">
                        {(recentActivity.length > 0 ? recentActivity : [
                            { action: "Bienvenido a tu panel", time: "Ahora mismo", type: "success" }
                        ]).map((item: any, index: number) => (
                            <div
                                key={index}
                                className="flex items-center justify-between pb-4 border-b border-border last:border-b-0"
                            >
                                <div>
                                    <p className="font-medium text-foreground">{item.action}</p>
                                    <p className="text-sm text-muted-foreground">{item.time}</p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${item.type === "success" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                                        }`}
                                >
                                    {item.type === "success" ? "Completado" : "Nuevo"}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
