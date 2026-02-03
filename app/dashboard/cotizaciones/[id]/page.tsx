"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    MessageCircle,
    Mail,
    Calendar,
    Loader2,
    User,
    Globe,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Package,
    Phone,
    MapPin,
    Truck
} from "lucide-react"

interface QuotationDetail {
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

export default function QuotationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [quotation, setQuotation] = useState<QuotationDetail | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadQuotation = async () => {
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
                    const found = data.quotations.find((q: QuotationDetail) => q.id === id)
                    if (found) {
                        setQuotation(found)
                    } else {
                        setError("Cotización no encontrada")
                    }
                } else {
                    setError("Error al cargar la cotización")
                }
            } catch (error) {
                console.error("Error loading quotation:", error)
                setError("Error al cargar la cotización")
            } finally {
                setIsLoading(false)
            }
        }

        loadQuotation()
    }, [id, router])

    const updateStatus = async (newStatus: "accepted" | "rejected") => {
        if (!quotation) return

        setIsUpdating(true)
        try {
            const response = await fetch("/api/quotations/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quotationId: quotation.id,
                    status: newStatus
                })
            })

            const data = await response.json()
            if (data.success) {
                setQuotation({ ...quotation, status: newStatus })
            }
        } catch (error) {
            console.error("Error updating status:", error)
        } finally {
            setIsUpdating(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Cargando cotización...</p>
                </div>
            </div>
        )
    }

    if (error || !quotation) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <Card className="p-8 text-center max-w-md">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">{error || "Cotización no encontrada"}</h2>
                    <p className="text-muted-foreground mb-6">No pudimos encontrar la cotización que buscas.</p>
                    <Button onClick={() => router.push("/dashboard/cotizaciones")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a Cotizaciones
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/cotizaciones")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary" />
                            Detalle de Cotización
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Recibida el {formatDateTime(quotation.created_at)}
                        </p>
                    </div>
                    {quotation.status === "pending" && (
                        <Badge className="bg-yellow-500 text-white px-4 py-2">
                            <Clock className="w-4 h-4 mr-2" />
                            Pendiente
                        </Badge>
                    )}
                    {quotation.status === "accepted" && (
                        <Badge className="bg-green-600 text-white px-4 py-2">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aceptada
                        </Badge>
                    )}
                    {quotation.status === "rejected" && (
                        <Badge className="bg-red-600 text-white px-4 py-2">
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazada
                        </Badge>
                    )}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Product & Buyer */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Card */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Package className="w-5 h-5 text-primary" />
                                    Producto Solicitado
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-6">
                                    <div className="w-32 h-32 rounded-xl overflow-hidden border flex-shrink-0">
                                        <img
                                            src={quotation.product_image || "/placeholder.svg"}
                                            alt={quotation.product_title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold mb-3">{quotation.product_title}</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-primary/10 p-4 rounded-lg">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Cantidad Solicitada</p>
                                                <p className="text-2xl font-bold text-primary">{quotation.quantity.toLocaleString()} kg</p>
                                            </div>
                                            <div className="flex items-center">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => router.push(`/producto/${quotation.product_id}`)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Ver Producto
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Buyer Card */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="w-5 h-5 text-primary" />
                                    Información del Comprador
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Nombre</p>
                                                <p className="font-semibold">{quotation.buyer_name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            {quotation.contact_method === "WhatsApp" ? (
                                                <>
                                                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                                        <Phone className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">WhatsApp</p>
                                                        <p className="font-semibold">+{quotation.country_code} {quotation.phone_number}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                                        <Mail className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Email</p>
                                                        <p className="font-semibold">{quotation.email}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">País de Destino</p>
                                                <p className="font-semibold">{quotation.destination_country}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Truck className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className be="text-xs text-muted-foreground">Fecha Estimada de Entrega</p>
                                                <p className="font-semibold">{formatDate(quotation.estimated_date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes Card */}
                        {quotation.notes && (
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="w-5 h-5 text-primary" />
                                        Notas del Comprador
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                                        <p className="text-foreground whitespace-pre-wrap">{quotation.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Actions */}
                    <div className="space-y-6">
                        {/* Status Actions */}
                        {quotation.status === "pending" && (
                            <Card className="border-2 border-dashed border-primary/30">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg text-center">Responder Cotización</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        size="lg"
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={() => updateStatus("accepted")}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        ) : (
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                        )}
                                        Aceptar Cotización
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                        onClick={() => updateStatus("rejected")}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        ) : (
                                            <XCircle className="w-5 h-5 mr-2" />
                                        )}
                                        Rechazar
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Status Message */}
                        {quotation.status === "accepted" && (
                            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                                <CardContent className="pt-6 text-center">
                                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                    <h3 className="font-bold text-green-700 dark:text-green-300">Cotización Aceptada</h3>
                                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                        Contacta al comprador para continuar
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {quotation.status === "rejected" && (
                            <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                                <CardContent className="pt-6 text-center">
                                    <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                                    <h3 className="font-bold text-red-700 dark:text-red-300">Cotización Rechazada</h3>
                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                        Esta solicitud fue rechazada
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Actions */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg text-center">Contactar Comprador</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {quotation.contact_method === "WhatsApp" ? (
                                    <Button
                                        size="lg"
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={() => window.open(`https://api.whatsapp.com/send?phone=${quotation.country_code}${quotation.phone_number}&text=Hola ${quotation.buyer_name}, he recibido tu solicitud de cotización para ${quotation.product_title}.`, '_blank')}
                                    >
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Abrir WhatsApp
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        className="w-full"
                                        onClick={() => window.open(`mailto:${quotation.email}?subject=Cotización: ${quotation.product_title}&body=Hola ${quotation.buyer_name},%0A%0AHe recibido tu solicitud de cotización para ${quotation.product_title}.`, '_blank')}
                                    >
                                        <Mail className="w-5 h-5 mr-2" />
                                        Enviar Email
                                    </Button>
                                )}
                                <p className="text-xs text-muted-foreground text-center mt-3">
                                    Se abrirá {quotation.contact_method === "WhatsApp" ? "WhatsApp" : "tu cliente de correo"} con un mensaje pre-redactado
                                </p>
                            </CardContent>
                        </Card>

                        {/* Quick Info */}
                        <Card className="bg-muted/30">
                            <CardContent className="pt-6">
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">ID Cotización</span>
                                        <span className="font-mono text-xs">{quotation.id.slice(0, 8)}...</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Recibida</span>
                                        <span>{formatDate(quotation.created_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Método de contacto</span>
                                        <span>{quotation.contact_method}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
