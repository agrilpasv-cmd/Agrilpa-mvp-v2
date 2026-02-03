"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Package,
    Search,
    Loader2,
    Mail,
    Phone,
    CheckCircle,
    Clock,
    Truck,
    MapPin,
    Calendar,
    AlertCircle
} from "lucide-react"
import Link from "next/link"

interface Order {
    id: string
    product_id: string
    product_title: string
    product_image: string
    seller_id: string
    buyer_name: string
    buyer_email: string
    buyer_phone: string
    quantity: number
    destination_country: string
    estimated_date: string
    notes: string
    status: string
    created_at: string
}

export default function MisPedidosPage() {
    const [searchMethod, setSearchMethod] = useState<"email" | "phone">("email")
    const [searchValue, setSearchValue] = useState("")
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSearch = async () => {
        if (!searchValue.trim()) return

        setIsLoading(true)
        setError(null)
        setHasSearched(true)

        try {
            const param = searchMethod === "email" ? `email=${encodeURIComponent(searchValue)}` : `phone=${encodeURIComponent(searchValue)}`
            const response = await fetch(`/api/orders/get-buyer-orders?${param}`)
            const data = await response.json()

            if (data.success) {
                setOrders(data.orders || [])
            } else {
                setError(data.error || "Error al buscar pedidos")
            }
        } catch (err) {
            console.error("Error:", err)
            setError("Error al conectar con el servidor")
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "confirmed":
                return { label: "Confirmado", color: "bg-green-500", icon: CheckCircle }
            case "processing":
                return { label: "En Proceso", color: "bg-blue-500", icon: Clock }
            case "shipped":
                return { label: "Enviado", color: "bg-purple-500", icon: Truck }
            case "delivered":
                return { label: "Entregado", color: "bg-green-600", icon: Package }
            default:
                return { label: status, color: "bg-gray-500", icon: Clock }
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-primary text-primary-foreground py-12">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <Package className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">Mis Pedidos</h1>
                    <p className="text-primary-foreground/80">
                        Consulta el estado de tus pedidos usando tu email o teléfono
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
                {/* Search Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Buscar Mis Pedidos</CardTitle>
                        <CardDescription>
                            Ingresa el email o teléfono que usaste para solicitar la cotización
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Button
                                variant={searchMethod === "email" ? "default" : "outline"}
                                onClick={() => setSearchMethod("email")}
                                className="flex-1"
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Email
                            </Button>
                            <Button
                                variant={searchMethod === "phone" ? "default" : "outline"}
                                onClick={() => setSearchMethod("phone")}
                                className="flex-1"
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Teléfono
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                type={searchMethod === "email" ? "email" : "tel"}
                                placeholder={searchMethod === "email" ? "tu@email.com" : "+503 7777 7777"}
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="flex-1"
                            />
                            <Button onClick={handleSearch} disabled={isLoading || !searchValue.trim()}>
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Error Message */}
                {error && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-950">
                        <CardContent className="pt-6 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <p className="text-red-700 dark:text-red-300">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Results */}
                {hasSearched && !isLoading && !error && (
                    <>
                        {orders.length === 0 ? (
                            <Card className="py-12">
                                <div className="text-center">
                                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">No se encontraron pedidos</h3>
                                    <p className="text-muted-foreground">
                                        No hay pedidos asociados a este {searchMethod === "email" ? "email" : "teléfono"}
                                    </p>
                                </div>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">
                                    {orders.length} {orders.length === 1 ? "Pedido Encontrado" : "Pedidos Encontrados"}
                                </h2>

                                {orders.map((order) => {
                                    const statusInfo = getStatusInfo(order.status)
                                    const StatusIcon = statusInfo.icon

                                    return (
                                        <Card key={order.id} className="overflow-hidden">
                                            <div className="flex">
                                                {/* Product Image */}
                                                <div className="w-32 h-32 flex-shrink-0">
                                                    <img
                                                        src={order.product_image || "/placeholder.svg"}
                                                        alt={order.product_title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="font-bold text-lg">{order.product_title}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                Pedido confirmado el {formatDate(order.created_at)}
                                                            </p>
                                                        </div>
                                                        <Badge className={`${statusInfo.color} text-white`}>
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Package className="w-4 h-4 text-primary" />
                                                            <span className="font-semibold">{order.quantity.toLocaleString()} kg</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                                            <span>{order.destination_country}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            <span>Entrega: {formatDate(order.estimated_date)}</span>
                                                        </div>
                                                    </div>

                                                    {order.notes && (
                                                        <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                                                            <span className="text-muted-foreground">Notas: </span>
                                                            {order.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* Help Text */}
                <div className="text-center text-sm text-muted-foreground pt-8">
                    <p>¿Necesitas ayuda? <Link href="/contacto" className="text-primary underline">Contáctanos</Link></p>
                </div>
            </div>
        </div>
    )
}
