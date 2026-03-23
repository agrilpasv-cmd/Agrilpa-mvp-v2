"use client"

import Link from "next/link"
import { TrendingUp, Eye, ArrowRight } from "lucide-react"

interface PerformanceSectionProps {
    activityType: 'empty' | 'buyer' | 'seller' | 'mixed'
    data?: any[]
}

export function PerformanceSection({ activityType, data }: PerformanceSectionProps) {
    if (activityType === 'empty' || activityType === 'buyer') return null

    const performanceData = data || []
    const maxViews = performanceData.length > 0 ? Math.max(...performanceData.map((p: any) => p.vistas)) : 1

    const categoryColors: Record<string, string> = {
        'Frutas': 'bg-green-500',
        'Verduras': 'bg-emerald-400',
        'Cereales': 'bg-yellow-500',
        'Café': 'bg-amber-700',
        'Cacao': 'bg-orange-800',
        'Semillas': 'bg-lime-500',
        'Caña de azúcar': 'bg-yellow-300',
        'Algodón': 'bg-sky-300',
    }

    return (
        <div className="bg-white dark:bg-card rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-foreground">Productos Más Vistos</h3>
                        <p className="text-xs text-muted-foreground">Top 5 por rendimiento</p>
                    </div>
                </div>
                <Link href="/dashboard/mis-publicaciones" className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                    Ver todos <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {performanceData.length > 0 ? (
                <div className="space-y-5">
                    {performanceData.map((item: any, i: number) => {
                        const barWidth = maxViews > 0 ? (item.vistas / maxViews) * 100 : 0
                        const color = categoryColors[item.categoria] || 'bg-primary'
                        return (
                            <div key={item.id} className="group">
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate max-w-[160px]">{item.producto}</p>
                                            {item.categoria && (
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.categoria}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Eye className="w-3 h-3" />
                                            <span className="text-sm font-bold text-foreground">{item.vistas}</span>
                                        </div>
                                        {item.solicitudes > 0 && (
                                            <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                                                {item.solicitudes} sol.
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${color} rounded-full transition-all duration-700 group-hover:opacity-80`}
                                        style={{ width: `${barWidth}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Publica productos para ver su rendimiento aquí.</p>
                </div>
            )}
        </div>
    )
}
