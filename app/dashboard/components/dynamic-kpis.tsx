"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, MessageSquare, Package, DollarSign, Activity, FileText } from 'lucide-react'

interface DynamicKpisProps {
    activityType: 'empty' | 'buyer' | 'seller' | 'mixed'
    seller?: {
        quotes_received_7d: number
        quotes_pending: number
        orders_confirmed: number
        valor_negociacion: string
    }
    buyer?: {
        requests_sent: number
        quotes_received: number
        orders_in_process: number
        total_bought: string
    }
}

export function DynamicKpis({ activityType, seller, buyer }: DynamicKpisProps) {
    if (activityType === 'empty') return null

    const renderSellerKpis = () => (
        <>
            <Card className="p-6 border-l-4 border-l-primary/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Cotizaciones recibidas (últimos 7 días)</p>
                        <p className="text-3xl font-bold text-foreground">{seller?.quotes_received_7d ?? 0}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-primary/40" />
                </div>
            </Card>
            <Card className="p-6 border-l-4 border-l-orange-500/50 bg-orange-500/5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-orange-600 mb-2">Cotizaciones pendientes de responder</p>
                        <p className="text-3xl font-bold text-orange-700">{seller?.quotes_pending ?? 0}</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-500/60" />
                </div>
            </Card>
            <Card className="p-6 border-l-4 border-l-green-500/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Pedidos confirmados</p>
                        <p className="text-3xl font-bold text-foreground">{seller?.orders_confirmed ?? 0}</p>
                    </div>
                    <Package className="w-8 h-8 text-green-500/40" />
                </div>
            </Card>
            <Card className="p-6 border-l-4 border-l-blue-500/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Valor estimado en negociación</p>
                        <p className="text-3xl font-bold text-foreground">{seller?.valor_negociacion ?? "$0"}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-500/40" />
                </div>
            </Card>
        </>
    )

    const renderBuyerKpis = () => (
        <>
            <Card className="p-6 border-l-4 border-l-primary/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Solicitudes enviadas</p>
                        <p className="text-3xl font-bold text-foreground">{buyer?.requests_sent ?? 0}</p>
                    </div>
                    <FileText className="w-8 h-8 text-primary/40" />
                </div>
            </Card>
            <Card className="p-6 border-l-4 border-l-orange-500/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Cotizaciones recibidas</p>
                        <p className="text-3xl font-bold text-foreground">{buyer?.quotes_received ?? 0}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-orange-500/40" />
                </div>
            </Card>
            <Card className="p-6 border-l-4 border-l-yellow-500/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Pedidos en proceso</p>
                        <p className="text-3xl font-bold text-foreground">{buyer?.orders_in_process ?? 0}</p>
                    </div>
                    <Activity className="w-8 h-8 text-yellow-500/40" />
                </div>
            </Card>
            <Card className="p-6 border-l-4 border-l-green-500/50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Total comprado</p>
                        <p className="text-3xl font-bold text-foreground">{buyer?.total_bought ?? "$0"}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500/40" />
                </div>
            </Card>
        </>
    )

    return (
        <div className="flex flex-col gap-8 mb-8">
            {(activityType === 'seller' || activityType === 'mixed') && (
                <div>
                    {activityType === 'mixed' && <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Métricas de Ventas</h3>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {renderSellerKpis()}
                    </div>
                </div>
            )}

            {(activityType === 'buyer' || activityType === 'mixed') && (
                <div>
                    {activityType === 'mixed' && <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Métricas de Compras</h3>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {renderBuyerKpis()}
                    </div>
                </div>
            )}
        </div>
    )
}
