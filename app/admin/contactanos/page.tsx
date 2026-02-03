"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ContactSubmission {
  id: string
  name: string
  email: string
  phone: string
  company: string
  message: string
  user_type: string
  is_registered: boolean
  created_at: string
}

export default function ContactanosPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    unregistered: 0,
  })
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null)

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)

    try {
      const response = await fetch(`/api/admin/get-contact-submissions?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })
      const { data, error } = await response.json()

      if (error) throw error

      setSubmissions(data || [])
      setLastUpdate(new Date())

      const total = data?.length || 0
      const registered = data?.filter((s: ContactSubmission) => s.is_registered).length || 0
      const unregistered = total - registered

      setStats({ total, registered, unregistered })
    } catch (error) {
      console.error("[v0] Error fetching contact submissions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(true)
    const interval = setInterval(() => fetchData(false), 3000)
    return () => clearInterval(interval)
  }, [fetchData])

  const handleManualRefresh = () => {
    fetchData(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contáctanos</h1>
          <p className="text-muted-foreground">Información de los formularios de contacto recibidos</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Contactos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.registered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">No Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unregistered}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Contactos</CardTitle>
          <CardDescription>Todos los mensajes de contacto recibidos</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && submissions.length === 0 ? (
            <p className="text-muted-foreground">Cargando datos...</p>
          ) : submissions.length === 0 ? (
            <p className="text-muted-foreground">No hay contactos aún</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.name}</TableCell>
                    <TableCell className="text-sm">{submission.email}</TableCell>
                    <TableCell className="text-sm">{submission.phone}</TableCell>
                    <TableCell className="text-sm">{submission.company || "N/A"}</TableCell>
                    <TableCell className="capitalize text-sm">{submission.user_type}</TableCell>
                    <TableCell>{submission.is_registered ? "Sí" : "No"}</TableCell>
                    <TableCell className="text-sm">
                      <Button variant="outline" size="sm" onClick={() => setSelectedMessage(submission)}>
                        Ver Mensaje
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-96 overflow-y-auto">
            <CardHeader>
              <CardTitle>Mensaje Completo</CardTitle>
              <CardDescription>
                {selectedMessage.name} - {selectedMessage.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">De:</p>
                <p className="text-sm">
                  {selectedMessage.name} ({selectedMessage.email})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Empresa:</p>
                <p className="text-sm">{selectedMessage.company || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Teléfono:</p>
                <p className="text-sm">{selectedMessage.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Tipo de Usuario:</p>
                <p className="text-sm capitalize">{selectedMessage.user_type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Fecha:</p>
                <p className="text-sm">{new Date(selectedMessage.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Mensaje:</p>
                <p className="text-sm whitespace-pre-wrap break-words mt-2 bg-muted p-3 rounded">
                  {selectedMessage.message}
                </p>
              </div>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedMessage(null)}>
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
