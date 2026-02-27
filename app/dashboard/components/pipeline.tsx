"use client"

import { Card } from "@/components/ui/card"
import {
    Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    Area, ComposedChart, LabelList
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

// Custom Tooltip for better UI integration
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border p-3 rounded-lg shadow-sm">
                <p className="font-semibold text-foreground mb-1">{label}</p>
                <p className="font-bold flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.fillColor }}></span>
                    {payload[0].value} interacciones
                </p>
            </div>
        )
    }
    return null
}

export function Pipeline({ activityType, pipelineVentas, pipelineCompras }: PipelineProps) {
    if (activityType === 'empty') return null

    const renderSellerPipeline = () => {
        const pv = pipelineVentas || { solicitudes: 0, cotizaciones_enviadas: 0, negociacion: 0, pedidos_confirmados: 0 }
        const data = [
            { name: 'Solicitudes', cantidad: pv.solicitudes || 0, fillColor: "hsl(var(--primary))" },
            { name: 'Cotizadas', cantidad: pv.cotizaciones_enviadas || 0, fillColor: "hsl(var(--primary))" },
            { name: 'Negociación', cantidad: pv.negociacion || 0, fillColor: "hsl(var(--primary))" },
            { name: 'Pedidos', cantidad: pv.pedidos_confirmados || 0, fillColor: "hsl(var(--primary))" },
        ]

        if (data.every(d => d.cantidad === 0)) {
            return <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Aún no hay datos en el embudo de ventas.</div>
        }

        return (
            <div className="h-[320px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="barVentas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis hide domain={[0, 'dataMax + 2']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary))', opacity: 0.1 }} />

                        <Area
                            type="monotone"
                            dataKey="cantidad"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorVentas)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--primary))" }}
                            animationDuration={1500}
                        />
                        <Bar
                            dataKey="cantidad"
                            barSize={32}
                            radius={[6, 6, 0, 0]}
                            fill="url(#barVentas)"
                            animationDuration={1500}
                        >
                            <LabelList
                                dataKey="cantidad"
                                position="top"
                                fill="hsl(var(--foreground))"
                                fontSize={15}
                                fontWeight="bold"
                                offset={12}
                            />
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        )
    }

    const renderBuyerPipeline = () => {
        const pc = pipelineCompras || { busqueda: 0, solicitudes_enviadas: 0, ofertas_recibidas: 0, compras_completadas: 0 }
        const data = [
            { name: 'Sol. Enviadas', cantidad: pc.solicitudes_enviadas || 0, fillColor: "#3b82f6" },
            { name: 'Ofertas Recibidas', cantidad: pc.ofertas_recibidas || 0, fillColor: "#3b82f6" },
            { name: 'Compras Finalizadas', cantidad: pc.compras_completadas || 0, fillColor: "#3b82f6" },
        ]

        if (data.every(d => d.cantidad === 0)) {
            return <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Aún no hay datos en el embudo de compras.</div>
        }

        return (
            <div className="h-[320px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="barCompras" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                        <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                        <YAxis hide domain={[0, 'dataMax + 2']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#3b82f6', opacity: 0.1 }} />

                        <Area
                            type="monotone"
                            dataKey="cantidad"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorCompras)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: "#3b82f6" }}
                            animationDuration={1500}
                        />
                        <Bar
                            dataKey="cantidad"
                            barSize={32}
                            radius={[6, 6, 0, 0]}
                            fill="url(#barCompras)"
                            animationDuration={1500}
                        >
                            <LabelList
                                dataKey="cantidad"
                                position="top"
                                fill="hsl(var(--foreground))"
                                fontSize={15}
                                fontWeight="bold"
                                offset={12}
                            />
                        </Bar>
                    </ComposedChart>
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
