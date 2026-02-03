"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  Loader2,
  ChevronRight,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Eye
} from "lucide-react"

interface Quotation {
  id: string
  product_id: string
  product_title: string
  product_image: string
  buyer_name: string
  contact_method: string
  country_code: string
  phone_number: string
  email: string
  quantity: number
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
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    const loadQuotations = async () => {
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
          setQuotations(data.quotations || [])
        }
      } catch (error) {
        console.error("Error loading quotations:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuotations()
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="default" className="bg-yellow-500">Pendiente</Badge>
      case "accepted":
        return <Badge variant="default" className="bg-green-600">Aceptada</Badge>
      case "rejected":
        return <Badge variant="destructive">Rechazada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.product_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.destination_country?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || q.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const totalQuotations = quotations.length
  const pendingQuotations = quotations.filter((q) => q.status === "pending").length
  const acceptedQuotations = quotations.filter((q) => q.status === "accepted").length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando cotizaciones...</p>
        </div>
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

      {/* Stats Cards - Nuevo diseño */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total</p>
                <p className="text-3xl font-bold mt-1">{totalQuotations}</p>
                <p className="text-xs text-muted-foreground mt-1">cotizaciones</p>
              </div>
              <div className="bg-primary/20 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{pendingQuotations}</p>
                <p className="text-xs text-muted-foreground mt-1">por responder</p>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Aceptadas</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{acceptedQuotations}</p>
                <p className="text-xs text-muted-foreground mt-1">negocios activos</p>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
                className={filterStatus === "pending" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                Pendientes
              </Button>
              <Button
                variant={filterStatus === "accepted" ? "default" : "outline"}
                onClick={() => setFilterStatus("accepted")}
                className={filterStatus === "accepted" ? "bg-green-500 hover:bg-green-600" : ""}
              >
                Aceptadas
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
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tienes cotizaciones</h3>
              <p className="text-muted-foreground">
                Cuando alguien solicite una cotización de tus productos, aparecerá aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuotations.map((quotation) => (
                <div
                  key={quotation.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 hover:border-primary/30 transition-all cursor-pointer"
                  onClick={() => router.push(`/dashboard/cotizaciones/${quotation.id}`)}
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Product Info */}
                    <div className="flex gap-4 lg:w-1/3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                        <img
                          src={quotation.product_image || "/placeholder.svg"}
                          alt={quotation.product_title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{quotation.product_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Cantidad: <span className="font-semibold text-primary">{quotation.quantity} kg</span>
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/producto/${quotation.product_id}`)
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver producto
                        </Button>
                      </div>
                    </div>

                    {/* Buyer Info */}
                    <div className="lg:w-1/3 space-y-1">
                      <p className="font-bold">{quotation.buyer_name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        {quotation.contact_method === "WhatsApp" ? (
                          <>
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            <span>+{quotation.country_code} {quotation.phone_number}</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span>{quotation.email}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{quotation.destination_country}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(quotation.estimated_date)}</span>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="lg:w-1/3">
                      <div className="flex items-center justify-between mb-3">
                        {getStatusBadge(quotation.status)}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(quotation.created_at)}
                        </span>
                      </div>

                      {quotation.notes && (
                        <div className="bg-muted/50 p-2 rounded-md mb-3 text-sm">
                          <p className="text-xs text-muted-foreground">Notas:</p>
                          <p className="line-clamp-2">{quotation.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {quotation.contact_method === "WhatsApp" ? (
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`https://api.whatsapp.com/send?phone=${quotation.country_code}${quotation.phone_number}`, '_blank')
                            }}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            WhatsApp
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`mailto:${quotation.email}`, '_blank')
                            }}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/cotizaciones/${quotation.id}`)
                          }}
                        >
                          Ver detalles
                          <ChevronRight className="w-4 h-4 ml-1" />
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
