"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle2, MessageSquare, FileText, Truck, CircleAlert } from "lucide-react"

interface RecentActivityProps {
    activityType: 'empty' | 'buyer' | 'seller' | 'mixed'
    data?: any[]
}

export function RecentActivity({ activityType, data }: RecentActivityProps) {
    if (activityType === 'empty') return null

    const getIconForEvent = (iconType: string) => {
        switch (iconType) {
            case 'check': return <CheckCircle2 className="w-4 h-4 text-green-500" />
            case 'message': return <MessageSquare className="w-4 h-4 text-blue-500" />
            case 'file': return <FileText className="w-4 h-4 text-primary" />
            case 'truck': return <Truck className="w-4 h-4 text-orange-500" />
            default: return <CircleAlert className="w-4 h-4 text-muted-foreground" />
        }
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">Actividad Reciente</h3>
            <div className="relative border-l border-border ml-3 space-y-6">
                {data && data.length > 0 ? (
                    data.map((item, index) => (
                        <div key={item.id} className="relative pl-6">
                            <span className="absolute -left-3 top-1 bg-card border border-border rounded-full p-1 shadow-sm">
                                {getIconForEvent(item.icon)}
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-medium text-foreground">{item.event}</p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 sm:mt-0">
                                    {item.time}
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
