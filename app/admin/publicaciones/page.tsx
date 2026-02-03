"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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

interface Product {
    id: string
    title: string
    category: string
    price: string
    image: string
    created_at: string
    user_id: string
    user: {
        full_name: string
        email: string
        company_name: string
    }
}

export default function AdminPublicationsPage() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const { toast } = useToast()

    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<string | null>(null)

    const fetchProducts = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true)

        try {
            const response = await fetch(`/api/admin/products?t=${Date.now()}`, {
                cache: "no-store",
                headers: {
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    Pragma: "no-cache",
                },
            })

            if (!response.ok) {
                throw new Error("Failed to fetch products")
            }

            const data = await response.json()
            setProducts(data || [])
            setLastUpdate(new Date())
        } catch (error: any) {
            console.error("[v0] Admin Products Page error:", error.message)
            toast({
                title: "Error",
                description: "No se pudieron cargar las publicaciones",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchProducts(true)
    }, [fetchProducts])

    const handleDeleteClick = (id: string) => {
        setProductToDelete(id)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!productToDelete) return

        setIsDeleting(productToDelete)
        setDeleteDialogOpen(false)

        try {
            const response = await fetch("/api/admin/products/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: productToDelete }),
            })

            if (response.ok) {
                setProducts((prev) => prev.filter((p) => p.id !== productToDelete))
                toast({
                    title: "Publicación eliminada",
                    description: "El producto ha sido eliminado correctamente",
                })
            } else {
                throw new Error("Failed to delete")
            }
        } catch (error) {
            console.error("Error deleting product:", error)
            toast({
                title: "Error",
                description: "No se pudo eliminar la publicación",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(null)
            setProductToDelete(null)
        }
    }

    const handleManualRefresh = () => {
        fetchProducts(true)
    }

    if (loading && products.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Publicaciones</h1>
                    <p className="text-muted-foreground">Administra los productos publicados por los usuarios</p>
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

            <Card>
                <CardHeader>
                    <CardTitle>Publicaciones Activas</CardTitle>
                    <CardDescription>Total de publicaciones: {products.length}</CardDescription>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No hay publicaciones registradas</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium w-[80px]">Imagen</th>
                                        <th className="text-left p-4 font-medium">Producto</th>
                                        <th className="text-left p-4 font-medium">Categoría</th>
                                        <th className="text-left p-4 font-medium">Precio</th>
                                        <th className="text-left p-4 font-medium">Vendedor</th>
                                        <th className="text-left p-4 font-medium">Empresa</th>
                                        <th className="text-left p-4 font-medium">Fecha</th>
                                        <th className="text-right p-4 font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-b hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden">
                                                    <img
                                                        src={product.image || "/placeholder.svg"}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium">{product.title}</td>
                                            <td className="p-4">{product.category}</td>
                                            <td className="p-4">{product.price}</td>
                                            <td className="p-4 text-sm">
                                                <div className="font-medium">{product.user?.full_name || "Desconocido"}</div>
                                                <div className="text-xs text-muted-foreground">{product.user?.email}</div>
                                            </td>
                                            <td className="p-4">{product.user?.company_name || "-"}</td>
                                            <td className="p-4 text-sm text-muted-foreground">
                                                {new Date(product.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.push(`/producto/${product.id}`)}
                                                        title="Ver producto"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleDeleteClick(product.id)}
                                                        disabled={isDeleting === product.id}
                                                        title="Eliminar producto"
                                                    >
                                                        {isDeleting === product.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar publicación?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El producto será eliminado permanentemente del catálogo.
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
