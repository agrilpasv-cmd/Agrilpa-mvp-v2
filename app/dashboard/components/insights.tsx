"use client"

import { Card } from "@/components/ui/card"
import { Lightbulb, Info } from "lucide-react"

interface InsightsProps {
    activityType: 'empty' | 'buyer' | 'seller' | 'mixed'
    data?: {
        seller?: any
        buyer?: any
    }
}

export function Insights({ activityType, data }: InsightsProps) {
    if (activityType === 'empty') return null

    const insights = []

    // Add null coalescing to prevent "Object is possibly undefined"
    const sellerQuotesPending = data?.seller?.quotes_pending || 0
    const buyerRequestsSent = data?.buyer?.requests_sent || 0
    const buyerQuotesReceived = data?.buyer?.quotes_received || 0
    const sellerOrdersConfirmed = data?.seller?.orders_confirmed || 0

    if (sellerQuotesPending > 0) {
        insights.push({ id: 1, message: `Tienes ${sellerQuotesPending} cotizaciones sin responder. ¡Responde pronto para no perder la venta!` })
    }
    if (buyerRequestsSent > 0 && buyerQuotesReceived === 0) {
        insights.push({ id: 2, message: "Tus solicitudes han sido enviadas. Los vendedores suelen responder en las primeras 48 horas." })
    }
    if (sellerOrdersConfirmed > 0) {
        insights.push({ id: 3, message: "Asegúrate de actualizar el estado de envío de tus pedidos confirmados para mantener al comprador informado." })
    }

    // Default insight if none trigger
    if (insights.length === 0) {
        insights.push({ id: 4, message: "Mantén tu perfil e inventario actualizado para atraer más clientes." })
    }

    return (
        <Card className="p-6 bg-primary/5 mt-6 border-none">
            <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-primary">Insights</h3>
            </div>
            <div className="space-y-3">
                {insights.map((insight) => (
                    <div key={insight.id} className="flex items-start gap-3 bg-card p-3 rounded-lg border border-primary/10">
                        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-foreground">{insight.message}</p>
                    </div>
                ))}
            </div>
        </Card>
    )
}
