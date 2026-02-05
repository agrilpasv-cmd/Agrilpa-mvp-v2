"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Calendar, Loader, CheckCheck } from "lucide-react"
import { allProducts } from "@/lib/products-data"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useDashboard } from "../context"

export default function ComprasPage() {
    const [pedidos, setPedidos] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { refreshCounts } = useDashboard()

    const handleMarkAllRead = async () => {
        try {
            const res = await fetch("/api/user/orders/mark-read", {
                method: "POST",
                body: JSON.stringify({ all: true }),
            })
            if (res.ok) {
                await refreshCounts()
                alert("Todos los pedidos marcados como leídos")
            }
        } catch (e) {
            console.error("Error marking read", e)
        }
    }

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Buyer API (Purchases) - orders I made as buyer
                const response = await fetch("/api/user/orders", { cache: 'no-store' })
                if (response.ok) {
                    const data = await response.json()
                    const formattedOrders = (data.orders || []).map((order: any) => ({
                        id: order.id.slice(0, 8).toUpperCase(),
                        fullId: order.id,
                        producto: order.product_name,
                        vendedor: order.full_name, // Ahora refleja el nombre/empresa del vendedor desde la API
                        cantidad: `${order.quantity_kg} kg`,
                        estado: order.status || "Preparación",
                        fecha: order.created_at,
                        total: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.price_usd),
                        image: order.product_image || getProductImage(order.product_name, order.product_slug),
                        slug: order.product_slug,
                        is_read: order.is_read ?? true
                    }))

                    const idCounts: Record<string, number> = {}
                    formattedOrders.forEach((o: any) => {
                        idCounts[o.fullId] = (idCounts[o.fullId] || 0) + 1
                    })
                    const formattedOrdersUnique = formattedOrders.map((o: any, idx: number) => {
                        if (idCounts[o.fullId] > 1) {
                            return { ...o, fullId: `${o.fullId}_dup_${idx}` }
                        }
                        return o
                    })

                    setPedidos(formattedOrdersUnique)
                }
            } catch (error) {
                console.error("Error loading orders:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const handleOrderClick = async (id: string, isRead: boolean) => {
        if (isRead) return
        setPedidos(prev => prev.map(p => p.fullId === id ? { ...p, is_read: true } : p))
        refreshCounts()
        try {
            await fetch("/api/user/orders/mark-read", {
                method: "POST",
                body: JSON.stringify({ ids: [id] }),
            })
        } catch (e) {
            console.error("Failed to mark read", e)
        }
    }

    const [searchTerm, setSearchTerm] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const getEstadoBadge = (estado: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive"> = {
            Preparación: "default",
            "En Tránsito": "secondary",
            Entregado: "secondary",
            Pendiente: "default"
        }
        return variants[estado] || "default"
    }

    const getProductImage = (productName: string, slug?: string) => {
        if (slug) {
            const productBySlug = allProducts.find(p => String(p.id) === slug)
            if (productBySlug) return productBySlug.image
        }
        const product = allProducts.find(
            (p) =>
                productName.toLowerCase().includes(p.name.toLowerCase()) ||
                p.name.toLowerCase().includes(productName.toLowerCase()),
        )
        return product?.image || "/placeholder.svg"
    }

    const filteredPedidos = pedidos.filter((ped) => {
        const matchesSearch =
            ped.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ped.vendedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ped.id.toLowerCase().includes(searchTerm.toLowerCase())

        const pedDate = new Date(ped.fecha)
        const matchesDateRange =
            (!startDate || pedDate >= new Date(startDate)) && (!endDate || pedDate <= new Date(endDate))

        return matchesSearch && matchesDateRange
    })

    const totalOrders = pedidos.length
    const prepOrders = pedidos.filter(p => ["Preparación", "Pendiente"].includes(p.estado)).length
    const transitOrders = pedidos.filter(p => p.estado === "En Tránsito").length
    const deliveredOrders = pedidos.filter(p => p.estado === "Entregado").length

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Mis Compras</h1>
                    <p className="text-muted-foreground">Historial de tus compras realizadas</p>
                </div>
                <Button onClick={handleMarkAllRead} variant="outline" className="gap-2">
                    <CheckCheck className="w-4 h-4" />
                    Marcar todo como leído
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{totalOrders}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">En Preparación</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">{prepOrders}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-orange-600">{transitOrders}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Entregados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros de Búsqueda</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por producto, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="date"
                                placeholder="Fecha inicial"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="date"
                                placeholder="Fecha final"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Historial de Compras</CardTitle>
                    <CardDescription>Tus órdenes de compra recientes</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredPedidos.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No tienes compras registradas</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {filteredPedidos.map((ped) => (
                                <Link
                                    key={ped.fullId}
                                    href={`/dashboard/compras/${ped.fullId}`}
                                    onClick={() => handleOrderClick(ped.fullId, ped.is_read)}
                                >
                                    <div className={`group flex bg-background border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all duration-300 cursor-pointer ${!ped.is_read
                                        ? "bg-green-50/50 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                                        : "bg-card"
                                        }`}>
                                        <div className="relative w-32 md:w-40 flex-shrink-0 overflow-hidden bg-muted">
                                            <Image
                                                src={ped.image}
                                                alt={ped.producto}
                                                fill
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {!ped.is_read && (
                                                <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse z-10">
                                                    NUEVO
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 p-4 flex flex-col justify-between">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-2 mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                            {ped.producto}
                                                        </h3>
                                                        <Badge variant={getEstadoBadge(ped.estado)} className="whitespace-nowrap px-2 py-0.5 text-xs">
                                                            {ped.estado}
                                                        </Badge>
                                                    </div>
                                                    <p className={`text-xs font-mono mb-1 ${!ped.is_read ? "text-green-700 font-bold" : "text-muted-foreground"}`}>
                                                        #{ped.id}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">Vendedor: {ped.vendedor}</p>
                                                </div>
                                                <div className="text-right hidden md:block">
                                                    <p className="text-xl font-bold text-primary">{ped.total}</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-medium bg-muted/50 px-2 py-0.5 rounded text-xs text-foreground">{ped.cantidad}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-xs">{format(new Date(ped.fecha), "dd MMM yyyy", { locale: es })}</span>
                                                    </div>
                                                </div>

                                                <div className="md:hidden">
                                                    <p className="text-lg font-bold text-primary">{ped.total}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
