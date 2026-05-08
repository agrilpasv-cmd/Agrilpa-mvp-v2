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
}

const CATEGORY_ICONS: Record<string, string> = {
  "Granos y cereales": "🌾",
  "Frutas y vegetales": "🍎",
  "Café y cacao": "☕",
  "Especias y condimentos": "🌶️",
  "Aceites y grasas": "🫒",
  "Azúcar y endulzantes": "🍯",
  "Lácteos": "🥛",
  "Carnes y mariscos": "🥩",
  "Semillas y frutos secos": "🥜",
  "Productos orgánicos": "🌿",
  "Insumos agrícolas": "🧪",
  "Otro": "📦",
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
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 sm:py-24 flex flex-col items-center text-center">
          <div className="max-w-3xl w-full">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
              Solicitudes de <span className="text-primary">Compra</span>
            </h1>
            <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
              Explora pedidos activos de compradores verificados. Encuentra la oportunidad perfecta para tu negocio y conecta directamente.
            </p>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
              <div className="relative flex-1 max-w-xl mx-auto sm:mx-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar producto, categoría o país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-[46px] px-5 rounded-lg gap-2 text-gray-700 font-medium bg-white border-gray-300 hover:bg-gray-50 shrink-0"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
              <Link href="/solicitud-compra" className="shrink-0">
                <Button className="h-[46px] px-6 rounded-lg gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto shadow-sm shadow-primary/20">
                  <Plus className="w-4 h-4" />
                  Crear Solicitud
                </Button>
              </Link>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-6 flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    !selectedCategory
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Todas
                </button>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          <p className="text-sm font-medium text-gray-500">
            {isLoading ? "Cargando..." : `${filteredRequests.length} resultados`}
          </p>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory("")}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-xl max-w-3xl mx-auto">
            <Package className="w-10 h-10 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay solicitudes</h3>
            <p className="text-sm text-gray-500 mb-6">
              No encontramos pedidos que coincidan con tu búsqueda.
            </p>
            <Link href="/solicitud-compra">
              <Button className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20">
                Publicar una solicitud
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="group relative flex flex-col p-5 bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Header: Title & Badges */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex flex-col gap-2">
                    {/* Optional Badge instead of '1 pedido' or just PRO */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                        Solicitud Activa
                      </span>
                      {req.is_pro && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          PRO
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {req.product_name}
                    </h3>
                  </div>
                </div>
                
                {/* 2x2 Grid for Details */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-5 mb-6 flex-1">
                  {/* Category */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 border border-gray-100">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Categoría</p>
                      <p className="text-xs font-bold text-gray-800 truncate" title={req.category}>{req.category}</p>
                    </div>
                  </div>
                  
                  {/* Quantity */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 border border-gray-100">
                      <Package className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Cantidad</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{req.quantity} {getUnitLabel(req.unit)}</p>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 border border-gray-100">
                      <MapPin className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Ubicación</p>
                      <p className="text-xs font-bold text-gray-800 line-clamp-2" title={`${req.country}${req.delivery_state ? `, ${req.delivery_state}` : ""}`}>
                        {req.country}{req.delivery_state ? `, ${req.delivery_state}` : ""}
                      </p>
                    </div>
                  </div>
                  
                  {/* Published/Expires */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-gray-50 border border-gray-100">
                      <Calendar className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Publicado</p>
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {formatDate(req.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-primary bg-primary/5 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold tracking-wide">EXPIRA EN {req.days_remaining}D</span>
                  </div>
                  
                  <Link href={`/pedidos/${req.id}`}>
                    <Button className="h-8 px-4 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20 rounded-md">
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
