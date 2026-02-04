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
            <div className="space-y-4">
              {filteredQuotations.map((quotation) => (
                <div
                  key={quotation.id}
                  onClick={() => router.push(`/dashboard/cotizaciones/${quotation.id}`)}
                  className="border rounded-xl p-6 bg-white shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Column 1: Product Info (4 cols) */}
                    <div className="lg:col-span-4 flex gap-4 border-r border-border/50 pr-4">
                      <div className="w-20 h-20 rounded-xl bg-gray-200 flex-shrink-0 overflow-hidden">
                        {quotation.product_image && quotation.product_image !== "/placeholder.svg" ? (
                          <img
                            src={quotation.product_image}
                            alt={quotation.product_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Package className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-0.5">
                        <div>
                          <h3 className="font-bold text-lg text-foreground line-clamp-1">{quotation.product_title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Cantidad: <span className="font-semibold text-green-600">{quotation.quantity} kg</span>
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/cotizaciones/${quotation.id}`)
                          }}
                          className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 transition-colors bg-transparent border-0 p-0 h-auto w-fit"
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          Ver producto
                        </button>
                      </div>
                    </div>

                    {/* Column 2: Buyer Info (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col justify-between border-r border-border/50 px-4">
                      <div>
                        <h4 className="font-bold text-foreground">{quotation.buyer_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          {quotation.contact_method === "WhatsApp" ? (
                            <MessageCircle className="w-4 h-4" />
                          ) : (
                            <Mail className="w-4 h-4" />
                          )}
                          <span>
                            {quotation.contact_method === "WhatsApp"
                              ? `+${quotation.country_code} ${quotation.phone_number}`
                              : quotation.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{quotation.destination_country}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(quotation.estimated_date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Status & Actions (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col justify-between pl-4">
                      <div className="flex justify-between items-start">
                        {getStatusBadge(quotation.status)}
                        <span className="text-xs text-muted-foreground font-medium">Recibido: {formatDate(quotation.created_at)}</span>
                      </div>

                      <div className="bg-muted/30 p-3 rounded-lg my-3">
                        <span className="text-xs font-semibold text-muted-foreground block mb-1">Notas:</span>
                        <p className="text-sm text-foreground/80 line-clamp-2">
                          {quotation.notes || "Sin notas adicionales."}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-auto">
                        {quotation.contact_method === "WhatsApp" ? (
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`https://api.whatsapp.com/send?phone=${quotation.country_code}${quotation.phone_number}&text=Hola ${quotation.buyer_name}, he recibido tu solicitud.`, '_blank')
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                        ) : (
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`mailto:${quotation.email}?subject=Respuesta a Cotización&body=Hola ${quotation.buyer_name}...`, '_blank')
                            }}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-foreground hover:bg-muted font-medium px-2"
                          onClick={(e) => {
                            // Redundant but good for explicit behavior
                            e.stopPropagation()
                            router.push(`/dashboard/cotizaciones/${quotation.id}`)
                          }}
                        >
                          Ver detalles <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
