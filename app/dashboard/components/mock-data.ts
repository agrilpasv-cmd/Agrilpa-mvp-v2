// app/dashboard/components/mock-data.ts

export type UserActivityType = 'seller' | 'buyer' | 'mixed' | 'empty';

export const getMockActivityData = (type: UserActivityType) => {
    switch (type) {
        case 'seller':
            return {
                hasProducts: true,
                hasRequests: false,
                kpis: {
                    cotizacionesRecibidas: 12,
                    pendientesResponder: 3,
                    pedidosConfirmados: 5,
                    valorNegociacion: 45000
                },
                pendingActions: [
                    { id: '1', title: 'Responder cotización', description: 'Cotización #1042 de AgriCorp necesita respuesta', type: 'urgent', actionLabel: 'Responder' },
                    { id: '2', title: 'Confirmar pedido', description: 'El pedido #992 está listo para ser despachado', type: 'normal', actionLabel: 'Confirmar' }
                ],
                pipeline: {
                    solicitud: 10,
                    cotizacion: 5,
                    negociacion: 2,
                    pedido: 5
                },
                recentActivity: [
                    { id: '1', event: 'Cotización aceptada', time: 'Hace 2 horas', icon: 'check' },
                    { id: '2', event: 'Mensaje recibido de AgriCorp', time: 'Hace 5 horas', icon: 'message' },
                    { id: '3', event: 'Solicitud recibida', time: 'Ayer', icon: 'file' }
                ],
                performance: [
                    { id: '1', producto: 'Café de Especialidad Typica', vistas: 342, solicitudes: 12, conversion: 3.5 },
                    { id: '2', producto: 'Cacao Fino de Aroma', vistas: 289, solicitudes: 8, conversion: 2.7 },
                    { id: '3', producto: 'Miel Orgánica', vistas: 156, solicitudes: 4, conversion: 2.5 }
                ],
                insights: [
                    { id: '1', message: 'Responder en menos de 2 horas aumenta tus cierres en un 40%.', type: 'tip' },
                    { id: '2', message: 'Tu producto "Café Oro" tuvo 150 vistas esta semana.', type: 'info' }
                ]
            };
        case 'buyer':
            return {
                hasProducts: false,
                hasRequests: true,
                kpis: {
                    solicitudesEnviadas: 8,
                    cotizacionesRecibidas: 4,
                    pedidosProceso: 2,
                    totalComprado: 12500
                },
                pendingActions: [
                    { id: '1', title: 'Revisar oferta recibida', description: 'Oferta para "Cacao Fino" recibida de Finca El Paraíso', type: 'urgent', actionLabel: 'Revisar' },
                    { id: '2', title: 'Completar información de envío', description: 'Falta dirección para el pedido #105', type: 'warning', actionLabel: 'Completar' }
                ],
                pipeline: {
                    solicitudEnviada: 8,
                    ofertaRecibida: 4,
                    aceptada: 2,
                    pedido: 2
                },
                recentActivity: [
                    { id: '1', event: 'Oferta recibida de Finca El Paraíso', time: 'Hace 1 hora', icon: 'file' },
                    { id: '2', event: 'Pedido #105 actualizado a "En Tránsito"', time: 'Ayer', icon: 'truck' }
                ],
                insights: [
                    { id: '1', message: 'Hay 3 nuevos proveedores de Cacao en tu región.', type: 'info' }
                ]
            };
        case 'mixed':
            return {
                hasProducts: true,
                hasRequests: true,
                kpis: {
                    // Seller
                    cotizacionesRecibidas: 5,
                    pendientesResponder: 1,
                    valorNegociacion: 15000,
                    // Buyer
                    solicitudesEnviadas: 3,
                    pedidosProceso: 1,
                },
                pendingActions: [
                    { id: '1', title: 'Responder cotización', description: 'Cotización #120 necesita respuesta', type: 'urgent', actionLabel: 'Responder' },
                    { id: '2', title: 'Revisar oferta recibida', description: 'Oferta para compra de fertilizante', type: 'normal', actionLabel: 'Revisar' }
                ],
                pipeline: {
                    // Mixed representation could show a unified view or tabs, for now we simplified data
                    ventasActivas: 6,
                    comprasActivas: 4
                },
                recentActivity: [
                    { id: '1', event: 'Cotización recibida', time: 'Hace 30 min', icon: 'file' },
                    { id: '2', event: 'Oferta recibida', time: 'Hace 2 horas', icon: 'file' }
                ],
                performance: [
                    { id: '1', producto: 'Café de Especialidad Typica', vistas: 342, solicitudes: 12, conversion: 3.5 },
                    { id: '2', producto: 'Fertilizante Orgánico', vistas: 120, solicitudes: 2, conversion: 1.6 }
                ],
                insights: [
                    { id: '1', message: 'Gestionar ventas y compras en la misma plataforma acelera tu flujo de caja.', type: 'tip' }
                ]
            };
        case 'empty':
        default:
            return {
                hasProducts: false,
                hasRequests: false,
                kpis: {},
                pendingActions: [],
                pipeline: {},
                recentActivity: [],
                performance: [],
                insights: []
            };
    }
}
