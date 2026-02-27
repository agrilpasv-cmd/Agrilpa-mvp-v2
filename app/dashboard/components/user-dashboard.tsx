"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Search } from "lucide-react"
import { DynamicKpis } from "./dynamic-kpis"
import { PendingActions } from "./pending-actions"
import { Pipeline } from "./pipeline"
import { RecentActivity } from "./recent-activity"
import { Insights } from "./insights"
import { PerformanceSection } from "./performance-section"

export interface DashboardData {
    activityType: 'empty' | 'buyer' | 'seller' | 'mixed'
    seller: any
    buyer: any
    pipelineVentas: any
    pipelineCompras: any
    pendingActions: any[]
    performance: any[]
    recentActivity: any[]
}

export function UserDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const response = await fetch('/api/dashboard/dynamic-data', { cache: 'no-store' })
            if (response.ok) {
                const result = await response.json()
                setData(result)
            }
        } catch (e) {
            console.error("Dashboard fetch error:", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    const { activityType } = data;

    // Estado vacío (Call to Actions limpios)
    if (activityType === 'empty') {
        return (
            <div className="p-8 max-w-7xl mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl font-bold text-foreground mb-4">¡Bienvenido a Agrilpa!</h1>
                <p className="text-xl text-muted-foreground mb-12 max-w-2xl">
                    Comienza tu viaje en el principal marketplace B2B agrícola.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                    <div className="p-8 bg-card rounded-2xl border border-border shadow-sm flex flex-col items-center hover:shadow-lg transition-all">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <PlusCircle className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">Quiero Vender</h3>
                        <p className="text-muted-foreground mb-8 text-center text-lg">
                            Abre nuevos mercados globales.
                        </p>
                        <Button className="w-full text-lg py-6" asChild>
                            <Link href="/dashboard/mis-publicaciones/nueva">Publica tu primer producto</Link>
                        </Button>
                    </div>

                    <div className="p-8 bg-card rounded-2xl border border-border shadow-sm flex flex-col items-center hover:shadow-lg transition-all">
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">Quiero Comprar</h3>
                        <p className="text-muted-foreground mb-8 text-center text-lg">
                            Encuentra los mejores proveedores.
                        </p>
                        <Button variant="outline" className="w-full text-lg py-6 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white" asChild>
                            <Link href="/sourcing">Explora productos para comprar</Link>
                        </Button>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border w-full max-w-2xl text-sm text-muted-foreground">
                    Tu dashboard se configurará automáticamente cuando tengas actividad comercial.
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 bg-muted/10 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header  */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">Panel de Control</h1>
                        <p className="text-muted-foreground mt-1">Resumen de decisiones y estado comercial.</p>
                    </div>
                </div>

                {/* Zona 1: Acciones Pendientes (Lo más importante primero) */}
                <PendingActions activityType={activityType} data={data.pendingActions} />

                {/* Zona 2: KPIs y Métricas */}
                <DynamicKpis activityType={activityType} seller={data.seller} buyer={data.buyer} />

                {/* Zona 3: Visualización del Proceso / Pipeline */}
                <Pipeline activityType={activityType} pipelineVentas={data.pipelineVentas} pipelineCompras={data.pipelineCompras} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Zona 4: Rendimiento (Solo Vendedores) */}
                        {(activityType === 'seller' || activityType === 'mixed') && (
                            <PerformanceSection activityType={activityType} data={data.performance} />
                        )}
                        <RecentActivity activityType={activityType} data={data.recentActivity} />
                    </div>
                    <div>
                        {/* Zona 5: Insights */}
                        <Insights activityType={activityType} data={{ seller: data.seller, buyer: data.buyer }} />
                    </div>
                </div>

            </div>
        </div>
    )
}
