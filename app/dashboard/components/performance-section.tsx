"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp } from "lucide-react"

interface PerformanceSectionProps {
    activityType: 'empty' | 'buyer' | 'seller' | 'mixed'
    data?: any[]
}

export function PerformanceSection({ activityType, data }: PerformanceSectionProps) {
    if (activityType === 'empty' || activityType === 'buyer') return null

    const performanceData = data || []

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Rendimiento de Productos</h3>
            </div>
            {performanceData.length > 0 ? (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Producto</TableHead>
                                <TableHead className="text-right">Vistas</TableHead>
                                <TableHead className="text-right">Solicitudes</TableHead>
                                <TableHead className="text-right">Conversión</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {performanceData.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium text-muted-foreground">{item.producto}</TableCell>
                                    <TableCell className="text-right text-foreground font-semibold">{item.vistas}</TableCell>
                                    <TableCell className="text-right text-foreground font-semibold">{item.solicitudes}</TableCell>
                                    <TableCell className="text-right text-green-600 font-semibold">{item.conversion}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">Aún no hay datos de rendimiento suficientes para mostrar.</p>
            )}
        </Card>
    )
}
