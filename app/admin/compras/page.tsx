"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Purchase {
  id: string
  full_name: string
  email: string
  product_name: string
  quantity_kg: number
  price_usd: number
  address: string
  city: string
  state: string
  country: string
  created_at: string
  user_id: string
}

export default function ComprasPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    totalRevenue: 0,
    totalQuantity: 0,
  })

  const fetchData = async () => {
    try {
      const { createBrowserClient } = await import("@/lib/supabase/client")
      const supabase = createBrowserClient()

      const { data, error } = await supabase.from("purchases").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setPurchases(data || [])

      // Calculate stats
      const total = data?.length || 0
      const totalRevenue = data?.reduce((sum, p) => sum + (p.price_usd || 0), 0) || 0
      const totalQuantity = data?.reduce((sum, p) => sum + (p.quantity_kg || 0), 0) || 0

      setStats({ total, totalRevenue, totalQuantity })
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching purchases:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compras</h1>
        <p className="text-muted-foreground">Información de todas las compras registradas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cantidad Total (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuantity.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras</CardTitle>
          <CardDescription>Todos los detalles de las compras realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Cargando datos...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad (kg)</TableHead>
                  <TableHead>Precio USD</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{purchase.full_name}</TableCell>
                    <TableCell className="text-sm">{purchase.email}</TableCell>
                    <TableCell>{purchase.product_name}</TableCell>
                    <TableCell>{purchase.quantity_kg}</TableCell>
                    <TableCell>${purchase.price_usd}</TableCell>
                    <TableCell>{purchase.city}</TableCell>
                    <TableCell className="text-sm">{new Date(purchase.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
