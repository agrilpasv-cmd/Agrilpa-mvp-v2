"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Info, Calendar, RefreshCcw, Loader2 } from "lucide-react"

interface Commodity {
  id: string
  name: string
  unit: string
  date: string
  value: string
}

export default function MercadoPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/market/commodities")
        const data = await response.json()

        if (data.success) {
          setCommodities(data.data || [])
          setLastUpdated(data.lastUpdated)
        } else {
          setError(data.error || "No se pudieron obtener los precios.")
        }
      } catch (err) {
        console.error("Error fetching market data:", err)
        setError("Error de conexión al cargar los precios del mercado.")
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
  }, [])

  const getIcon = (id: string) => {
    switch (id) {
      case "ALL_COMMODITIES": return "🌐"
      case "WHEAT": return "🌾"
      case "CORN": return "🌽"
      case "COFFEE": return "☕"
      case "SUGAR": return "🍬"
      case "COTTON": return "👕"
      case "MANGO": return "🥭"
      case "BEANS": return "🫘"
      case "STRAWBERRY": return "🍓"
      case "COCOA": return "🍫"
      default: return "📈"
    }
  }

  // Determine trend direction (mock logic for visual purposes, normally we'd compare with previous month)
  // For the MVP, we just assume trending up if value is positive (it always is, so we'll just show a generic trend icon)
  const TrendIcon = TrendingUp

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Mercado Global</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Sigue las tendencias y precios globales de las principales materias primas agrícolas. 
            Esta información es una referencia útil para tus negociaciones de compra y venta en Agrilpa.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 flex items-center gap-3 border border-red-200">
            <Info className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground font-medium">Obteniendo cotizaciones en tiempo real...</p>
          </div>
        ) : (
          <>
            {commodities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {commodities.map((item) => (
                  <Card key={item.id} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl" role="img" aria-label={item.name}>
                            {getIcon(item.id)}
                          </span>
                          <h3 className="font-bold text-xl text-card-foreground">{item.name}</h3>
                        </div>
                        <div className="bg-primary/10 text-primary p-2 rounded-full">
                          <TrendIcon className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">{item.unit}</p>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-extrabold text-foreground">
                            {item.value}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Mes de ref: {item.date}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground">No se encontraron datos de mercado en este momento.</p>
              </div>
            )}

            {lastUpdated && (
              <div className="mt-12 p-5 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center text-sm text-blue-800">
                <Info className="w-6 h-6 shrink-0 text-blue-500" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">Acerca de estos datos</p>
                  <p className="text-blue-700/80">
                    Los precios mostrados son referencias globales (índices o contratos de futuros) proporcionados por <strong>Alpha Vantage</strong>. 
                    Se actualizan diariamente y sirven como brújula orientativa, pero no garantizan ni establecen los precios finales de venta directa en la plataforma.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-blue-600 bg-white/60 px-3 py-1.5 rounded-full whitespace-nowrap border border-blue-100">
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Caché: 24h</span>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
