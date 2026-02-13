
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Truck,
    MapPin,
    Package,
    Calendar,
    ChevronRight,
    Box,
    CheckCircle2,
    Clock
} from "lucide-react"


export default function LogisticaPage() {
    const shipments = [
        {
            id: "TRK-2024-001",
            origin: "Santa Cruz, BO",
            destination: "La Paz, BO",
            status: "in_transit",
            progress: 65,
            estimated_delivery: "2024-03-25",
            carrier: "TransLogistics",
            type: "Terrestre",
            items: "20 Toneladas de Soya"
        },
        {
            id: "TRK-2024-002",
            origin: "Cochabamba, BO",
            destination: "Arica, CL",
            status: "processing",
            progress: 25,
            estimated_delivery: "2024-04-05",
            carrier: "Andes Cargo",
            type: "Terrestre/Marítimo",
            items: "5000 kg de Café"
        },
        {
            id: "TRK-2024-003",
            origin: "Tarija, BO",
            destination: "Buenos Aires, AR",
            status: "delivered",
            progress: 100,
            estimated_delivery: "2024-03-15",
            carrier: "Sur Express",
            type: "Terrestre",
            items: "1000 Cajas de Vino"
        }
    ]

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "in_transit":
                return { label: "En Tránsito", color: "bg-blue-500", icon: Truck }
            case "processing":
                return { label: "Procesando", color: "bg-yellow-500", icon: Box }
            case "delivered":
                return { label: "Entregado", color: "bg-green-500", icon: CheckCircle2 }
            default:
                return { label: "Pendiente", color: "bg-gray-500", icon: Clock }
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Truck className="w-8 h-8 text-primary" />
                        Logística y Envíos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona y rastrea tus envíos en tiempo real
                    </p>
                </div>
                <Button>
                    <Package className="mr-2 h-4 w-4" />
                    Nuevo Envío
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Envíos Activos</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            +2 desde la semana pasada
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entregados (Mes)</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">45</div>
                        <p className="text-xs text-muted-foreground">
                            +15% respecto al mes anterior
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3.2 días</div>
                        <p className="text-xs text-muted-foreground">
                            -0.5 días respecto al promedio
                        </p>
                    </CardContent>
                </Card>
            </div>

            <h2 className="text-xl font-semibold mt-8 mb-4">Envíos Recientes</h2>
            <div className="space-y-4">
                {shipments.map((shipment) => {
                    const status = getStatusInfo(shipment.status)
                    const StatusIcon = status.icon

                    return (
                        <Card key={shipment.id} className="overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    {/* Info Principal */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono">
                                                    {shipment.id}
                                                </Badge>
                                                <Badge className={`${status.color} hover:${status.color} text-white`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {status.label}
                                                </Badge>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                Carrier: <span className="font-medium text-foreground">{shipment.carrier}</span>
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-8 mb-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                                    <span className="font-semibold">{shipment.origin}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground pl-5">Origen</p>
                                            </div>
                                            <div className="flex-1 text-center hidden md:block">
                                                <div className="h-px bg-border w-full relative top-3">
                                                    <Truck className="w-4 h-4 text-primary absolute left-1/2 -translate-x-1/2 -top-2" />
                                                </div>
                                            </div>
                                            <div className="flex-1 text-right">
                                                <div className="flex items-center justify-end gap-2 mb-1">
                                                    <span className="font-semibold">{shipment.destination}</span>
                                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                                </div>
                                                <p className="text-xs text-muted-foreground pr-5">Destino</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Progreso del envío</span>
                                                <span className="font-medium">{shipment.progress}%</span>
                                            </div>
                                            <Progress value={shipment.progress} className="h-2" />
                                        </div>
                                    </div>

                                    {/* Detalles Lateral */}
                                    <div className="md:w-64 md:border-l pl-6 flex flex-col justify-center space-y-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Contenido:</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Box className="w-4 h-4 text-primary" />
                                                {shipment.items}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1">Entrega Estimada:</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-primary" />
                                                {shipment.estimated_delivery}
                                            </p>
                                        </div>
                                        <Button variant="outline" className="w-full mt-2">
                                            Ver Detalles Completos
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
