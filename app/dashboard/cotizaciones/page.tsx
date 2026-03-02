"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  MessageCircle,
  Mail,
  Calendar,
  MapPin,
  ChevronRight,
  Search,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  Loader2,
  XCircle,
  Package
} from "lucide-react"

interface Quotation {
  id: string
  product_title: string
  product_image: string
  buyer_name: string
  quantity: number
  contact_method: string
  country_code: string
  phone_number: string
  email: string
  destination_country: string
  estimated_date: string
  notes: string
  status: string
  created_at: string
}

export default function CotizacionesPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const fetchQuotations = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      try {
        const response = await fetch(`/api/quotations/get-seller-quotations?sellerId=${user.id}`)
        const data = await response.json()

        if (data.success) {
          setQuotations(data.quotations)
        } else {
          setError("Error al cargar las cotizaciones")
        }
      } catch (error) {
        console.error("Error fetching quotations:", error)
        setError("Error de conexión")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuotations()
  }, [router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-400 hover:bg-amber-500 text-white border-0 px-3 py-0.5 rounded-md font-medium">Pendiente</Badge>
      case "accepted":
        return <Badge className="bg-green-600 hover:bg-green-700 text-white border-0 px-3 py-0.5 rounded-md font-medium">Aceptada</Badge>
      case "rejected":
        return <Badge className="bg-red-600 hover:bg-red-700 text-white border-0 px-3 py-0.5 rounded-md font-medium">Rechazada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch =
      q.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.buyer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.destination_country.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || q.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Calculate stats from real data
  const totalQuotations = quotations.length
  const pendingQuotations = quotations.filter((q) => q.status === "pending").length
  const acceptedQuotations = quotations.filter((q) => q.status === "accepted").length
  const rejectedQuotations = quotations.filter((q) => q.status === "rejected").length

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando cotizaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold">Algo salió mal</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Cotizaciones Recibidas
          </h1>
          <p className="text-muted-foreground mt-1">
            Solicitudes de cotización de compradores interesados
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total</p>
                <p className="text-3xl font-bold mt-1">{totalQuotations}</p>
                <p className="text-xs text-muted-foreground mt-1">cotizaciones</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingQuotations}</p>
                <p className="text-xs text-muted-foreground mt-1">por responder</p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Aceptadas</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{acceptedQuotations}</p>
                <p className="text-xs text-muted-foreground mt-1">negocios activos</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Rechazadas</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{rejectedQuotations}</p>
                <p className="text-xs text-muted-foreground mt-1">descartadas</p>
              </div>
              <div className="bg-red-500/10 p-3 rounded-xl">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por producto, comprador o destino..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
              >
                Todas
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
              >
                Pendientes
              </Button>
              <Button
                variant={filterStatus === "accepted" ? "default" : "outline"}
                onClick={() => setFilterStatus("accepted")}
              >
                Aceptadas
              </Button>
              <Button
                variant={filterStatus === "rejected" ? "default" : "outline"}
                onClick={() => setFilterStatus("rejected")}
              >
                Rechazadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quotations List */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Cotizaciones</CardTitle>
          <CardDescription>Solicitudes de compradores interesados en tus productos</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredQuotations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No hay cotizaciones encontradas</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterStatus !== "all"
                  ? "Intenta ajustar tus filtros de búsqueda."
                  : "Aún no has recibibo ninguna solicitud de cotización."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              {/* Table header */}
              <div className="min-w-[700px]">
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-0 px-6 pb-2 border-b border-border">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Producto</span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Comprador</span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Destino / Fecha</span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">Estado</span>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-right pr-1">Acciones</span>
                </div>

                {/* Table rows */}
                {filteredQuotations.map((quotation, idx) => {
                  const statusMeta =
                    quotation.status === "accepted"
                      ? { label: "Aceptada", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" }
                      : quotation.status === "rejected"
                        ? { label: "Rechazada", cls: "bg-red-100 text-red-800 border-red-300" }
                        : { label: "Pendiente", cls: "bg-amber-100 text-amber-800 border-amber-300" }

                  return (
                    <div
                      key={quotation.id}
                      onClick={() => router.push(`/dashboard/cotizaciones/${quotation.id}`)}
                      className={`group grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-0 items-center px-6 py-6 cursor-pointer transition-colors border-b border-border/50 hover:bg-primary/5 ${idx % 2 === 0 ? "bg-white" : "bg-muted/20"}`}
                    >
                      {/* Product column */}
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-muted border border-border flex-shrink-0">
                          {quotation.product_image && quotation.product_image !== "/placeholder.svg" ? (
                            <img src={quotation.product_image} alt={quotation.product_title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-7 h-7 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">{quotation.product_title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{quotation.quantity} kg</p>
                        </div>
                      </div>

                      {/* Buyer column */}
                      <div className="min-w-0 pr-4">
                        <p className="text-base font-semibold text-foreground truncate">{quotation.buyer_name}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                          {quotation.contact_method === "WhatsApp"
                            ? <><MessageCircle className="w-3 h-3 flex-shrink-0" /><span className="truncate">+{quotation.country_code} {quotation.phone_number}</span></>
                            : <><Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{quotation.email}</span></>
                          }
                        </div>
                      </div>

                      {/* Destination/date column */}
                      <div className="pr-4">
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{quotation.destination_country}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{formatDate(quotation.estimated_date)}</span>
                        </div>
                      </div>

                      {/* Status column */}
                      <div>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${statusMeta.cls}`}>
                          {statusMeta.label}
                        </span>
                      </div>

                      {/* Actions column */}
                      <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                        {quotation.contact_method === "WhatsApp" ? (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-10 w-10 p-0 rounded-xl"
                            title="Abrir WhatsApp"
                            onClick={() => window.open(`https://api.whatsapp.com/send?phone=${quotation.country_code}${quotation.phone_number}&text=Hola ${quotation.buyer_name}, he recibido tu solicitud.`, "_blank")}
                          >
                            <MessageCircle className="w-5 h-5" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white h-10 w-10 p-0 rounded-xl"
                            title="Enviar correo"
                            onClick={() => window.open(`mailto:${quotation.email}?subject=Respuesta a Cotización&body=Hola ${quotation.buyer_name}...`, "_blank")}
                          >
                            <Mail className="w-5 h-5" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl"
                          title="Ver detalles"
                          onClick={() => router.push(`/dashboard/cotizaciones/${quotation.id}`)}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
