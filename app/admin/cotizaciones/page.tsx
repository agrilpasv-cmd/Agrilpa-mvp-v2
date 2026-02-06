"use client"

import { useState, useEffect } from "react"
import {
    ClipboardList,
    Search,
    Filter,
    Eye,
    TrendingUp,
    CheckCircle2,
    Clock,
    XCircle,
    Download,
    Mail,
    Phone,
    MapPin,
    Package,
    Calendar,
    DollarSign,
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"

interface Quotation {
    id: string
    product_id: string
    product_title: string
    product_image: string
    seller_id: string
    buyer_name: string
    contact_method: string
    country_code: string | null
    phone_number: string | null
    email: string | null
    quantity: number
    destination_country: string
    estimated_date: string
    notes: string | null
    target_price: number | null
    incoterm: string | null
    currency: string
    status: string
    created_at: string
}

export default function AdminQuotationsPage() {
    const [quotations, setQuotations] = useState<Quotation[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)

    useEffect(() => {
        fetchQuotations()
    }, [])

    const fetchQuotations = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/admin/quotations")
            const data = await response.json()
            if (data.quotations) {
                setQuotations(data.quotations)
                setStats(data.stats)
            }
        } catch (error) {
            console.error("Error fetching admin quotations:", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredQuotations = quotations.filter(q => {
        const matchesSearch =
            q.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.product_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.destination_country?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = filterStatus === "all" || q.status === filterStatus

        return matchesSearch && matchesStatus
    })

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Pendiente</Badge>
            case "replied": return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Respondida</Badge>
            case "rejected": return <Badge variant="outline" className="text-red-600 border-red-200">Rechazada</Badge>
            default: return <Badge variant="outline">{status}</Badge>
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
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Registro de Cotizaciones</h1>
                <p className="text-muted-foreground">Monitorea y analiza toda la demanda de productos en la plataforma.</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Cotizaciones</p>
                                <h3 className="text-3xl font-bold mt-1">{stats?.total || 0}</h3>
                            </div>
                            <div className="bg-primary/20 p-3 rounded-xl">
                                <ClipboardList className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pendientes</p>
                                <h3 className="text-3xl font-bold mt-1 text-yellow-600">{stats?.pending || 0}</h3>
                            </div>
                            <div className="bg-yellow-50 p-3 rounded-xl">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Respondidas</p>
                                <h3 className="text-3xl font-bold mt-1 text-green-600">{stats?.replied || 0}</h3>
                            </div>
                            <div className="bg-green-50 p-3 rounded-xl">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Productos Top
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-xs space-y-1">
                            {stats?.topProducts?.map((p: any, i: number) => (
                                <li key={i} className="flex justify-between items-center">
                                    <span className="truncate max-w-[120px]">{p.title}</span>
                                    <span className="font-bold text-primary">{p.count}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-end bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="w-full sm:max-w-md space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Buscar cotización</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Comprador, producto o destino..."
                            className="pl-9 h-11 bg-muted/50 border-transparent focus:bg-white focus:border-primary transition-all rounded-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="w-full sm:w-auto space-y-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground ml-1">Estado</label>
                    <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
                        <Button
                            variant={filterStatus === "all" ? "default" : "ghost"}
                            size="sm"
                            className="h-9 px-4 rounded-md text-xs font-semibold transition-all"
                            onClick={() => setFilterStatus("all")}
                        >
                            Todos
                        </Button>
                        <Button
                            variant={filterStatus === "pending" ? "default" : "ghost"}
                            size="sm"
                            className="h-9 px-4 rounded-md text-xs font-semibold transition-all"
                            onClick={() => setFilterStatus("pending")}
                        >
                            Pendientes
                        </Button>
                        <Button
                            variant={filterStatus === "replied" ? "default" : "ghost"}
                            size="sm"
                            className="h-9 px-4 rounded-md text-xs font-semibold transition-all"
                            onClick={() => setFilterStatus("replied")}
                        >
                            Respondidas
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quotations Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Fecha</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Comprador</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Producto</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Cant. / Destino</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Estado</th>
                                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredQuotations.map((q) => (
                                <tr key={q.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-medium">
                                        {formatDate(q.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground">{q.buyer_name}</span>
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground italic">
                                                {q.contact_method === "WhatsApp" ? <Phone className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                                                {q.phone_number || q.email || q.contact_method}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {q.product_image && (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                                    <Image src={q.product_image} alt={q.product_title} width={40} height={40} className="object-cover h-full" />
                                                </div>
                                            )}
                                            <span className="font-medium line-clamp-1 max-w-[200px]">{q.product_title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-primary">{q.quantity} unidades</span>
                                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                <MapPin className="w-3 h-3" />
                                                {q.destination_country}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(q.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-9 px-4 rounded-md hover:bg-primary hover:text-white transition-all gap-2"
                                                    onClick={() => setSelectedQuotation(q)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Detalles
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                                                <DialogHeader className="border-b pb-4 mb-4">
                                                    <div className="flex items-center justify-between mt-4">
                                                        <div>
                                                            <DialogTitle className="text-2xl font-bold">Detalles de Cotización</DialogTitle>
                                                            <DialogDescription>ID: {selectedQuotation?.id}</DialogDescription>
                                                        </div>
                                                        {selectedQuotation && getStatusBadge(selectedQuotation.status)}
                                                    </div>
                                                </DialogHeader>

                                                {selectedQuotation && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                                                        {/* Product & Base Info */}
                                                        <div className="space-y-6">
                                                            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-border shadow-sm flex-shrink-0">
                                                                        <Image
                                                                            src={selectedQuotation.product_image || "/placeholder.jpg"}
                                                                            alt={selectedQuotation.product_title}
                                                                            width={80} height={80}
                                                                            className="object-cover h-full w-full"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-bold text-lg leading-tight mb-1">{selectedQuotation.product_title}</h4>
                                                                        <p className="text-sm text-primary font-bold">{selectedQuotation.quantity} unidades</p>
                                                                        <p className="text-xs text-muted-foreground mt-2">Solicitado el {formatDate(selectedQuotation.created_at)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-4">
                                                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Información Logística</h4>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="bg-muted/30 p-3 rounded-xl">
                                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Destino</p>
                                                                        <p className="text-sm font-semibold flex items-center gap-2">
                                                                            <MapPin className="w-4 h-4 text-primary" />
                                                                            {selectedQuotation.destination_country}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-muted/30 p-3 rounded-xl">
                                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Fecha Estimada</p>
                                                                        <p className="text-sm font-semibold flex items-center gap-2">
                                                                            <Calendar className="w-4 h-4 text-primary" />
                                                                            {formatDate(selectedQuotation.estimated_date)}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-muted/30 p-3 rounded-xl">
                                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Incoterm</p>
                                                                        <p className="text-sm font-semibold flex items-center gap-2">
                                                                            <Package className="w-4 h-4 text-primary" />
                                                                            {selectedQuotation.incoterm || "No especificado"}
                                                                        </p>
                                                                    </div>
                                                                    <div className="bg-muted/30 p-3 rounded-xl">
                                                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Precio Objetivo</p>
                                                                        <p className="text-sm font-bold text-primary flex items-center gap-1">
                                                                            <DollarSign className="w-4 h-4" />
                                                                            {selectedQuotation.target_price ? `${selectedQuotation.target_price} ${selectedQuotation.currency}` : "No especificado"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Buyer & Notes */}
                                                        <div className="space-y-6">
                                                            <div className="space-y-4">
                                                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Datos del Comprador</h4>
                                                                <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
                                                                    <p className="font-bold text-lg mb-4">{selectedQuotation.buyer_name}</p>
                                                                    <div className="space-y-3">
                                                                        <div className="flex items-center gap-3 text-sm">
                                                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                                <Mail className="w-4 h-4 text-primary" />
                                                                            </div>
                                                                            <span className="font-medium">{selectedQuotation.email || "—"}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-3 text-sm">
                                                                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                                                                <Phone className="w-4 h-4 text-green-600" />
                                                                            </div>
                                                                            <span className="font-medium">
                                                                                {selectedQuotation.country_code ? `+${selectedQuotation.country_code} ` : ""}
                                                                                {selectedQuotation.phone_number || "—"}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Notas Adicionales</h4>
                                                                <div className="bg-muted/20 p-4 rounded-2xl border border-dashed border-border min-h-[100px]">
                                                                    <p className="text-sm leading-relaxed whitespace-pre-wrap italic">
                                                                        {selectedQuotation.notes || "El comprador no ha incluido notas adicionales para esta cotización."}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="pt-4 flex gap-2">
                                                                <Button variant="outline" className="flex-1 rounded-xl h-11" asChild>
                                                                    <Link href={`/productos/${selectedQuotation.product_id}`} target="_blank">
                                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                                        Ver Producto
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </DialogContent>
                                        </Dialog>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredQuotations.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-border">
                            <ClipboardList className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <h4 className="font-semibold text-lg">No se encontraron cotizaciones</h4>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">Prueba a ajustar tu búsqueda o los filtros aplicados.</p>
                        <Button className="mt-6 rounded-xl" variant="outline" onClick={() => { setSearchTerm(""); setFilterStatus("all") }}>
                            Limpiar filtros
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    )
}

import Link from "next/link"
