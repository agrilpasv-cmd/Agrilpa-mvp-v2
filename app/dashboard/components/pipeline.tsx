"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, ChevronRight, CircleDot } from "lucide-react"

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

export function Pipeline({ activityType, pipelineVentas, pipelineCompras }: PipelineProps) {
    if (activityType === 'empty') return null

    const renderPipelineSteps = (steps: { label: string; count: number; active: boolean }[]) => {
        return (
            <div className="flex items-center w-full justify-between py-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center relative z-10 w-24">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm transition-all
                                ${step.active ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110' : 'bg-muted text-muted-foreground'}`}>
                                {step.active ? <CheckCircle2 className="w-6 h-6" /> : <CircleDot className="w-6 h-6" />}
                            </div>
                            <span className={`text-xs text-center font-medium ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {step.label}
                            </span>
                            <span className="text-lg font-bold mt-1 text-primary">{step.count}</span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-1 bg-border rounded-full mx-2 mt-[-40px] relative">
                                <div className={`absolute inset-y-0 left-0 bg-primary transition-all rounded-full ${steps[index + 1].active ? 'w-full' : 'w-0'}`}></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    const renderSellerPipeline = () => {
        const pv = pipelineVentas || { solicitudes: 0, cotizaciones_enviadas: 0, negociacion: 0, pedidos_confirmados: 0 }
        const steps = [
            { label: 'Solicitud', count: pv.solicitudes || 0, active: true },
            { label: 'Cotización enviada', count: pv.cotizaciones_enviadas || 0, active: true },
            { label: 'Negociación', count: pv.negociacion || 0, active: (pv.negociacion || 0) > 0 },
            { label: 'Pedido confirmado', count: pv.pedidos_confirmados || 0, active: (pv.pedidos_confirmados || 0) > 0 },
        ]
        return renderPipelineSteps(steps)
    }

    const renderBuyerPipeline = () => {
        const pc = pipelineCompras || { busqueda: 0, solicitudes_enviadas: 0, ofertas_recibidas: 0, compras_completadas: 0 }
        const steps = [
            { label: 'Solicitud enviada', count: pc.solicitudes_enviadas || 0, active: true },
            { label: 'Oferta recibida', count: pc.ofertas_recibidas || 0, active: true },
            { label: 'Aceptada', count: pc.compras_completadas || 0, active: (pc.compras_completadas || 0) > 0 }, // Using compras_completadas as a proxy for accepted
            { label: 'Pedido', count: pc.compras_completadas || 0, active: (pc.compras_completadas || 0) > 0 },
        ]
        return renderPipelineSteps(steps)
    }

    return (
        <Card className="p-6 mb-8 overflow-x-auto">
            <h3 className="text-lg font-bold text-foreground mb-2">Pipeline Activo</h3>
            <div className="relative min-w-[600px]">
                {(activityType === 'seller' || activityType === 'mixed') && (
                    <div className="mb-8">
                        {activityType === 'mixed' && <h4 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Flujo de Ventas</h4>}
                        {renderSellerPipeline()}
                    </div>
                )}
                {(activityType === 'buyer' || activityType === 'mixed') && (
                    <div>
                        {activityType === 'mixed' && <h4 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Flujo de Compras</h4>}
                        {renderBuyerPipeline()}
                    </div>
                )}
            </div>
        </Card>
    )
}
