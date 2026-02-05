"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Printer, Loader, Eye } from "lucide-react"
import { allProducts } from "@/lib/products-data"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useDashboard } from "../../context"

export default function VentaDetailPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params?.id as string

    const [pedido, setPedido] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)
    const { refreshCounts } = useDashboard()

    useEffect(() => {
        if (!orderId) return

        const fetchOrderDetails = async () => {
            try {
                // Using seller API for ventas detail
                const response = await fetch(`/api/user/orders/${orderId}`)
                if (response.ok) {
                    const data = await response.json()
                    const order = data.order

                    const taxRate = 0.15
                    const subtotal = order.price_usd / (1 + taxRate)
                    const imp = order.price_usd - subtotal

                    setPedido({
                        id: order.id,
                        displayId: order.id.slice(0, 8).toUpperCase(),
                        producto: order.product_name,
                        slug: order.product_slug,
                        image: order.product_image,
                        cliente: order.full_name,
                        cantidad: `${order.quantity_kg} kg`,
                        estado: order.status || "Preparación",
                        fecha: format(new Date(order.created_at), "dd 'de' MMMM, yyyy", { locale: es }),
                        total: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.price_usd),
                        location: order.country,
                        shippingMethod: order.shipping_method,
                        full_name: order.full_name,
                        email: order.email,
                        country_code: order.country_code,
                        phone_number: order.phone_number,
                        address: order.address,
                        city: order.city,
                        state: order.state,
                        zip_code: order.zip_code,
                        country: order.country,
                        payment_method: order.payment_method,
                        special_instructions: order.special_instructions,
                        incoterm: order.incoterm,
                        detalles: {
                            precioUnitario: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.unit_price || (order.price_usd / (order.quantity_kg || 1))),
                            subtotal: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subtotal),
                            impuesto: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(imp),
                            envio: "Por calcular / Incluido",
                            totalFinal: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.price_usd || 0),
                        },
                        tracking: [
                            {
                                fecha: format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: es }),
                                estado: "Orden Recibida",
                                ubicacion: "Sistema Agrilpa"
                            }
                        ],
                    })

                    fetch("/api/user/orders/mark-read", {
                        method: "POST",
                        body: JSON.stringify({ ids: [orderId] }),
                    }).then(() => refreshCounts())
                } else {
                    setError(true)
                }
            } catch (err) {
                console.error("Error fetching order:", err)
                setError(true)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrderDetails()
    }, [orderId])

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

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case "Preparación":
            case "Pendiente":
                return "bg-blue-100 text-blue-800"
            case "En Tránsito":
                return "bg-orange-100 text-orange-800"
            case "Entregado":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !pedido) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Venta no encontrada</h1>
                        <p className="text-muted-foreground mt-2">No pudimos encontrar los detalles de esta venta.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <p className="text-sm text-muted-foreground">Detalles de la Venta</p>
                        <h1 className="text-3xl font-bold">#{pedido.displayId}</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Descargar
                    </Button>
                    <Button variant="outline" size="sm">
                        <Printer className="w-4 h-4 mr-2" />
                        Imprimir
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Producto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-6">
                                <div className="relative w-40 h-40 rounded-lg overflow-hidden bg-muted">
                                    <Image
                                        src={pedido.image || getProductImage(pedido.producto, pedido.slug)}
                                        alt={pedido.producto}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-bold">{pedido.producto}</h2>
                                        <p className="text-muted-foreground">{pedido.cantidad}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p>
                                            <span className="font-semibold">Fecha de Orden:</span> {pedido.fecha}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">Estado:</span>
                                            <Badge className={getEstadoColor(pedido.estado)}>{pedido.estado}</Badge>
                                        </div>
                                        <div className="pt-2">
                                            <Link href={`/producto/${pedido.slug}`}>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Eye className="w-4 h-4" />
                                                    Ver Producto
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Datos del Comprador</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Nombre Completo</p>
                                    <p>{pedido.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Correo Electrónico</p>
                                    <p>{pedido.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Teléfono</p>
                                    <p>+{pedido.country_code} {pedido.phone_number}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Dirección de Envío</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Dirección</p>
                                    <p>{pedido.address}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Ciudad / Estado</p>
                                    <p>{pedido.city}, {pedido.state}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">País / Código Postal</p>
                                    <p>{pedido.country} — {pedido.zip_code}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Detalles de Pago y Entrega</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Método de Pago</p>
                                    <p className="capitalize">
                                        {pedido.payment_method === 'transferencia' ? 'Transferencia Bancaria' :
                                            pedido.payment_method === 'carta-credito' ? 'Carta de Crédito' :
                                                pedido.payment_method?.replace('-', ' ') || 'No especificado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">Método de Envío</p>
                                    <p className="capitalize">{pedido.shippingMethod === 'avion' ? 'Aéreo (Avión)' : pedido.shippingMethod === 'barco' ? 'Marítimo (Barco)' : pedido.shippingMethod || 'Por definir'}</p>
                                </div>
                                {pedido.incoterm && (
                                    <div>
                                        <p className="text-sm font-semibold text-muted-foreground">Incoterm</p>
                                        <p className="font-medium text-primary">{pedido.incoterm}</p>
                                    </div>
                                )}
                            </div>
                            {pedido.special_instructions && (
                                <div className="pt-4 border-t">
                                    <p className="text-sm font-semibold text-muted-foreground mb-1">Instrucciones Especiales</p>
                                    <p className="text-sm italic text-gray-600 bg-muted/50 p-3 rounded-md">"{pedido.special_instructions}"</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Historial de Rastreo</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {pedido.tracking.map((item: any, index: number) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-4 h-4 rounded-full ${index === 0 ? "bg-green-500" : "bg-gray-300"}`} />
                                            {index < pedido.tracking.length - 1 && <div className="w-1 h-12 bg-gray-300 my-1" />}
                                        </div>
                                        <div className="pb-4">
                                            <p className="font-semibold">{item.estado}</p>
                                            <p className="text-sm text-muted-foreground">{item.fecha}</p>
                                            <p className="text-sm text-muted-foreground">{item.ubicacion}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Resumen de Costos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Precio Unitario Promedio:</span>
                                    <span className="font-medium">{pedido.detalles.precioUnitario}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-medium">{pedido.detalles.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Impuestos (Estimado):</span>
                                    <span className="font-medium">{pedido.detalles.impuesto}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Envío:</span>
                                    <span className="font-medium">{pedido.detalles.envio}</span>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between">
                                    <span className="font-semibold">Total:</span>
                                    <span className="text-2xl font-bold text-primary">{pedido.detalles.totalFinal}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
