"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Search,
  Package,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  Plus,
  Filter,
  ChevronDown,
  Building,
  ShieldCheck,
  Eye,
} from "lucide-react"
import { PRODUCT_CATEGORIES } from "@/lib/constants"

interface PurchaseRequest {
  id: string
  product_name: string
  category: string
  quantity: string
  unit: string
  country: string
  delivery_state: string
  delivery_address: string
  image_url: string | null
  specs: string | null
  source_type: string
  desired_date: string | null
  created_at: string
  expires_at: string
  days_remaining: number
  is_pro: boolean
  views_count: number
}

export default function PedidosPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<PurchaseRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/pedidos")
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error("Error fetching pedidos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.country && req.country.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = !selectedCategory || req.category === selectedCategory

    return matchesSearch && matchesCategory
  })

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
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 sm:py-24 flex flex-col items-center text-center">
          <div className="max-w-4xl w-full">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-primary tracking-tight mb-4">
              Solicitudes de Compra
            </h1>
            <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
              Explora pedidos activos de compradores verificados. Encuentra la oportunidad perfecta para tu negocio y conecta directamente.
            </p>

            {/* Search and Quick Filters */}
            <div className="flex flex-col gap-6 w-full">
              <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto, categoría o país..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white shadow-sm text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-[52px] px-6 rounded-xl gap-2 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0"
                >
                  <Filter className="w-4 h-4" />
                  Más Filtros
                </Button>
                <Link href="/solicitud-compra" className="shrink-0">
                  <Button variant="outline" className="h-[52px] px-6 rounded-xl gap-2 font-semibold border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Crear Solicitud
                  </Button>
                </Link>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    !selectedCategory
                      ? "bg-primary border-primary text-primary-foreground shadow-sm"
                      : "bg-white border-gray-200 text-slate-600 hover:bg-slate-50 hover:border-gray-300"
                  }`}
                >
                  Todas
                </button>
                {/* 4 Popular Categories for Quick Filters */}
                {["Frutas", "Vegetales", "Granos y Cereales", "Carnes y Mariscos"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      selectedCategory === cat
                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                        : "bg-white border-gray-200 text-slate-600 hover:bg-slate-50 hover:border-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Extended Filters */}
            {showFilters && (
              <div className="mt-3 flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {PRODUCT_CATEGORIES.filter(c => !["Frutas", "Vegetales", "Granos y Cereales", "Carnes y Mariscos"].includes(c)).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      selectedCategory === cat
                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                        : "bg-white border-gray-200 text-slate-600 hover:bg-slate-50 hover:border-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-medium text-slate-500">
            {isLoading ? "Cargando..." : `${filteredRequests.length} resultados`}
          </p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory("")}
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-xl max-w-3xl mx-auto shadow-sm">
            <Package className="w-10 h-10 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No hay solicitudes</h3>
            <p className="text-sm text-slate-500 mb-6">
              No encontramos pedidos que coincidan con tu búsqueda.
            </p>
            <Link href="/solicitud-compra">
              <Button className="rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20">
                Publicar una solicitud
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="group relative flex flex-col p-6 bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-400/50 hover:shadow-md transition-all duration-300"
              >
                {/* Header: Title & Badges */}
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Comprador Verificado
                    </span>
                    {req.is_pro && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        PRO
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {req.product_name}
                  </h3>
                </div>
                
                {/* Metadata 2x2 Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-6 flex-1">
                  {/* Category */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="shrink-0 mt-0.5">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Categoría</p>
                      <p className="text-xs font-bold text-slate-800 truncate" title={req.category}>{req.category}</p>
                    </div>
                  </div>
                  
                  {/* Quantity */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="shrink-0 mt-0.5">
                      <Building className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Cantidad</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{req.quantity} {getUnitLabel(req.unit)}</p>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Ubicación</p>
                      <p className="text-xs font-bold text-slate-800 line-clamp-2" title={`${req.country}${req.delivery_state ? `, ${req.delivery_state}` : ""}`}>
                        {req.country}{req.delivery_state ? `, ${req.delivery_state}` : ""}
                      </p>
                    </div>
                  </div>
                  
                  {/* Published */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Publicado</p>
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {formatDate(req.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer with progress bar */}
                <div className="mt-auto pt-5 border-t border-gray-100 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Expira en {req.days_remaining} días
                      </span>
                      <span className="flex items-center gap-1.5" title="Visualizaciones">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {req.views_count || 0}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${req.days_remaining < 7 ? 'bg-red-500' : req.days_remaining < 30 ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.max(5, (req.days_remaining / 90) * 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  <Link href={`/pedidos/${req.id}`} className="w-full">
                    <Button className="w-full h-10 text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 rounded-lg group-hover:bg-emerald-700 transition-colors">
                      Ver Detalles
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

