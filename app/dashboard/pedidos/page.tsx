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

export default function PedidosPage() {
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
        // Optionally update local state if we were tracking is_read per item
        alert("Todos los pedidos marcados como leídos")
      }
    } catch (e) {
      console.error("Error marking read", e)
    }
  }

  useEffect(() => {
    // ... fetch implementation ...
    // Note: If we wanted to show visual 'unread' dot on items, we'd need to fetch is_read too.
    // For now keeping it simple as requested.
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/user/orders", { cache: 'no-store' })
        if (response.ok) {
          const data = await response.json()
          // Transform DB data to UI format
          const formattedOrders = (data.orders || []).map((order: any) => ({
            id: order.id.slice(0, 8).toUpperCase(), // Short ID for display
            fullId: order.id,
            producto: order.product_name,
            cliente: order.full_name, // Or produce logic if we had seller info
            cantidad: `${order.quantity_kg} kg`,
            estado: order.status || "Preparación", // Default status if null
            fecha: order.created_at,
            total: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.price_usd),
            image: order.product_image || getProductImage(order.product_name, order.product_slug),
            slug: order.product_slug,
            is_read: order.is_read ?? true // Default to true (read) if missing to avoid noise, OR false if we want strictly unread.
            // Database has default false. So if migration ran, it is false.
            // Let's rely on DB value.
          }))
          // Sort unread first? Might be nice, but user didn't ask.
          // Check for duplicate IDs which would cause the "select all" bug
          const idCounts: Record<string, number> = {}
          formattedOrders.forEach((o: any) => {
            idCounts[o.fullId] = (idCounts[o.fullId] || 0) + 1
          })
          const duplicates = Object.entries(idCounts).filter(([_, count]) => count > 1)
          if (duplicates.length > 0) {
            console.error("[CRITICAL] Duplicate IDs found in orders:", duplicates)
            // Fallback: Generate unique temp IDs if real ones collide (for UI only)
            formattedOrders.forEach((o: any, idx: number) => {
              if (idCounts[o.fullId] > 1) {
                o.fullId = `${o.fullId}_dup_${idx}`
              }
            })
          }

          setPedidos(formattedOrders)
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

    // Optimistically update UI
    setPedidos(prev => prev.map(p => p.fullId === id ? { ...p, is_read: true } : p))

    // Update global counter
    refreshCounts()

    // Notify backend
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
    // Try to find by slug first if available
    if (slug) {
      const productBySlug = allProducts.find(p => String(p.id) === slug)
      if (productBySlug) return productBySlug.image
    }

    // Fallback to name match
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
      ped.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ped.id.toLowerCase().includes(searchTerm.toLowerCase())

    const pedDate = new Date(ped.fecha)
    const matchesDateRange =
      (!startDate || pedDate >= new Date(startDate)) && (!endDate || pedDate <= new Date(endDate))

    return matchesSearch && matchesDateRange
  })

  // Calculate stats
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
          <h1 className="text-3xl font-bold">Mis Pedidos</h1>
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
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
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
            <p className="text-2xl font-bold text-blue-600">
              {prepOrders}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">
              {transitOrders}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Entregados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {deliveredOrders}
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
          <CardTitle>Historial</CardTitle>
          <CardDescription>Lista de órdenes recientes</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPedidos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No tienes pedidos registrados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPedidos.map((ped) => (
                <Link
                  key={ped.fullId}
                  href={`/dashboard/pedidos/${ped.fullId}`}
                  onClick={() => handleOrderClick(ped.fullId, ped.is_read)}
                >
                  <div className={`border rounded-lg overflow-hidden transition-all cursor-pointer h-full ${!ped.is_read
                    ? "bg-green-50/50 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    : "bg-card hover:shadow-lg"
                    }`}>
                    {/* Product Image */}
                    <div className="relative w-full h-40 bg-muted overflow-hidden">
                      <Image
                        src={ped.image}
                        alt={ped.producto}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                      {!ped.is_read && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                          NUEVO
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-xs font-medium mb-1 ${!ped.is_read ? "text-green-700 font-bold" : "text-muted-foreground"}`}>
                            ID: {ped.id}
                          </p>
                          <p className="font-semibold text-foreground line-clamp-1 text-lg">{ped.producto}</p>
                        </div>
                        <Badge variant={getEstadoBadge(ped.estado)} className="whitespace-nowrap ml-2">
                          {ped.estado}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Cantidad:</span>
                        <span className="font-medium">{ped.cantidad}</span>
                      </div>

                      <div className="pt-3 border-t flex justify-between items-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha Compra</p>
                          <p className="text-sm font-medium">
                            {format(new Date(ped.fecha), "dd MMM yyyy", { locale: es })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total</p>
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
