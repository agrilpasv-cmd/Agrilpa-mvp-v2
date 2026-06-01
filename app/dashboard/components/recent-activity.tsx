"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, CircleAlert, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface RecentActivityProps {
    activityType: 'empty' | 'buyer' | 'seller' | 'mixed'
    data?: any[]
}

export function RecentActivity({ activityType, data }: RecentActivityProps) {
    if (activityType === 'empty') return null

    const getIconForEvent = (isPositive?: boolean) => {
        if (isPositive === true) return <CheckCircle2 className="w-4 h-4 text-green-500" />
        if (isPositive === false) return <CircleAlert className="w-4 h-4 text-red-500" />
        return <Clock className="w-4 h-4 text-blue-500" />
    }

    const formatTime = (isoString: string) => {
        try {
            return formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: es })
        } catch {
            return "recientemente"
        }
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">Actividad Reciente</h3>
            <div className="relative border-l border-border ml-3 space-y-6">
                {data && data.length > 0 ? (
                    data.map((item) => (
                        <div key={item.id} className="relative pl-6">
                            <span className="absolute -left-3 top-1 bg-card border border-border rounded-full p-1 shadow-sm">
                                {getIconForEvent(item.isPositive)}
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-medium text-foreground">{item.text}</p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 sm:mt-0">
                                    {formatTime(item.time)}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground pl-4">No hay actividad reciente.</p>
                )}
            </div>
        </Card>
    )
}
