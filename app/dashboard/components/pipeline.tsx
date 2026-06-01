"use client"

import { Card } from "@/components/ui/card"
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"

interface PipelineProps {
    activityType: 'empty' | 'buyer' | 'seller' | 'mixed'
    pipelineVentas?: {
        solicitudes: number
        cotizaciones_enviadas: number
        negociacion: number
        pedidos_confirmados: number
    }
    pipelineCompras?: {
        busqueda: number
        solicitudes_enviadas: number
        ofertas_recibidas: number
        compras_completadas: number
    }
}

// Standard Tooltip mimicking admin dashboard style
const tooltipStyle = {
    backgroundColor: 'var(--color-background)',
    borderRadius: '8px',
    border: '1px solid var(--color-border)'
}

export function Pipeline({ activityType, pipelineVentas, pipelineCompras }: PipelineProps) {
    if (activityType === 'empty') return null

    const renderSellerPipeline = () => {
        const pv = pipelineVentas || { solicitudes: 0, cotizaciones_enviadas: 0, negociacion: 0, pedidos_confirmados: 0 }
        const data = [
            { name: 'Solicitudes', cantidad: pv.solicitudes || 0 },
            { name: 'Cotizadas', cantidad: pv.cotizaciones_enviadas || 0 },
            { name: 'Negociación', cantidad: pv.negociacion || 0 },
            { name: 'Pedidos', cantidad: pv.pedidos_confirmados || 0 },
        ]

        if (data.every(d => d.cantidad === 0)) {
            return <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Aún no hay datos en el embudo de ventas.</div>
        }

        return (
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="var(--color-muted-foreground)" />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} />
                        <Area type="monotone" dataKey="cantidad" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorVentas)" animationDuration={1000} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )
    }

    const renderBuyerPipeline = () => {
        const pc = pipelineCompras || { busqueda: 0, solicitudes_enviadas: 0, ofertas_recibidas: 0, compras_completadas: 0 }
        const data = [
            { name: 'Sol. Enviadas', cantidad: pc.solicitudes_enviadas || 0 },
            { name: 'Ofertas Recibidas', cantidad: pc.ofertas_recibidas || 0 },
            { name: 'Compras Finalizadas', cantidad: pc.compras_completadas || 0 },
        ]

        if (data.every(d => d.cantidad === 0)) {
            return <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Aún no hay datos en el embudo de compras.</div>
        }

        return (
            <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="var(--color-muted-foreground)" />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} />
                        <Area type="monotone" dataKey="cantidad" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCompras)" animationDuration={1000} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )
    }

    return (
        <Card className="p-6 mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Pipeline Activo</h3>
            <div className={`grid grid-cols-1 ${activityType === 'mixed' ? 'lg:grid-cols-2' : ''} gap-8`}>
                {(activityType === 'seller' || activityType === 'mixed') && (
                    <div className="bg-muted/10 p-4 rounded-xl border border-border/50">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 text-center">Embudo de Ventas</h4>
                        {renderSellerPipeline()}
                    </div>
                )}
                {(activityType === 'buyer' || activityType === 'mixed') && (
                    <div className="bg-muted/10 p-4 rounded-xl border border-border/50">
                        <h4 className="text-sm font-semibold text-blue-500/70 uppercase tracking-wider mb-2 text-center">Embudo de Compras</h4>
                        {renderBuyerPipeline()}
                    </div>
                )}
            </div>
        </Card>
    )
}
