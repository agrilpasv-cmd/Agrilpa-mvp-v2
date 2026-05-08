import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { ChevronLeft, Package, MapPin, Calendar, Clock, Building, Eye, Target, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export const revalidate = 0 // Never cache, always dynamic so we can increment views

export default async function PedidoDetallePage({ params }: { params: { id: string } }) {
  const { id } = params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Increment view count using the RPC function
  await supabase.rpc('increment_purchase_request_views', { request_id: id })

  // Fetch the request data
  const { data: request, error } = await supabase
    .from("purchase_requests")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !request) {
    notFound()
  }

  const expiresAt = new Date(request.expires_at)
  const nowDate = new Date()
  const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24)))

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getUnitLabel = (unit: string) => {
    const labels: Record<string, string> = {
      kg: "kg",
      ton: "toneladas",
      lb: "libras",
      quintales: "quintales",
      unidades: "unidades",
      contenedores: "contenedores",
    }
    return labels[unit] || unit
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/pedidos">
          <button className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:underline mb-8 font-medium transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Volver a pedidos
          </button>
        </Link>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Target className="w-3.5 h-3.5 mr-1.5" />
                Solicitud Activa
              </span>
              <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                <span className="flex items-center gap-1.5" title="Visualizaciones">
                  <Eye className="w-4 h-4 text-slate-400" />
                  {request.views_count || 0} vistas
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Publicado el {formatDate(request.created_at)}
                </span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-6">
              {request.product_name}
            </h1>

            <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <Clock className={`w-5 h-5 ${daysRemaining < 7 ? 'text-red-500' : daysRemaining < 30 ? 'text-amber-500' : 'text-emerald-500'}`} />
              Esta solicitud expira en <span className={daysRemaining < 7 ? 'text-red-600' : daysRemaining < 30 ? 'text-amber-600' : 'text-emerald-600'}>{daysRemaining} días</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-4">Detalles del Requerimiento</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Categoría</p>
                      <p className="text-base font-semibold text-slate-900">{request.category}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Cantidad Solicitada</p>
                      <p className="text-base font-semibold text-slate-900">{request.quantity} {getUnitLabel(request.unit)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Destino de Entrega</p>
                      <p className="text-base font-semibold text-slate-900">
                        {request.country}{request.delivery_state ? `, ${request.delivery_state}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {request.description && (
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-3">Descripción Adicional</h3>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">
                    {request.description}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-emerald-900 mb-2">¿Puedes proveer este producto?</h3>
                <p className="text-emerald-700 text-sm mb-6">
                  Contacta directamente con el comprador para enviar tu cotización y detalles de disponibilidad.
                </p>
                
                <div className="space-y-3">
                  <Button className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all rounded-xl">
                    Contactar Comprador
                  </Button>
                </div>
                
                <div className="mt-4 flex items-start gap-2 text-xs text-emerald-600/80">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>Al contactar, asegúrate de cumplir con los requisitos especificados por el comprador.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
