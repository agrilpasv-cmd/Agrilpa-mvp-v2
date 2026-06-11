"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw, Eye, Trash2, Pencil, X, Save } from "lucide-react"
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PRODUCT_CATEGORIES } from "@/lib/constants"

interface Product {
    id: string
    title: string
    category: string
    price: string
    quantity: string
    description: string
    country: string
    state?: string
    min_order: string
    packaging: string
    packaging_size: number
    certifications: string
    maturity: string
    image: string
    created_at: string
    user_id: string
    user: {
        full_name: string
        email: string
        company_name: string
    }
}

const ALL_COUNTRIES = [
    "El Salvador", "Guatemala", "Honduras", "Nicaragua", "Costa Rica", "Panamá", "Belice",
    "México", "Estados Unidos", "Canadá",
    "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Ecuador", "Paraguay", "Perú", "Uruguay", "Venezuela", "Guyana", "Surinam",
    "Cuba", "República Dominicana", "Jamaica", "Haití", "Trinidad y Tobago", "Puerto Rico",
    "España", "Francia", "Alemania", "Italia", "Portugal", "Países Bajos", "Bélgica", "Polonia", "Reino Unido",
    "China", "India", "Japón", "Corea del Sur", "Tailandia", "Vietnam", "Indonesia", "Filipinas", "Malasia", "Turquía",
    "Sudáfrica", "Nigeria", "Kenia", "Etiopía", "Ghana", "Costa de Marfil", "Tanzania", "Uganda", "Marruecos", "Egipto",
    "Australia", "Nueva Zelanda",
]

export default function AdminPublicationsPage() {
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
    const { toast } = useToast()

    // Delete
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<string | null>(null)

    // Edit
    const [editProduct, setEditProduct] = useState<Product | null>(null)
    const [editForm, setEditForm] = useState<Partial<Product>>({})
    const [isSaving, setIsSaving] = useState(false)
    const [imagePreview, setImagePreview] = useState<string>("")

    const fetchProducts = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true)
        try {
            const response = await fetch(`/api/admin/products?t=${Date.now()}`, {
                cache: "no-store",
                headers: { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache" },
            })
            if (!response.ok) throw new Error("Failed to fetch products")
            const data = await response.json()
            setProducts(data || [])
            setLastUpdate(new Date())
        } catch (error: any) {
            toast({ title: "Error", description: "No se pudieron cargar las publicaciones", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => { fetchProducts(true) }, [fetchProducts])

    // ── Delete ──
    const handleDeleteClick = (id: string) => { setProductToDelete(id); setDeleteDialogOpen(true) }

    const confirmDelete = async () => {
        if (!productToDelete) return
        setIsDeleting(productToDelete)
        setDeleteDialogOpen(false)
        try {
            const response = await fetch("/api/admin/products/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: productToDelete }),
            })
            if (response.ok) {
                setProducts((prev) => prev.filter((p) => p.id !== productToDelete))
                toast({ title: "Publicación eliminada", description: "El producto ha sido eliminado correctamente" })
            } else {
                throw new Error("Failed to delete")
            }
        } catch {
            toast({ title: "Error", description: "No se pudo eliminar la publicación", variant: "destructive" })
        } finally {
            setIsDeleting(null)
            setProductToDelete(null)
        }
    }

    // ── Edit ──
    const openEdit = (product: Product) => {
        setEditProduct(product)
        // Strip vendor info from description if present
        const cleanDesc = product.description?.includes("---\nInformación del Vendedor:")
            ? product.description.split("---\nInformación del Vendedor:")[0].trim()
            : product.description || ""
        setEditForm({
            title: product.title,
            category: product.category,
            price: product.price,
            quantity: product.quantity,
            description: cleanDesc,
            country: product.country,
            state: product.state || "",
            min_order: product.min_order,
            packaging: product.packaging,
            packaging_size: product.packaging_size,
            certifications: product.certifications,
            maturity: product.maturity,
        })
        setImagePreview(product.image || "")
    }

    const handleEditInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        let processedValue = value

        if (name === "state") {
            // Allow only letters, spaces, and Spanish characters (áéíóúÁÉÍÓÚñÑüÜ)
            const cleanVal = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
            // Capitalize first letter of each word
            processedValue = cleanVal
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
        }

        setEditForm(prev => ({ ...prev, [name]: processedValue }))
    }

    const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "Imagen muy grande", description: "Máximo 5MB", variant: "destructive" }); return
        }
        const reader = new FileReader()
        reader.onload = (ev) => {
            const result = ev.target?.result as string
            setImagePreview(result)
            setEditForm(prev => ({ ...prev, image: result }))
        }
        reader.readAsDataURL(file)
    }

    const handleSaveEdit = async () => {
        if (!editProduct) return
        setIsSaving(true)
        try {
            const response = await fetch("/api/products/update-product", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editProduct.id,
                    title: editForm.title,
                    category: editForm.category,
                    price: editForm.price,
                    quantity: editForm.quantity,
                    description: editForm.description,
                    country: editForm.country,
                    state: editForm.state,
                    min_order: editForm.min_order,
                    packaging: editForm.packaging,
                    packaging_size: editForm.packaging_size,
                    certifications: editForm.certifications,
                    maturity: editForm.maturity,
                    ...(editForm.image ? { image: editForm.image } : {}),
                }),
            })
            if (!response.ok) {
                const err = await response.json()
                throw new Error(err.error || "Error al actualizar")
            }
            // Update local state
            setProducts(prev => prev.map(p =>
                p.id === editProduct.id
                    ? { ...p, ...editForm, image: imagePreview || p.image } as Product
                    : p
            ))
            toast({ title: "✅ Publicación actualizada", description: `"${editForm.title}" fue guardada correctamente.` })
            setEditProduct(null)
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
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
                    <Button variant="outline" size="sm" onClick={() => fetchProducts(true)} disabled={loading}>
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
                                            <td className="p-4 font-medium max-w-[200px]">
                                                <p className="truncate">{product.title}</p>
                                            </td>
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
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEdit(product)}
                                                        title="Editar producto"
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
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

            {/* ── Edit Dialog ── */}
            <Dialog open={!!editProduct} onOpenChange={(open) => { if (!open) setEditProduct(null) }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-primary" />
                            Editar Publicación
                        </DialogTitle>
                        <DialogDescription>
                            Modifica los datos del producto. Los cambios se guardarán inmediatamente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Image */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Imagen del Producto</label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">Haz clic para cambiar</span> (máx. 5MB)
                                        </p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEditImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                {imagePreview && (
                                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-border flex-shrink-0">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title + Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Título <span className="text-red-500">*</span></label>
                                <Input
                                    name="title"
                                    value={editForm.title || ""}
                                    onChange={handleEditInput}
                                    placeholder="Título del producto"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Categoría <span className="text-red-500">*</span></label>
                                <select
                                    name="category"
                                    value={editForm.category || ""}
                                    onChange={handleEditInput}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                                >
                                    <option value="">Selecciona categoría</option>
                                    {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Price + Quantity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Precio</label>
                                <Input
                                    name="price"
                                    value={editForm.price || ""}
                                    onChange={handleEditInput}
                                    placeholder="Ej: 1.50 o Por Cotizar"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cantidad Disponible</label>
                                <Input
                                    name="quantity"
                                    value={editForm.quantity || ""}
                                    onChange={handleEditInput}
                                    placeholder="Ej: 500 kg"
                                />
                            </div>
                        </div>

                        {/* Country, State + Min Order */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">País de Origen</label>
                                <select
                                    name="country"
                                    value={editForm.country || ""}
                                    onChange={handleEditInput}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                                >
                                    <option value="">Selecciona un país</option>
                                    {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Estado / Región</label>
                                <Input
                                    name="state"
                                    value={editForm.state || ""}
                                    onChange={handleEditInput}
                                    placeholder="Ej: Jalisco"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Pedido Mínimo</label>
                                <Input
                                    name="min_order"
                                    value={editForm.min_order || ""}
                                    onChange={handleEditInput}
                                    placeholder="Ej: 100 kg"
                                />
                            </div>
                        </div>

                        {/* Packaging + Maturity */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipo de Embalaje</label>
                                <select
                                    name="packaging"
                                    value={editForm.packaging || ""}
                                    onChange={handleEditInput}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                                >
                                    <option value="">Selecciona</option>
                                    <option value="Sacos">Sacos</option>
                                    <option value="Cajas">Cajas</option>
                                    <option value="Bolsas">Bolsas</option>
                                    <option value="Pallets">Pallets</option>
                                    <option value="Barriles">Barriles</option>
                                    <option value="Canastillas">Canastillas</option>
                                    <option value="Empaques Frescos">Empaques Frescos</option>
                                    <option value="Contenedores">Contenedores</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Maduración</label>
                                <select
                                    name="maturity"
                                    value={editForm.maturity || ""}
                                    onChange={handleEditInput}
                                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                                >
                                    <option value="">Sin especificar</option>
                                    <option value="No aplica">No aplica</option>
                                    <option value="Verde">Verde</option>
                                    <option value="Semi-maduro">Semi-maduro</option>
                                    <option value="Maduro">Maduro</option>
                                    <option value="Sobre-maduro">Sobre-maduro</option>
                                </select>
                            </div>
                        </div>

                        {/* Certifications */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Certificaciones</label>
                            <Input
                                name="certifications"
                                value={editForm.certifications || ""}
                                onChange={handleEditInput}
                                placeholder="Ej: HACCP, Global GAP, ISO 9001"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Separa con comas</p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Descripción <span className="text-red-500">*</span></label>
                            <textarea
                                name="description"
                                value={editForm.description || ""}
                                onChange={handleEditInput}
                                rows={4}
                                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm resize-none"
                                placeholder="Describe el producto..."
                            />
                        </div>

                        {/* Info banner */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-700">
                                <strong>Nota:</strong> El vendedor, contacto e incoterm se conservan tal como fueron registrados por el usuario. Solo puedes editar la información del producto.
                            </p>
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <Button variant="outline" onClick={() => setEditProduct(null)} disabled={isSaving}>
                            <X className="w-4 h-4 mr-2" />Cancelar
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isSaving} className="gap-2">
                            {isSaving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
                            ) : (
                                <><Save className="w-4 h-4" />Guardar Cambios</>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ── */}
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
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
