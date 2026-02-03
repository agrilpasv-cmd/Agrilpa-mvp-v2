"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search, Calendar, Package, Check, CalendarIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { allProducts } from "@/lib/products-data"

export default function LogisticaPage() {
  const [envios] = useState([
    {
      id: "ENV-001",
      pedido: "PED-001",
      destino: "Bogotá, Colombia",
      proveedor: "DHL Express",
      estado: "Entregado",
      fecha: "2024-11-05",
      rastreo: "1234567890",
    },
    {
      id: "ENV-002",
      pedido: "PED-002",
      destino: "Medellín, Colombia",
      proveedor: "FedEx",
      estado: "En Tránsito",
      fecha: "2024-11-10",
      rastreo: "9876543210",
    },
    {
      id: "ENV-003",
      pedido: "PED-003",
      destino: "Cali, Colombia",
      proveedor: "Coordinadora",
      estado: "Preparación",
      fecha: "2024-11-12",
      rastreo: "5555555555",
    },
  ])

  const [shipments] = useState([
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
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedShipment, setSelectedShipment] = useState(shipments[0])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      Preparación: "default",
      "En Tránsito": "secondary",
      Entregado: "secondary",
    }
    return variants[estado] || "default"
  }

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

  const filteredEnvios = envios.filter((env) => {
    const matchesSearch =
      env.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.rastreo.toLowerCase().includes(searchTerm.toLowerCase())

    const envDate = new Date(env.fecha)
    const matchesDateRange =
      (!startDate || envDate >= new Date(startDate)) && (!endDate || envDate <= new Date(endDate))

    return matchesSearch && matchesDateRange
  })

  const filteredShipments = shipments.filter((ship) => {
    const matchesSearch =
      ship.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ship.product.toLowerCase().includes(searchTerm.toLowerCase())

    const shipDate = new Date(ship.createdAt)
    const matchesDateRange =
      (!startDate || shipDate >= new Date(startDate)) && (!endDate || shipDate <= new Date(endDate))

    return matchesSearch && matchesDateRange
  })

  const getProductImage = (productName: string) => {
    const product = allProducts.find(
      (p) =>
        productName.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(productName.toLowerCase()),
    )
    return product || null
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Logística</h1>
        <p className="text-muted-foreground">Rastreo y gestión de envíos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Envíos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{envios.length + shipments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {envios.filter((env) => env.estado === "En Tránsito").length +
                shipments.filter((s) => s.status === "En Tránsito").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Entregados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {envios.filter((env) => env.estado === "Entregado").length +
                shipments.filter((s) => s.status === "Entregado").length}
            </p>
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
                placeholder="Buscar por destino, proveedor, ID..."
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments List */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            {filteredShipments.length > 0 ? (
              filteredShipments.map((shipment) => {
                const product = getProductImage(shipment.product)
                return (
                  <Card
                    key={shipment.id}
                    className={`p-0 cursor-pointer transition-all hover:shadow-md overflow-hidden ${
                      selectedShipment?.id === shipment.id ? "border-primary border-2" : "hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedShipment(shipment)}
                  >
                    {product && (
                      <>
                        <div className="relative h-32 bg-muted overflow-hidden">
                          <Link href={`/producto/${product.slug}`} onClick={(e) => e.stopPropagation()}>
                            <Image
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover hover:scale-110 transition-transform cursor-pointer"
                            />
                          </Link>
                        </div>
                        <div className="p-4">
                          <p className="font-semibold text-sm mb-2">{shipment.product}</p>
                          <div className="space-y-1 text-xs text-muted-foreground mb-3">
                            <p>
                              <span className="font-semibold text-foreground">${product.price}</span> por unidad
                            </p>
                            <p>
                              Volumen mínimo: <span className="font-semibold text-foreground">{product.minOrder}</span>
                            </p>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-muted-foreground">{shipment.trackingNumber}</p>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(shipment.status)}`}
                            >
                              {shipment.status}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                    {!product && (
                      <div className="p-4">
                        <p className="font-semibold text-sm mb-2">{shipment.product}</p>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-muted-foreground">{shipment.trackingNumber}</p>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(shipment.status)}`}
                          >
                            {shipment.status}
                          </span>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })
            ) : (
              <Card className="p-8 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2 opacity-50" />
                <p className="text-muted-foreground">No se encontraron envíos</p>
              </Card>
            )}
          </div>
        </div>

        {/* Shipment Details */}
        <div className="lg:col-span-2">
          {selectedShipment ? (
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">{selectedShipment.product}</h2>
                    <p className="text-muted-foreground">#{selectedShipment.trackingNumber}</p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded ${getStatusColor(selectedShipment.status)}`}>
                    {selectedShipment.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Origen</p>
                    <p className="text-sm font-semibold text-foreground">{selectedShipment.from}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Destino</p>
                    <p className="text-sm font-semibold text-foreground">{selectedShipment.to}</p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Ubicación Actual</p>
                      <p className="font-semibold text-foreground">{selectedShipment.currentLocation}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-border">
                  <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Entrega Estimada</p>
                    <p className="font-semibold text-foreground">
                      {new Date(selectedShipment.estimatedDelivery).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <Link href={`/dashboard/logistica/${selectedShipment.id}`}>
                    <Button className="w-full">Ver Pedido</Button>
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-4">Historial de Seguimiento</h3>
                <div className="space-y-4">
                  {selectedShipment.events.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                        {index < selectedShipment.events.length - 1 && <div className="w-0.5 h-12 bg-border mt-2" />}
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
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-30" />
              <p className="text-lg text-muted-foreground">Selecciona un envío para ver los detalles</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
