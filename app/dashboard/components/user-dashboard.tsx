"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Search, Monitor, MessageSquare, Users, Eye, CheckCircle2, CircleAlert, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie
} from "recharts"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

export interface DashboardData {
    companyName?: string
    activityType: 'empty' | 'buyer' | 'seller' | 'mixed'
    seller: any
    buyer: any
    pipelineVentas: any
    pipelineCompras: any
    pendingActions: any[]
    performance: any[]
    recentActivity: any[]
}

/* ───────────────────────── helpers ───────────────────────── */
function formatTime(iso: string) {
    try { return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es }) }
    catch { return "recientemente" }
}

/* Build mock weekly quote trend (last 8 weeks) from recentActivity */
function buildWeeklyData(recentActivity: any[]) {
    const weeks: Record<string, number> = {}
    for (let i = 7; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i * 7)
        const key = `S${8 - i}`
        weeks[key] = 0
    }
    recentActivity.forEach(a => {
        try {
            const daysAgo = Math.floor((Date.now() - new Date(a.time).getTime()) / 86400000)
            const weekIndex = Math.floor(daysAgo / 7)
            if (weekIndex < 8) {
                const key = `S${8 - weekIndex}`
                if (key in weeks) weeks[key]++
            }
        } catch { }
    })
    return Object.entries(weeks).map(([name, value]) => ({ name, value }))
}

/* Build category distribution from performance data */
function buildCategoryData(performance: any[]) {
    const counts: Record<string, number> = {}
    performance.forEach(p => {
        const cat = p.categoria || "Otros"
        counts[cat] = (counts[cat] || 0) + (p.vistas || 1)
    })
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
    const colors = ["#2D6A4F", "#40916C", "#74C69D", "#95D5B2", "#B7E4C7"]
    return Object.entries(counts).map(([name, value], i) => ({
        name, value, pct: Math.round((value / total) * 100), color: colors[i % colors.length]
    }))
}

/* Status badge */
function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        pending: { label: "PENDIENTE", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
        accepted: { label: "ACEPTADA", cls: "bg-green-100 text-green-700 border border-green-200" },
        rejected: { label: "RECHAZADA", cls: "bg-red-100 text-red-700 border border-red-200" },
    }
    const s = map[status] || { label: status.toUpperCase(), cls: "bg-muted text-muted-foreground" }
    return <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wide ${s.cls}`}>{s.label}</span>
}

/* ───────────────────────── empty state ───────────────────── */
function EmptyState() {
    return (
        <div className="p-8 max-w-7xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">¡Bienvenido a Agrilpa!</h1>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
                Comienza tu viaje en el principal marketplace B2B agrícola.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                <div className="p-8 bg-white rounded-2xl shadow-sm flex flex-col items-center hover:shadow-md transition-all">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <PlusCircle className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Quiero Vender</h3>
                    <p className="text-muted-foreground mb-8">Abre nuevos mercados globales.</p>
                    <Button className="w-full py-6 bg-primary hover:bg-primary/90" asChild>
                        <Link href="/dashboard/mis-publicaciones/nueva">Publica tu primer producto</Link>
                    </Button>
                </div>
                <div className="p-8 bg-white rounded-2xl shadow-sm flex flex-col items-center hover:shadow-md transition-all">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                        <Search className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Quiero Comprar</h3>
                    <p className="text-muted-foreground mb-8">Encuentra los mejores proveedores.</p>
                    <Button variant="outline" className="w-full py-6 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white" asChild>
                        <Link href="/productos">Explora productos</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}

/* ───────────────────────── main dashboard ─────────────────── */
export function UserDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/dashboard/dynamic-data', { cache: 'no-store' })
            .then(r => r.ok ? r.json() : null)
            .then(result => { if (result) setData(result) })
            .catch(e => console.error("Dashboard fetch error:", e))
            .finally(() => setLoading(false))
    }, [])

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        )
    }

    if (data.activityType === 'empty') return <EmptyState />

    const { companyName, activityType, seller, buyer, performance, recentActivity, pendingActions } = data
    const isSeller = activityType === 'seller' || activityType === 'mixed'

    // Derived data for charts
    const weeklyData = buildWeeklyData(recentActivity)
    const categoryData = buildCategoryData(performance)
    const totalCatPct = categoryData.reduce((s, c) => s + c.pct, 0)
    const optimizedPct = Math.min(totalCatPct, 100)

    // KPI values
    const kpis = isSeller
        ? [
            { icon: Monitor, label: "Publicaciones Activas", value: performance.length, trend: "+2 this week" },
            { icon: MessageSquare, label: "Cotizaciones Recibidas", value: seller?.quotes_received_7d ?? 0, trend: "+8 new today" },
            { icon: Users, label: "Compradores Contactados", value: seller?.quotes_pending ?? 0, trend: "+5 this week" },
            { icon: Eye, label: "Vistas Totales", value: performance.reduce((s: number, p: any) => s + (p.vistas || 0), 0), trend: "+12% last month" },
        ]
        : [
            { icon: MessageSquare, label: "Solicitudes Enviadas", value: buyer?.requests_sent ?? 0, trend: "Total" },
            { icon: Monitor, label: "Cotizaciones Recibidas", value: buyer?.quotes_received ?? 0, trend: "Respondidas" },
            { icon: Users, label: "Pedidos en Proceso", value: buyer?.orders_in_process ?? 0, trend: "Activos" },
            { icon: Eye, label: "Total Comprado", value: buyer?.total_bought ?? "$0", trend: "Acumulado" },
        ]

    // Recent quotes from pending actions (these are real quote data)
    const recentQuotes = pendingActions.slice(0, 5)

    // Top products
    const topProducts = [...performance].sort((a: any, b: any) => b.vistas - a.vistas).slice(0, 5)
    const maxViews = topProducts.length > 0 ? Math.max(...topProducts.map((p: any) => p.vistas)) : 1

    return (
        <div className="min-h-screen bg-[#f5f7f5]">
            <div className="w-full px-6 lg:px-8 py-8 space-y-6">

                {/* ── Page title ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Bienvenido a tu dashboard, <span className="text-primary">{companyName || 'Usuario'}</span>
                        </h1>
                    </div>
                </div>

                {/* ══════ ROW 1: KPI Cards ══════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {kpis.map((kpi, i) => {
                        const Icon = kpi.icon
                        return (
                            <div key={i} className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden flex flex-col justify-between">
                                {/* Decoración de fondo interactiva */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.03] rounded-bl-[100px] -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />
                                
                                <div className="relative flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center transform transition-transform duration-300 group-hover:rotate-3 group-hover:bg-primary/20">
                                        <Icon className="w-6 h-6 text-primary" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 whitespace-nowrap">
                                        {kpi.trend}
                                    </span>
                                </div>

                                <div className="relative">
                                    <p className="text-sm font-semibold text-muted-foreground mb-1">{kpi.label}</p>
                                    <p className="text-[2.5rem] leading-none font-black text-foreground tracking-tighter">
                                        {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                                    </p>
                                </div>
                                
                                {/* Barra inferior animada on hover */}
                                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-[#8BC646] transition-all duration-300 w-0 group-hover:w-full opacity-0 group-hover:opacity-100" />
                            </div>
                        )
                    })}
                </div>

                {/* ══════ ROW 2: Line Chart + Donut Chart ══════ */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Left: Line chart */}
                    <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-start justify-between mb-1">
                            <div>
                                <h3 className="text-base font-bold text-foreground">Cotizaciones por Semana</h3>
                                <p className="text-xs text-primary mt-0.5">Análisis de demanda de los últimos 2 meses</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                                <span className="text-xs font-semibold text-muted-foreground">DEMANDA</span>
                            </div>
                        </div>
                        <div className="h-52 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
                                        cursor={{ stroke: '#8BC646', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#2D6A4F"
                                        strokeWidth={2.5}
                                        dot={{ fill: '#2D6A4F', r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: '#8BC646', strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right: Donut chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-base font-bold text-foreground mb-4">Categorías de Producto</h3>

                        {categoryData.length > 0 ? (
                            <>
                                <div className="relative flex items-center justify-center my-2">
                                    <PieChart width={160} height={160}>
                                        <Pie
                                            data={categoryData}
                                            cx={75}
                                            cy={75}
                                            innerRadius={52}
                                            outerRadius={75}
                                            startAngle={90}
                                            endAngle={-270}
                                            dataKey="pct"
                                            strokeWidth={0}
                                        >
                                            {categoryData.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-foreground">{optimizedPct}%</span>
                                        <span className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase">Optimizado</span>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-2">
                                    {categoryData.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                                                <span className="text-muted-foreground font-medium">{c.name}</span>
                                            </div>
                                            <span className="font-bold text-foreground">{c.pct}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm text-center">
                                <p>Publica productos para ver</p>
                                <p>la distribución por categoría.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ══════ ROW 3: Recent Quotes Table + Top Products ══════ */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                    {/* Left: Actividad Reciente */}
                    <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
                            <h3 className="text-base font-bold text-foreground">Actividad Reciente</h3>
                        </div>

                        <div className="p-6">
                            <div className="relative border-l border-gray-100 ml-3 space-y-7">
                                {recentActivity && recentActivity.length > 0 ? (
                                    recentActivity.map((item: any) => (
                                        <div key={item.id} className="relative pl-6">
                                            <span className={`absolute -left-[14px] top-1 bg-white border rounded-full p-0.5 shadow-sm ${item.isPositive ? 'border-green-200' : 'border-red-200'}`}>
                                                {item.isPositive ? (
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <CircleAlert className="w-5 h-5 text-red-500" />
                                                )}
                                            </span>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-sm font-medium text-foreground">{item.text}</p>
                                                <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 sm:mt-0">
                                                    {formatTime(item.time)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground pl-4">No hay actividad reciente.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Rendimiento de Productos */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-50">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <h3 className="text-base font-bold text-foreground">Rendimiento de Productos</h3>
                        </div>
                        <div className="px-6 py-2 overflow-x-auto">
                            {topProducts.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left font-bold text-foreground py-3">Producto</th>
                                            <th className="text-center font-bold text-foreground py-3">Vistas</th>
                                            <th className="text-center font-bold text-foreground py-3">Solicitudes</th>
                                            <th className="text-right font-bold text-foreground py-3 whitespace-nowrap">Conversión</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {topProducts.map((p: any, i: number) => (
                                            <tr key={p.id || i} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 text-muted-foreground font-medium pr-4">{p.producto}</td>
                                                <td className="py-4 text-center font-bold text-foreground">{p.vistas}</td>
                                                <td className="py-4 text-center font-bold text-foreground">{p.solicitudes}</td>
                                                <td className="py-4 text-right font-bold text-primary">{p.conversion}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-foreground">Publica productos para ver su rendimiento aquí.</p>
                                    <Button asChild size="sm" className="mt-4">
                                        <Link href="/dashboard/mis-publicaciones/nueva">Publicar ahora</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
