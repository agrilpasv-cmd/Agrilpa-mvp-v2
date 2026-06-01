"use client"

import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Package, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { allProducts } from "@/lib/products-data"

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string

  // Mock data - en una app real esto vendría de una BD
  const shipments = [
    {
      id: "1",
      trackingNumber: "AGR-2024-001",
      product: "Tomates Frescos Orgánicos",
      from: "Colombia",
      to: "México",
      status: "En Tránsito",
      currentLocation: "Panamá - Centro de Distribución",
      createdAt: "2024-01-10",
      estimatedDelivery: "2024-01-18",
      quantity: 50,
      unitPrice: 2.5,
      events: [
        {
          date: "2024-01-10",
          time: "08:00",
          status: "Preparación completada",
          location: "Colombia - Bodega de origen",
        },
        { date: "2024-01-12", time: "14:30", status: "En tránsito", location: "Colombia - Puente Aéreo" },
        { date: "2024-01-13", time: "09:15", status: "En aduana", location: "Panamá - Oficina de Aduanas" },
        {
          date: "2024-01-14",
          time: "16:45",
          status: "Despacho completado",
          location: "Panamá - Centro de Distribución",
        },
      ],
    },
    {
      id: "2",
      trackingNumber: "AGR-2024-002",
      product: "Café Premium Arábica",
      from: "Perú",
      to: "Estados Unidos",
      status: "Entregado",
      currentLocation: "Nueva York - Centro de Distribución",
      createdAt: "2024-01-05",
      estimatedDelivery: "2024-01-15",
      quantity: 100,
      unitPrice: 8.5,
      events: [
        { date: "2024-01-05", time: "10:00", status: "Preparación completada", location: "Perú - Bodega de origen" },
        { date: "2024-01-07", time: "12:30", status: "En tránsito", location: "Perú - Puente Aéreo" },
        { date: "2024-01-09", time: "08:00", status: "Llegada a destino", location: "Estados Unidos - Aduana" },
        { date: "2024-01-15", time: "14:00", status: "Entregado", location: "Nueva York - Centro de Distribución" },
      ],
    },
  ]

  const shipment = shipments.find((s) => s.id === orderId)

  if (!shipment) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <Link href="/dashboard/logistica">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Logística
            </Button>
          </Link>
        </div>
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-30" />
          <p className="text-lg text-muted-foreground">Pedido no encontrado</p>
        </Card>
      </div>
    )
  }

  const product = allProducts.find(
    (p) =>
      shipment.product.toLowerCase().includes(p.name.toLowerCase()) ||
      p.name.toLowerCase().includes(shipment.product.toLowerCase()),
  )

  const subtotal = shipment.quantity * shipment.unitPrice
  const tax = subtotal * 0.12 // 12% tax
  const shipping = 50 // Fixed shipping cost
  const total = subtotal + tax + shipping

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Preparación":
        return "bg-yellow-100 text-yellow-800"
      case "En Tránsito":
        return "bg-blue-100 text-blue-800"
      case "En Aduana":
        return "bg-orange-100 text-orange-800"
      case "Entregado":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link href="/dashboard/logistica">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Logística
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Detalles del Pedido</h1>
        <p className="text-muted-foreground">#{shipment.trackingNumber}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {product && (
                  <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{shipment.product}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Precio unitario: <span className="font-semibold text-foreground">${shipment.unitPrice}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: <span className="font-semibold text-foreground">{shipment.quantity} unidades</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipment Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Estado Actual</p>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded inline-block ${getStatusColor(shipment.status)}`}
                  >
                    {shipment.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Ubicación</p>
                  <p className="font-semibold text-foreground text-sm">{shipment.currentLocation}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Entrega Estimada</p>
                <p className="font-semibold text-foreground">
                  {new Date(shipment.estimatedDelivery).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tracking History */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Rastreo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipment.events.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                      {index < shipment.events.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold text-foreground text-sm">{event.status}</p>
                      <p className="text-xs text-muted-foreground mb-1">{event.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.date} - {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumen de Costos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Subtotal ({shipment.quantity} × ${shipment.unitPrice})
                  </span>
                  <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Impuestos (12%)</span>
                  <span className="font-semibold text-foreground">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Envío</span>
                  <span className="font-semibold text-foreground">${shipping.toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
