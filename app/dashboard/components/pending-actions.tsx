"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Clock } from "lucide-react"

interface PendingActionsProps {
    activityType: 'empty' | 'buyer' | 'seller' | 'mixed'
    data?: any[]
}

export function PendingActions({ activityType, data }: PendingActionsProps) {
    if (activityType === 'empty' || !data || data.length === 0) {
        return null; // Don't show if no actions or empty state
    }

    const getIconForType = (type: string) => {
        switch (type) {
            case 'urgent': return <AlertCircle className="w-5 h-5 text-red-500" />
            case 'warning': return <Clock className="w-5 h-5 text-orange-500" />
            default: return <AlertCircle className="w-5 h-5 text-blue-500" />
        }
    }

    return (
        <Card className="p-6 mb-8 border-t-4 border-t-primary/70">
            <h3 className="text-lg font-bold text-foreground mb-4">Acciones Pendientes</h3>
            <div className="space-y-4">
                {data.map((action) => (
                    <div key={action.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                        <div className="flex items-start gap-3 mb-4 sm:mb-0">
                            <div className="mt-0.5">
                                {getIconForType(action.type)}
                            </div>
                            <div>
                                <h4 className="font-semibold text-foreground">{action.title}</h4>
                                <p className="text-sm text-muted-foreground">{action.description}</p>
                            </div>
                        </div>
                        <Button size="sm" variant={action.type === 'alert' ? 'default' : 'secondary'} asChild>
                            <a href={action.actionLink}>{action.actionText}</a>
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    )
}
