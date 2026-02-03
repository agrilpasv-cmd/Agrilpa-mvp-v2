"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface LogisticsClick {
  id: string
  email: string
  clicked_at: string
  user_id: string
  user_agent: string
  ip_address: string
}

export default function LogisticaPage() {
  const [clicks, setClicks] = useState<LogisticsClick[]>([])
  const [loading, setLoading] = useState(true)
  const [totalClicks, setTotalClicks] = useState(0)

  const fetchData = async () => {
    try {
      const { createBrowserClient } = await import("@/lib/supabase/client")
      const supabase = createBrowserClient()

      const { data, error } = await supabase
        .from("logistics_quote_clicks")
        .select("*")
        .order("clicked_at", { ascending: false })

      if (error) throw error

      setClicks(data || [])
      setTotalClicks(data?.length || 0)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Error fetching logistics clicks:", error)
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
        <h1 className="text-3xl font-bold">Logística</h1>
        <p className="text-muted-foreground">Seguimiento de clicks en "Solicitar Cotización"</p>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total de Clicks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalClicks}</div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Solicitudes de Cotización</CardTitle>
          <CardDescription>Todos los clicks registrados en solicitar cotización logística</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Cargando datos...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>ID de Usuario</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clicks.map((click) => (
                  <TableRow key={click.id}>
                    <TableCell>{click.email || "No registrado"}</TableCell>
                    <TableCell>{new Date(click.clicked_at).toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{click.user_id || "Anónimo"}</TableCell>
                    <TableCell className="text-xs">{click.ip_address || "N/A"}</TableCell>
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
