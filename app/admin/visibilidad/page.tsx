"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Loader2, Search, Star, Save, ArrowUp, ArrowDown, AlertCircle } from "lucide-react"
import { allProducts } from "@/lib/products-data"

interface UserProduct {
    id: string
    title: string
    category: string
    price: string
    image: string
    is_visible: boolean
    user: {
        full_name: string
        company_name: string
    }
}

interface StaticProductVisibility {
    product_id: number
    is_visible: boolean
}

export default function VisibilityPage() {
    const [userProducts, setUserProducts] = useState<UserProduct[]>([])
    const [staticVisibility, setStaticVisibility] = useState<Record<number, boolean>>({})
    const [featuredIds, setFeaturedIds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [savingFeatured, setSavingFeatured] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const { toast } = useToast()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Fetch user products
            const userRes = await fetch("/api/admin/products")
            if (userRes.ok) {
                const userData = await userRes.json()
                setUserProducts(userData || [])
            }

            // Fetch static product visibility
            const staticRes = await fetch("/api/admin/visibility/static-products")
            if (staticRes.ok) {
                const staticData = await staticRes.json()
                const visibilityMap: Record<number, boolean> = {}
                staticData.visibility.forEach((item: StaticProductVisibility) => {
                    visibilityMap[item.product_id] = item.is_visible
                })
                setStaticVisibility(visibilityMap)
            }

            // Fetch featured products configuration
            const featuredRes = await fetch("/api/admin/visibility/featured-products")
            if (featuredRes.ok) {
                const featuredData = await featuredRes.json()
                setFeaturedIds(featuredData.featuredProductIds || [])
            }
        } catch (error) {
            console.error("Error fetching data:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los productos",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const toggleFeatured = (productId: string) => {
        setFeaturedIds((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId)
            }
            if (prev.length >= 4) {
                toast({
                    title: "Límite alcanzado",
                    description: "Solo puedes destacar un máximo de 4 productos en la página de inicio.",
                    variant: "destructive",
                })
                return prev
            }
            return [...prev, productId]
        })
    }

    const moveFeatured = (index: number, direction: "up" | "down") => {
        const nextIndex = direction === "up" ? index - 1 : index + 1
        if (nextIndex < 0 || nextIndex >= featuredIds.length) return

        const updated = [...featuredIds]
        const temp = updated[index]
        updated[index] = updated[nextIndex]
        updated[nextIndex] = temp
        setFeaturedIds(updated)
    }

    const saveFeaturedProducts = async () => {
        setSavingFeatured(true)
        try {
            const res = await fetch("/api/admin/visibility/featured-products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ featuredProductIds: featuredIds }),
            })
            const data = await res.json()
            if (res.ok) {
                toast({
                    title: "Productos destacados guardados",
                    description: "Los productos destacados de la página de inicio se han actualizado correctamente y cargarán de inmediato.",
                })
            } else {
                throw new Error(data.error || "Error al guardar")
            }
        } catch (error: any) {
            console.error("Error saving featured products:", error)
            toast({
                title: "Error",
                description: error.message || "No se pudieron guardar los productos destacados",
                variant: "destructive",
            })
        } finally {
            setSavingFeatured(false)
        }
    }

    const toggleUserProductVisibility = async (productId: string, currentVisibility: boolean) => {
        setUpdating(productId)
        console.log(`[DEBUG] Toggling user product ${productId} from ${currentVisibility} to ${!currentVisibility}`)

        try {
            const payload = {
                productId,
                isVisible: !currentVisibility,
            }
            console.log("[DEBUG] Sending payload:", payload)

            const res = await fetch("/api/admin/visibility/user-products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            console.log("[DEBUG] Response status:", res.status)
            const data = await res.json()
            console.log("[DEBUG] Response data:", data)

            if (res.ok) {
                setUserProducts((prev) =>
                    prev.map((p) => (p.id === productId ? { ...p, is_visible: !currentVisibility } : p)),
                )
                toast({
                    title: "Visibilidad actualizada",
                    description: `Producto ${!currentVisibility ? "visible" : "oculto"} correctamente`,
                })
            } else {
                throw new Error(data.error || "Failed to update")
            }
        } catch (error) {
            console.error("[ERROR] Error updating visibility:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "No se pudo actualizar la visibilidad. Verifica que hayas ejecutado el script SQL en Supabase.",
                variant: "destructive",
            })
        } finally {
            setUpdating(null)
        }
    }

    const toggleStaticProductVisibility = async (productId: number, currentVisibility: boolean) => {
        setUpdating(`static-${productId}`)
        console.log(`[DEBUG] Toggling static product ${productId} from ${currentVisibility} to ${!currentVisibility}`)

        try {
            const payload = {
                productId,
                isVisible: !currentVisibility,
            }
            console.log("[DEBUG] Sending payload:", payload)

            const res = await fetch("/api/admin/visibility/static-products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            console.log("[DEBUG] Response status:", res.status)
            const data = await res.json()
            console.log("[DEBUG] Response data:", data)

            if (res.ok) {
                setStaticVisibility((prev) => ({
                    ...prev,
                    [productId]: !currentVisibility,
                }))
                toast({
                    title: "Visibilidad actualizada",
                    description: `Producto ${!currentVisibility ? "visible" : "oculto"} correctamente`,
                })
            } else {
                throw new Error(data.error || "Failed to update")
            }
        } catch (error) {
            console.error("[ERROR] Error updating visibility:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "No se pudo actualizar la visibilidad. Verifica que hayas ejecutado el script SQL en Supabase.",
                variant: "destructive",
            })
        } finally {
            setUpdating(null)
        }
    }

    const filteredUserProducts = userProducts.filter(
        (p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const filteredStaticProducts = allProducts.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const userVisibleCount = userProducts.filter((p) => p.is_visible).length
    const userHiddenCount = userProducts.length - userVisibleCount

    const staticVisibleCount = allProducts.filter((p) => staticVisibility[p.id] !== false).length
    const staticHiddenCount = allProducts.length - staticVisibleCount

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Control de Visibilidad</h1>
                <p className="text-muted-foreground">Gestiona qué productos aparecen en el catálogo público</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            <Tabs defaultValue="user" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="user">
                        Productos de Usuarios ({userProducts.length})
                    </TabsTrigger>
                    <TabsTrigger value="featured">
                        Destacados en Inicio ({featuredIds.length}/4)
                    </TabsTrigger>
                    <TabsTrigger value="static">
                        Productos Estáticos ({allProducts.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="featured" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Selected featured products list and sorting (Left/Middle Column - takes 2/3 space on large screens) */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card className="border-amber-500/20 bg-amber-500/[0.02]">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                                            </div>
                                            <div>
                                                <CardTitle>Productos Destacados en Inicio</CardTitle>
                                                <CardDescription>
                                                    Selecciona y ordena exactamente hasta 4 productos para mostrarlos en el Hero de la página de inicio.
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={saveFeaturedProducts}
                                            disabled={savingFeatured}
                                            className="bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-auto"
                                        >
                                            {savingFeatured ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            {savingFeatured ? "Guardando..." : "Guardar Destacados"}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {featuredIds.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg border-muted p-4 text-center">
                                            <AlertCircle className="w-8 h-8 text-muted-foreground mb-3" />
                                            <h3 className="font-semibold text-base mb-1">Sin productos destacados</h3>
                                            <p className="text-sm text-muted-foreground max-w-md">
                                                No has seleccionado ningún producto destacado. La página de inicio mostrará los últimos productos subidos por defecto.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {featuredIds.map((id, index) => {
                                                const product = userProducts.find((p) => p.id === id)
                                                if (!product) return null
                                                return (
                                                    <div
                                                        key={id}
                                                        className="flex items-center justify-between p-4 bg-background border border-amber-500/25 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                                    >
                                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                                            <div className="flex items-center justify-center font-bold text-amber-600 bg-amber-500/10 w-6 h-6 rounded-full text-xs shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0 border border-amber-500/10">
                                                                <img
                                                                    src={product.image || "/placeholder.svg"}
                                                                    alt={product.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-semibold truncate text-foreground text-sm sm:text-base">{product.title}</h3>
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <span>{product.category}</span>
                                                                    <span>•</span>
                                                                    <span className="font-medium text-amber-600">{product.price}</span>
                                                                    <span>•</span>
                                                                    <span className="truncate">
                                                                        {product.user?.company_name || product.user?.full_name}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 sm:gap-2 ml-4 shrink-0">
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                onClick={() => moveFeatured(index, "up")}
                                                                disabled={index === 0}
                                                            >
                                                                <ArrowUp className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                                onClick={() => moveFeatured(index, "down")}
                                                                disabled={index === featuredIds.length - 1}
                                                            >
                                                                <ArrowDown className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => toggleFeatured(id)}
                                                            >
                                                                Quitar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary and Stats (Right Column) */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">¿Por qué usar destacados manuales?</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground space-y-3">
                                    <p>
                                        🚀 <strong>Carga ultra rápida:</strong> Al seleccionar manualmente los productos destacados, la página de inicio carga de forma <strong>inmediata</strong> (en milisegundos) en lugar de hacer consultas dinámicas pesadas.
                                    </p>
                                    <p>
                                        🎯 <strong>Control total:</strong> Elige exactamente qué productos y en qué orden quieres promocionar ante los nuevos visitantes de Agrilpa.
                                    </p>
                                    <p>
                                        💡 <strong>Requisitos:</strong> Solo se pueden destacar productos que tengan visibilidad activa. Si ocultas un producto en el catálogo, no se mostrará como destacado.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Selector List of Active User Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Selecciona Productos del Catálogo</CardTitle>
                            <CardDescription>
                                Haz clic en la estrella ⭐ para añadir o quitar un producto del inicio. (Límite: 4 productos).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Filter only visible products for selecting as featured */}
                            {userProducts.filter(p => p.is_visible).length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No hay productos visibles activos para destacar. Activa la visibilidad de algún producto en la primera pestaña.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {userProducts
                                        .filter(p => p.is_visible && (
                                            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            p.category.toLowerCase().includes(searchQuery.toLowerCase())
                                        ))
                                        .map((product) => {
                                            const isFeatured = featuredIds.includes(product.id)
                                            return (
                                                <div
                                                    key={product.id}
                                                    className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${
                                                        isFeatured
                                                            ? "border-amber-500 bg-amber-500/[0.02] shadow-sm"
                                                            : "hover:bg-muted/50"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={product.image || "/placeholder.svg"}
                                                                alt={product.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-medium truncate text-sm sm:text-base">{product.title}</h3>
                                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                                <span>{product.category}</span>
                                                                <span>•</span>
                                                                <span className="font-medium text-amber-600">{product.price}</span>
                                                                <span>•</span>
                                                                <span className="truncate">
                                                                    {product.user?.company_name || product.user?.full_name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant={isFeatured ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => toggleFeatured(product.id)}
                                                        className={`flex items-center gap-2 shrink-0 ml-4 ${
                                                            isFeatured
                                                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                                : "hover:border-amber-500 hover:text-amber-600"
                                                        }`}
                                                    >
                                                        <Star className={`w-4 h-4 ${isFeatured ? "fill-white" : ""}`} />
                                                        <span className="hidden sm:inline">{isFeatured ? "Destacado" : "Destacar"}</span>
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="user" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos de Usuarios</CardTitle>
                            <CardDescription>
                                Visibles: {userVisibleCount} | Ocultos: {userHiddenCount}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredUserProducts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {searchQuery ? "No se encontraron productos" : "No hay productos de usuarios"}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredUserProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={product.image || "/placeholder.svg"}
                                                        alt={product.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium truncate">{product.title}</h3>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <span>{product.category}</span>
                                                        <span>•</span>
                                                        <span>{product.price}</span>
                                                        <span>•</span>
                                                        <span className="truncate">
                                                            {product.user?.company_name || product.user?.full_name}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {product.is_visible ? (
                                                        <Eye className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <EyeOff className="w-4 h-4 text-red-600" />
                                                    )}
                                                    <span className="text-sm font-medium">
                                                        {product.is_visible ? "Visible" : "Oculto"}
                                                    </span>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={product.is_visible}
                                                onCheckedChange={() =>
                                                    toggleUserProductVisibility(product.id, product.is_visible)
                                                }
                                                disabled={updating === product.id}
                                                className="ml-4"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="static" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Productos Estáticos</CardTitle>
                            <CardDescription>
                                Visibles: {staticVisibleCount} | Ocultos: {staticHiddenCount}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredStaticProducts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    No se encontraron productos
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredStaticProducts.map((product) => {
                                        const isVisible = staticVisibility[product.id] !== false
                                        return (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={product.image || "/placeholder.svg"}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium truncate">{product.name}</h3>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <span>{product.category}</span>
                                                            <span>•</span>
                                                            <span>{product.price}</span>
                                                            <span>•</span>
                                                            <span className="truncate">{product.producer}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isVisible ? (
                                                            <Eye className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <EyeOff className="w-4 h-4 text-red-600" />
                                                        )}
                                                        <span className="text-sm font-medium">
                                                            {isVisible ? "Visible" : "Oculto"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={isVisible}
                                                    onCheckedChange={() =>
                                                        toggleStaticProductVisibility(product.id, isVisible)
                                                    }
                                                    disabled={updating === `static-${product.id}`}
                                                    className="ml-4"
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
