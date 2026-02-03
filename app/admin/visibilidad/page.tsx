"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Search } from "lucide-react"
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
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
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
                    <TabsTrigger value="static">
                        Productos Estáticos ({allProducts.length})
                    </TabsTrigger>
                </TabsList>

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
