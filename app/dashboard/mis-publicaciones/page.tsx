"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit2, Eye, Loader2, CheckCircle, XCircle } from "lucide-react"
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
  quantity: string
  description: string
  country: string
  min_order: string
  maturity?: string
  status?: "activa" | "pausada" | "vendida"
  created_at: string
  views?: number
  image?: string
}

export default function PublicacionesPage() {
  const router = useRouter()
  const [publications, setPublications] = useState<Publication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' })

  // Custom hook for sidebar updates
  const { refreshCounts } = useDashboard()

  useEffect(() => {
    fetchMyProducts()
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

  const handleEdit = (pub: Publication) => {
    // Navigate to edit page (endpoint should be implemented separately)
    // router.push(`/dashboard/mis-publicaciones/${pub.id}/editar`)
    alert("Próximamente: Función de editar")
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productToDelete }),
      })

      if (response.ok) {
        setPublications((prev) => prev.filter((pub) => pub.id !== productToDelete))
        await refreshCounts() // Update sidebar immediately
        setNotification({ type: 'success', message: '¡Publicación eliminada correctamente!' })
        // Auto-hide after 4 seconds
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
        return "bg-green-100 text-green-800"
      case "pausada":
        return "bg-yellow-100 text-yellow-800"
      case "vendida":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-green-100 text-green-800" // Default to active for now
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Publicaciones</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus anuncios ({publications.length}/3)</p>
        </div>
        {publications.length >= 3 ? (
          <div className="flex flex-col items-end gap-1">
            <Button disabled className="gap-2 opacity-50 cursor-not-allowed">
              <Plus className="w-4 h-4" />
              Límite Alcanzado
            </Button>
            <span className="text-xs text-red-500 font-medium">Máximo 3 publicaciones permitidas</span>
          </div>
        ) : (
          <Button onClick={() => router.push("/dashboard/mis-publicaciones/nueva")} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva Publicación
          </Button>
        )}
      </div>

      {/* Notification Toast */}
      {notification.type && (
        <div
          className={`
            flex items-center gap-3 p-4 rounded-lg shadow-lg border animate-in slide-in-from-top-2 duration-300
            ${notification.type === 'success'
              ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }
          `}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
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

      <div className="space-y-4">
        {publications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">No tienes publicaciones aún. ¡Crea tu primera publicación!</p>
              <Button onClick={() => router.push("/dashboard/mis-publicaciones/nueva")} variant="outline">
                Crear publicación
              </Button>
            </CardContent>
          </Card>
        ) : (
          publications.map((pub) => (
            <Card key={pub.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {pub.image && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-border flex-shrink-0">
                      <img
                        src={pub.image || "/placeholder.svg"}
                        alt={pub.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">{pub.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{pub.category}</p>
                        <p className="text-sm text-foreground mt-2 line-clamp-2">
                          {pub.description?.includes("---\nInformación del Vendedor:")
                            ? pub.description.split("---\nInformación del Vendedor:")[0].trim()
                            : pub.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-3">
                          <span className="font-semibold text-primary">
                            {pub.price === "Por Cotizar" ? pub.price : `$${pub.price}`}
                          </span>
                          <span className="text-sm text-muted-foreground">Stock: {pub.quantity}</span>
                          <span className="text-sm text-muted-foreground">{pub.country}</span>
                          <span className="text-sm text-muted-foreground">Pedido mín: {pub.min_order}</span>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {pub.views ?? 0} vistas
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                      <Badge className={getStatusColor(pub.status)}>
                        {(pub.status || "Activa").charAt(0).toUpperCase() + (pub.status || "Activa").slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(pub.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 md:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => router.push(`/producto/${pub.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => router.push(`/dashboard/mis-publicaciones/${pub.id}/editar`)}
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 gap-2 bg-transparent"
                      onClick={() => handleDelete(pub.id)}
                      disabled={isDeleting === pub.id}
                    >
                      {isDeleting === pub.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente tu publicación
              de la plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
