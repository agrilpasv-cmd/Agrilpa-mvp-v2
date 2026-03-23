"use client"

import { TrendingUp, MessageSquare, Package, DollarSign, Activity, FileText, AlertCircle, CheckCircle } from 'lucide-react'

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

interface KpiCardProps {
    label: string
    value: string | number
    trend?: string
    trendPositive?: boolean
    icon: React.ReactNode
    accent: string
    iconBg: string
    urgent?: boolean
}

function KpiCard({ label, value, trend, trendPositive = true, icon, accent, iconBg, urgent }: KpiCardProps) {
    return (
        <div className={`relative bg-white dark:bg-card rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-300 overflow-hidden group ${urgent ? 'ring-2 ring-orange-400/50' : ''}`}>
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${accent}`} />

            {/* Urgent indicator */}
            {urgent && (
                <div className="absolute top-3 right-3">
                    <span className="flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
                    </span>
                </div>
            )}

            <div className="flex items-start justify-between mt-1">
                <div className="flex-1">
                    {trend && (
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mb-3 ${trendPositive ? 'bg-primary/10 text-primary' : 'bg-orange-100 text-orange-600'
                            }`}>
                            {trendPositive ? '↑' : '↗'} {trend}
                        </span>
                    )}
                    <p className="text-4xl font-black text-foreground tracking-tight leading-none mb-2">{value}</p>
                    <p className={`text-sm font-medium ${urgent ? 'text-orange-600' : 'text-muted-foreground'}`}>{label}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-4 ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

export function DynamicKpis({ activityType, seller, buyer }: DynamicKpisProps) {
    if (activityType === 'empty') return null

    const renderSellerKpis = () => (
        <>
            <KpiCard
                label="Cotizaciones (últimos 7 días)"
                value={seller?.quotes_received_7d ?? 0}
                trend="últimos 7 días"
                trendPositive={true}
                icon={<MessageSquare className="w-6 h-6 text-primary" />}
                accent="bg-primary"
                iconBg="bg-primary/10"
            />
            <KpiCard
                label="Cotizaciones pendientes de responder"
                value={seller?.quotes_pending ?? 0}
                trend={(seller?.quotes_pending ?? 0) > 0 ? "Requieren atención" : undefined}
                trendPositive={false}
                icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
                accent="bg-orange-400"
                iconBg="bg-orange-100"
                urgent={(seller?.quotes_pending ?? 0) > 0}
            />
            <KpiCard
                label="Pedidos confirmados"
                value={seller?.orders_confirmed ?? 0}
                trend="Completados"
                trendPositive={true}
                icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                accent="bg-green-500"
                iconBg="bg-green-100"
            />
            <KpiCard
                label="Valor en negociación"
                value={seller?.valor_negociacion ?? "$0"}
                icon={<DollarSign className="w-6 h-6 text-blue-600" />}
                accent="bg-blue-500"
                iconBg="bg-blue-100"
            />
        </>
    )

    const renderBuyerKpis = () => (
        <>
            <KpiCard
                label="Solicitudes enviadas"
                value={buyer?.requests_sent ?? 0}
                icon={<FileText className="w-6 h-6 text-primary" />}
                accent="bg-primary"
                iconBg="bg-primary/10"
            />
            <KpiCard
                label="Cotizaciones recibidas"
                value={buyer?.quotes_received ?? 0}
                icon={<MessageSquare className="w-6 h-6 text-orange-600" />}
                accent="bg-orange-400"
                iconBg="bg-orange-100"
            />
            <KpiCard
                label="Pedidos en proceso"
                value={buyer?.orders_in_process ?? 0}
                icon={<Activity className="w-6 h-6 text-yellow-600" />}
                accent="bg-yellow-400"
                iconBg="bg-yellow-100"
            />
            <KpiCard
                label="Total comprado"
                value={buyer?.total_bought ?? "$0"}
                icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                accent="bg-green-500"
                iconBg="bg-green-100"
            />
        </>
    )

    return (
        <div className="flex flex-col gap-8">
            {(activityType === 'seller' || activityType === 'mixed') && (
                <div>
                    {activityType === 'mixed' && (
                        <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">Métricas de Ventas</h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {renderSellerKpis()}
                    </div>
                </div>
            )}
            {(activityType === 'buyer' || activityType === 'mixed') && (
                <div>
                    {activityType === 'mixed' && (
                        <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">Métricas de Compras</h3>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {renderBuyerKpis()}
                    </div>
                </div>
            )}
        </div>
    )
}
