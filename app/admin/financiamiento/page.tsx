"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FinancingClick {
  id: string
  financing_type: string
  clicked_at: string
  user_id: string
}

export default function FinanciamientoPage() {
  const [clicks, setClicks] = useState<FinancingClick[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    prendario: 0,
    leasing: 0,
    asociativo: 0,
  })

  const fetchData = async () => {
    try {
      const { createBrowserClient } = await import("@/lib/supabase/client")
      const supabase = createBrowserClient()

      const { data, error } = await supabase
        .from("financing_clicks")
        .select("*")
        .order("clicked_at", { ascending: false })

      if (error) throw error

      setClicks(data || [])

      // Calculate stats
      const total = data?.length || 0
      const prendario = data?.filter((c) => c.financing_type === "prendario").length || 0
      const leasing = data?.filter((c) => c.financing_type === "leasing").length || 0
      const asociativo = data?.filter((c) => c.financing_type === "asociativo").length || 0

      setStats({ total, prendario, leasing, asociativo })
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching financing clicks:", error)
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
        <h1 className="text-3xl font-bold">Financiamiento</h1>
        <p className="text-muted-foreground">Seguimiento de clicks en opciones de financiamiento</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Clicks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Crédito Prendario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.prendario}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leasing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leasing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Crédito Asociativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.asociativo}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Clicks</CardTitle>
          <CardDescription>Todos los clicks registrados en las opciones de financiamiento</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Cargando datos...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Financiamiento</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>ID de Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clicks.map((click) => (
                  <TableRow key={click.id}>
                    <TableCell className="capitalize">{click.financing_type}</TableCell>
                    <TableCell>{new Date(click.clicked_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{click.user_id || "Anónimo"}</TableCell>
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
