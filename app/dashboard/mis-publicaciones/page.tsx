"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  Crown,
  PackageOpen,
  Globe,
  MessageSquare,
  TrendingUp,
  Pencil,
  MapPin,
  Package,
  Tag,
  BarChart2
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDashboard } from "../context"

interface Publication {
  id: string
  title: string
  category: string
  price: string
  currency?: string
  quantity: string
  description: string
  country: string
  min_order: string
  maturity?: string
  status?: "activa" | "pausada" | "vendida"
  created_at: string
  views?: number
  image?: string
  unit?: string
  price_type?: string
  min_order_quantity?: number
}

export default function MisPublicacionesPage() {
  const router = useRouter()
  const [publications, setPublications] = useState<Publication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

  const { refreshCounts } = useDashboard()
  const [publicationLimit, setPublicationLimit] = useState<number>(10)
  const [isPro, setIsPro] = useState(false)

  useEffect(() => {
    fetchMyProducts()
    fetch("/api/dashboard/dynamic-data")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.publicationLimit) setPublicationLimit(data.publicationLimit)
        if (data?.isPro) setIsPro(data.isPro)
      })
      .catch(() => { })
  }, [])

  const fetchMyProducts = async () => {
    try {
      const response = await fetch(`/api/products/get-my-products?t=${Date.now()}`, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setPublications(data.products || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    setProductToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    setIsDeleting(productToDelete)
    setDeleteDialogOpen(false)

    try {
      const response = await fetch("/api/products/delete-product", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productToDelete }),
      })

      if (response.ok) {
        setPublications((prev) => prev.filter((pub) => pub.id !== productToDelete))
        await refreshCounts()
        setNotification({ type: 'success', message: '¡Publicación eliminada correctamente!' })
        setTimeout(() => setNotification({ type: null, message: '' }), 4000)
      } else {
        const data = await response.json()
        setNotification({ type: 'error', message: data.error || 'Error al eliminar la publicación' })
        setTimeout(() => setNotification({ type: null, message: '' }), 5000)
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      setNotification({ type: 'error', message: 'Error inesperado al eliminar la publicación' })
      setTimeout(() => setNotification({ type: null, message: '' }), 5000)
    } finally {
      setIsDeleting(null)
      setProductToDelete(null)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "activa":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "pausada":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "vendida":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const publicacionesCount = publications.length

  return (
    <div className="space-y-6 p-6 w-full">

      {/* HEADER DE LA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Mis Publicaciones
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              Gestiona tus anuncios ({publicacionesCount}/{publicationLimit})
            </p>
            {isPro && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 font-bold text-[10px] px-2 py-0.5 flex items-center gap-1">
                <Crown className="w-3 h-3" /> PRO
              </Badge>
            )}
          </div>
        </div>

        {/* Solo mostramos este botón si YA TIENE publicaciones */}
        {publicacionesCount > 0 && (
          <Button onClick={() => router.push("/dashboard/mis-publicaciones/nueva")} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Nueva Publicación
          </Button>
        )}
      </div>

      {/* Notification Toast */}
      {notification.type && (
        <div
          className={`
            flex items-center gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-top-2 duration-300
            ${notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }
          `}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification({ type: null, message: '' })}
            className="ml-auto p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* RENDERIZADO CONDICIONAL: ESTADO VACÍO (EMPTY STATE) */}
      {publicacionesCount === 0 ? (
        <Card className="border-2 border-dashed border-border/60 bg-background shadow-sm flex flex-col items-center justify-center text-center py-16 md:py-24 px-4 rounded-2xl animate-in fade-in zoom-in-95 duration-500">

          {/* Icono Central con Halo */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="w-20 h-20 bg-background border border-border shadow-sm rounded-full flex items-center justify-center relative z-10">
              <PackageOpen className="w-10 h-10 text-primary" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Tu vitrina comercial está vacía
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm md:text-base">
            Crea el perfil de tu primer producto para que compradores mayoristas, distribuidores y supermercados puedan cotizar contigo.
          </p>

          <Button
            onClick={() => router.push("/dashboard/mis-publicaciones/nueva")}
            className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" /> Crear mi primera publicación
          </Button>

          {/* Micro-educación (Guía rápida B2B) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto text-left">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm">Alcance Global</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Publica especificaciones claras y llega a mercados nacionales e internacionales.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm">Conexión Directa</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Los compradores te contactarán directamente a tu WhatsApp o Correo.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm">Cierra Tratos</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Negocia precios, incoterms y logística sin intermediarios financieros.</p>
            </div>
          </div>

        </Card>
      ) : (
        /* TARJETAS TIPO SHOPIFY - LIMPIAS Y NATURALES */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in duration-300">
          {publications.map((pub) => {
            const formattedPrice = pub.price_type === "quote" || pub.price === "Por Cotizar"
              ? "Por Cotizar"
              : `${pub.price}$ / ${pub.unit || "kg"}`

            return (
              <div
                key={pub.id}
                className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card hover:shadow-md transition-shadow duration-200 group"
              >
                {/* IMAGEN */}
                <div className="relative w-full h-36 bg-muted overflow-hidden">
                  <img
                    src={pub.image || `/api/products/${pub.id}/thumb`}
                    alt={pub.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `/api/products/${pub.id}/thumb`
                    }}
                  />
                  {/* Solo un badge minimal de estado */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/95 text-emerald-700 border border-emerald-200 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Activa
                    </span>
                  </div>
                </div>

                {/* CONTENIDO */}
                <div className="flex flex-col flex-1 p-3 gap-2">
                  {/* Categoría + Vistas */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium uppercase tracking-wide text-[10px]">{pub.category || "General"}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {pub.views ?? 0}
                    </span>
                  </div>

                  {/* Nombre */}
                  <h3 className="font-semibold text-[13px] text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                    {pub.title}
                  </h3>

                  {/* Precio destacado */}
                  <p className="text-sm font-bold text-foreground">{formattedPrice}</p>

                  {/* Stock y Origen en fila */}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1.5 border-t border-border/50">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 shrink-0" />
                      {pub.quantity?.replace(/kilos/gi, "kg") || "Consultar"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {pub.country || "Int."}
                    </span>
                  </div>

                  {/* Botones */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/producto/${pub.id}`)}
                      className="flex-1 h-8 text-[11px] font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" /> Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/mis-publicaciones/${pub.id}/editar`)}
                      className="h-8 px-2.5 text-[11px] font-semibold rounded-lg"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(pub.id)}
                      disabled={isDeleting === pub.id}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      {isDeleting === pub.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>

              </div>

            )
          })}
        </div>
      )}

      {/* DIÁLOGO CONFIRMACIÓN ELIMINACIÓN */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente tu publicación
              de la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full font-bold">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white rounded-full font-bold"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
