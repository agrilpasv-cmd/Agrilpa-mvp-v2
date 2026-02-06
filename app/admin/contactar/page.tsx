"use client"

import { useState, useEffect } from "react"
import {
    MessageCircle,
    Mail,
    Send,
    TrendingUp,
    BarChart3,
    MousePointer2,
    Search,
    Package,
    Clock,
    User,
    ArrowUpRight,
    ExternalLink
} from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ContactClick {
    id: string
    product_id: string
    product_title: string
    seller_id: string
    click_type: string
    user_id: string | null
    created_at: string
}

export default function AdminContactClicksPage() {
    const [clicks, setClicks] = useState<ContactClick[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchClicks(true)

        // Auto-refresh every 10 seconds
        const interval = setInterval(() => {
            fetchClicks(false)
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    const fetchClicks = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true)
            else setRefreshing(true)

            const response = await fetch("/api/admin/contact-clicks", { cache: "no-store" })
            const data = await response.json()
            if (data.clicks) {
                setClicks(data.clicks)
                setStats(data.stats)
            }
        } catch (error) {
            console.error("Error fetching admin contact clicks:", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const filteredClicks = clicks.filter(c => {
        return c.product_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.click_type?.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("es-ES", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        })
    }

    const getClickTypeBadge = (type: string) => {
        switch (type) {
            case "whatsapp": return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 font-bold"><MessageCircle className="w-3 h-3" /> WhatsApp</Badge>
            case "email": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1 font-bold"><Mail className="w-3 h-3" /> Email</Badge>
            case "telegram": return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 gap-1 font-bold"><Send className="w-3 h-3" /> Telegram</Badge>
            default: return <Badge variant="secondary" className="gap-1 font-bold"><MousePointer2 className="w-3 h-3" /> Interés</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Métricas de Contacto</h1>
                    <p className="text-muted-foreground">Analiza qué productos y canales generan más interés directo.</p>
                </div>
                <div className="flex items-center gap-2">
                    {refreshing && (
                        <span className="text-[10px] font-bold text-primary animate-pulse uppercase">Actualizando...</span>
                    )}
                    <Button onClick={() => fetchClicks(true)} variant="outline" size="sm" className="rounded-xl">
                        {refreshing ? "Cargando..." : "Actualizar"}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-primary/5 border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Gral.</p>
                                <h3 className="text-3xl font-black mt-2">{stats?.total || 0}</h3>
                            </div>
                            <div className="bg-primary/10 p-3 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-green-50/50 border-l-4 border-l-green-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-green-700">WhatsApp</p>
                                <h3 className="text-3xl font-black mt-2 text-green-600">{stats?.whatsapp || 0}</h3>
                            </div>
                            <div className="bg-green-100 p-3 rounded-2xl">
                                <MessageCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-blue-50/50 border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-blue-700">Email</p>
                                <h3 className="text-3xl font-black mt-2 text-blue-600">{stats?.email || 0}</h3>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-2xl">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-orange-50/50 border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-orange-700">Inicios</p>
                                <h3 className="text-3xl font-black mt-2 text-orange-600">
                                    {clicks.filter(c => c.click_type === 'generic').length}
                                </h3>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-2xl">
                                <MousePointer2 className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Filtrar por producto o tipo..."
                                className="pl-9 h-11 bg-muted/30 border-transparent focus:bg-white focus:border-primary transition-all rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="bg-muted/30 border-b border-border">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Actividad Reciente
                            </CardTitle>
                        </CardHeader>
                        <div className="divide-y divide-border">
                            {filteredClicks.map((c) => (
                                <div key={c.id} className="p-4 hover:bg-muted/20 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl border border-border bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                                            {c.click_type === 'whatsapp' ? <MessageCircle className="w-5 h-5 text-green-600" /> :
                                                c.click_type === 'email' ? <Mail className="w-5 h-5 text-blue-600" /> :
                                                    c.click_type === 'telegram' ? <Send className="w-5 h-5 text-sky-600" /> :
                                                        <MousePointer2 className="w-5 h-5 text-orange-500" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground line-clamp-1">{c.product_title || "Producto desconocido"}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formatDate(c.created_at)}</span>
                                                <span className="text-muted-foreground/30">•</span>
                                                {getClickTypeBadge(c.click_type)}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                                        <Link href={`/producto/${c.product_id}`} target="_blank">
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    </Button>
                                </div>
                            ))}

                            {filteredClicks.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-muted-foreground font-medium italic">No se han registrado clicks con estos criterios.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="bg-primary/5 border-b border-primary/10">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Productos con más interés
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 px-4 pb-4">
                            <div className="space-y-3">
                                {stats?.topProducts?.map((p: any, i: number) => (
                                    <div key={i} className="flex flex-col gap-1 p-3 bg-muted/20 rounded-xl border border-border/50 group hover:border-primary/30 transition-all">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-xs line-clamp-2 max-w-[180px] group-hover:text-primary transition-colors">{p.title}</p>
                                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none shadow-none font-black h-5">
                                                {p.count}
                                            </Badge>
                                        </div>
                                        <div className="w-full bg-muted h-1 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="bg-primary h-full transition-all duration-1000"
                                                style={{ width: `${(p.count / (stats.topProducts[0]?.count || 1)) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                {(!stats?.topProducts || stats.topProducts.length === 0) && (
                                    <div className="text-center py-8">
                                        <p className="text-xs text-muted-foreground italic font-medium">Aún no hay datos agregados.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-black text-white rounded-2xl">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-primary p-3 rounded-2xl">
                                    <BarChart3 className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg leading-tight text-primary">Insight de Conversión</h4>
                                    <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Análisis de Usuarios</p>
                                </div>
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed font-medium">
                                El <span className="text-primary font-bold">WhatsApp</span> representa el <span className="text-white font-bold">{stats?.total > 0 ? Math.round((stats.whatsapp / stats.total) * 100) : 0}%</span> de los intentos de contacto, indicando que los usuarios prefieren la comunicación inmediata.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
