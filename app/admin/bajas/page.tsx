"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserX, TrendingDown, FileText, Calendar } from "lucide-react"

interface DeletionReport {
    id: string
    user_email: string
    reason: string
    custom_reason: string | null
    deleted_at: string
}

interface Stats {
    total: number
    last7: number
    last30: number
    topReason: string
}

export default function BajasPage() {
    const [reports, setReports] = useState<DeletionReport[]>([])
    const [stats, setStats] = useState<Stats>({ total: 0, last7: 0, last30: 0, topReason: "—" })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/admin/deletion-reports")
            .then(r => r.json())
            .then(data => {
                const list: DeletionReport[] = data.reports || []
                setReports(list)

                const now = Date.now()
                const last7 = list.filter(r => now - new Date(r.deleted_at).getTime() < 7 * 86400000).length
                const last30 = list.filter(r => now - new Date(r.deleted_at).getTime() < 30 * 86400000).length

                // Count reasons
                const freq: Record<string, number> = {}
                list.forEach(r => { freq[r.reason] = (freq[r.reason] || 0) + 1 })
                const topReason = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

                setStats({ total: list.length, last7, last30, topReason })
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const statCards = [
        { label: "Total de bajas", value: stats.total, icon: UserX, color: "text-red-600", bg: "bg-red-50" },
        { label: "Últimos 7 días", value: stats.last7, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
        { label: "Últimos 30 días", value: stats.last30, icon: TrendingDown, color: "text-yellow-600", bg: "bg-yellow-50" },
    ]

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Reportes de Bajas</h1>
                <p className="text-muted-foreground">Motivos por los que los usuarios eliminaron su cuenta</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statCards.map(s => (
                    <Card key={s.label}>
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`${s.bg} p-3 rounded-lg`}>
                                <s.icon className={`w-5 h-5 ${s.color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{s.value}</p>
                                <p className="text-sm text-muted-foreground">{s.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Top reason */}
            {stats.topReason !== "—" && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4 flex items-start gap-3">
                        <FileText className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-orange-800">Motivo más frecuente</p>
                            <p className="text-sm text-orange-700">{stats.topReason}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de eliminaciones</CardTitle>
                    <CardDescription>Registros de todas las cuentas eliminadas con su motivo declarado</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                            Cargando reportes...
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                            <UserX className="w-10 h-10 opacity-40" />
                            <p className="text-sm">No hay bajas registradas aún</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Correo</th>
                                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Motivo</th>
                                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Detalle</th>
                                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(r => (
                                        <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4 font-medium">{r.user_email}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    {r.reason}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground max-w-xs">
                                                {r.custom_reason || <span className="text-muted-foreground/50">—</span>}
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                                                {new Date(r.deleted_at).toLocaleString("es-SV", {
                                                    dateStyle: "medium", timeStyle: "short"
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
