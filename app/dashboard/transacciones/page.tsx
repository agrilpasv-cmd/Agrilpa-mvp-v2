"use client"

import { useState, useEffect } from "react"
import ConstructionOverlay from "@/components/dashboard/construction-overlay"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Search,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Loader2
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Transaction {
    id: string
    created_at: string
    product_name: string
    client_name: string
    price_usd: number
    status: string
    type: 'purchase' | 'sale'
}


export default function TransaccionesPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both Sales (as Seller) and Purchases (as Buyer)
                const [salesRes, purchasesRes] = await Promise.all([
                    fetch("/api/seller/orders"),
                    fetch("/api/user/orders")
                ])

                let allTransactions: Transaction[] = []

                if (salesRes.ok) {
                    const salesData = await salesRes.json()
                    const sales = (salesData.orders || []).map((o: any) => ({
                        id: o.id,
                        created_at: o.created_at,
                        product_name: o.product_name || "Producto",
                        client_name: o.full_name || o.buyer_name || "Comprador",
                        price_usd: o.price_usd || 0,
                        status: o.status || "completed",
                        type: 'sale' as const
                    }))
                    allTransactions = [...allTransactions, ...sales]
                }

                if (purchasesRes.ok) {
                    const purchasesData = await purchasesRes.json()
                    const purchases = (purchasesData.orders || []).map((o: any) => ({
                        id: o.id,
                        created_at: o.created_at,
                        product_name: o.product_name || "Producto",
                        client_name: o.seller_name || "Vendedor", // Assuming we might have this, or fallback
                        price_usd: o.price_usd || 0,
                        status: o.status || "completed",
                        type: 'purchase' as const
                    }))
                    allTransactions = [...allTransactions, ...purchases]
                }

                // Sort by date descending
                allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

                setTransactions(allTransactions)
            } catch (error) {
                console.error("Error fetching transactions:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const filteredTransactions = transactions.filter(t =>
        t.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusBadge = (status: string) => {
        // Map simplified statuses for the UI
        let label = status
        let className = "bg-gray-100 text-gray-800 hover:bg-gray-100"

        if (status === "completed" || status === "paid" || status === "delivered") {
            label = "Completada"
            className = "bg-green-100 text-green-700 hover:bg-green-100 border-none"
        } else if (status === "pending" || status === "processing") {
            label = "Pendiente de Pago"
            className = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none"
        } else if (status === "cancelled" || status === "rejected") {
            label = "Cancelada"
            className = "bg-red-100 text-red-700 hover:bg-red-100 border-none"
        }

        return <Badge className={`${className} rounded-full px-3 font-medium`}>{label}</Badge>
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <ConstructionOverlay>
            <div className="p-8 space-y-8 max-w-7xl mx-auto">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Mis Transacciones</h1>
                    <p className="text-muted-foreground">
                        Historial de compras y ventas
                    </p>
                </div>

                {/* Filter Section */}
                <Card className="shadow-sm border border-border">
                    <CardContent className="p-6">
                        <div className="mb-4">
                            <h2 className="font-semibold text-base mb-4">Filtros de Búsqueda</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar por producto, cliente, tipo..."
                                        className="pl-9 bg-background"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        placeholder="dd/mm/aaaa"
                                        className="pl-9 bg-background"
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="date"
                                        placeholder="dd/mm/aaaa"
                                        className="pl-9 bg-background"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Section */}
                <Card className="shadow-sm border border-border overflow-hidden">
                    <div className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40 border-b border-border">
                                    <TableHead className="w-[120px] font-semibold text-foreground pl-6">Tipo</TableHead>
                                    <TableHead className="font-semibold text-foreground">Producto/Cliente</TableHead>
                                    <TableHead className="font-semibold text-foreground">Monto</TableHead>
                                    <TableHead className="font-semibold text-foreground">Fecha</TableHead>
                                    <TableHead className="font-semibold text-foreground">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                            No se encontraron transacciones recientes.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((t) => (
                                        <TableRow key={t.id} className="hover:bg-muted/10 border-b border-border/50 last:border-0">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {t.type === 'sale' ? (
                                                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <ArrowDownLeft className="h-4 w-4 text-red-600" />
                                                    )}
                                                    <span className="font-medium text-foreground">
                                                        {t.type === 'sale' ? 'Venta' : 'Compra'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground">{t.product_name}</span>
                                                    <span className="text-sm text-muted-foreground">{t.client_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <span className="font-bold text-foreground">
                                                    ${t.price_usd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-4 text-muted-foreground">
                                                {format(new Date(t.created_at), "yyyy-MM-dd", { locale: es })}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                {getStatusBadge(t.status)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            </div>
        </ConstructionOverlay>
    )
}
