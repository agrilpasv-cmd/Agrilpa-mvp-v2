"use client"

import React, { useState, useEffect } from "react"
import { 
  Activity, 
  Users, 
  Database,
  Code,
  AlertCircle,
  FileText,
  Weight,
  CheckCircle,
  Globe2,
  TrendingDown
} from "lucide-react"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// Nuevos Mock Data Agrícolas
export interface EscasezData {
  categoria: string;
  demandaBuscada: number;
  ofertaActual: number;
  nivelEscasez: 'Crítica' | 'Alta' | 'Moderada' | 'Baja';
}

const shortageDataMock: EscasezData[] = [
  { categoria: "Fertilizantes Orgánicos", demandaBuscada: 1250, ofertaActual: 200, nivelEscasez: 'Crítica' },
  { categoria: "Maíz Amarillo (Ton)", demandaBuscada: 8500, ofertaActual: 3200, nivelEscasez: 'Alta' },
  { categoria: "Semillas de Girasol", demandaBuscada: 420, ofertaActual: 90, nivelEscasez: 'Crítica' },
  { categoria: "Fungicidas", demandaBuscada: 890, ofertaActual: 450, nivelEscasez: 'Moderada' },
]

export interface CountryData {
  pais: string;
  bandera: string;
  compradores: number;
  vendedores: number;
}

const countryDataMock: CountryData[] = [
  { pais: "México", bandera: "🇲🇽", compradores: 450, vendedores: 320 },
  { pais: "Colombia", bandera: "🇨🇴", compradores: 320, vendedores: 210 },
  { pais: "Perú", bandera: "🇵🇪", compradores: 280, vendedores: 190 },
  { pais: "Argentina", bandera: "🇦🇷", compradores: 150, vendedores: 420 }, // Fuerte exportador
]

// Estado inicial vacío o de carga
export default function AnaliticaPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const [metrics, setMetrics] = useState({
    totalCotizaciones: 0,
    pedidosAtendidosRatio: 0,
    volumenTotal: 0,
    totalUsuarios: 0
  })
  
  const [retentionData, setRetentionData] = useState<any[]>([])
  const [funnelData, setFunnelData] = useState<any[]>([])
  const [shortageData, setShortageData] = useState<EscasezData[]>([])
  const [countryData, setCountryData] = useState<CountryData[]>([])

  useEffect(() => {
    setMounted(true)
    
    // Fetch live data from API
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analitica')
        if (res.ok) {
          const data = await res.json()
          setMetrics(data.metrics)
          setCountryData(data.topCountries)
          setShortageData(data.shortageData)
          setFunnelData(data.funnelData)
          setRetentionData(data.retentionData)
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAnalytics()
  }, [])

  if (!mounted) return null

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analítica y Comportamiento</h1>
          <p className="text-muted-foreground">Mide la retención, engagement y eventos clave del MVP.</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard Visual</TabsTrigger>
          <TabsTrigger value="arquitectura">Arquitectura e Integración</TabsTrigger>
        </TabsList>

        {/* --- 2. COMPONENTES VISUALES DEL DASHBOARD --- */}
        <TabsContent value="dashboard" className="space-y-6 mt-6">
          {/* Tarjetas de Métricas Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="relative">
              <div className="absolute top-3 right-3 text-muted-foreground/50 hover:text-primary transition-colors cursor-help group z-20">
                <AlertCircle className="w-4 h-4" />
                <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Total de cotizaciones enviadas por los compradores a los productores a través del botón "Contactar" o el formulario general.
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start pr-6">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Cotizaciones</p>
                    <h3 className="text-3xl font-black mt-2">{loading ? "..." : metrics.totalCotizaciones}</h3>
                    <p className="text-sm text-green-600 mt-1 font-medium">Reales de Supabase</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-xl shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative">
              <div className="absolute top-3 right-3 text-muted-foreground/50 hover:text-blue-500 transition-colors cursor-help group z-20">
                <AlertCircle className="w-4 h-4" />
                <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Volumen total sumado de todas las solicitudes y cotizaciones. Te ayuda a entender el volumen de negocio moviéndose en Agrilpa.
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start pr-6">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Vol. Solicitado</p>
                    <h3 className="text-3xl font-black mt-2">{loading ? "..." : (metrics.volumenTotal / 1000).toFixed(1)}k <span className="text-lg text-muted-foreground font-medium">Ton</span></h3>
                    <p className="text-sm text-muted-foreground mt-1">Acumulado mensual</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl shrink-0">
                    <Weight className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative">
              <div className="absolute top-3 right-3 text-muted-foreground/50 hover:text-orange-500 transition-colors cursor-help group z-20">
                <AlertCircle className="w-4 h-4" />
                <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Porcentaje de las cotizaciones enviadas que recibieron respuesta y atención por parte del productor.
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start pr-6">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pedidos Atendidos</p>
                    <h3 className="text-3xl font-black mt-2">{loading ? "..." : metrics.pedidosAtendidosRatio}%</h3>
                    <p className={`text-sm mt-1 font-medium ${metrics.pedidosAtendidosRatio > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                      {metrics.pedidosAtendidosRatio > 50 ? "Buen porcentaje" : "Requiere atención"}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-xl shrink-0">
                    <CheckCircle className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white relative">
              <div className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors cursor-help group z-20">
                <AlertCircle className="w-4 h-4" />
                <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-white text-slate-900 text-xs rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-200">
                  Total acumulado de usuarios (compradores y vendedores) que han completado su registro en la plataforma.
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start pr-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Usuarios Registrados</p>
                    <h3 className="text-3xl font-black mt-2 text-white flex items-center gap-3">
                      {loading ? "..." : metrics.totalUsuarios}
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    </h3>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-xl">
                    <Users className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfica 1: Retención */}
            <Card className="relative">
              <div className="absolute top-4 right-4 text-muted-foreground/50 hover:text-primary transition-colors cursor-help group z-20">
                <AlertCircle className="w-5 h-5" />
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Muestra el total de usuarios nuevos que ingresan cada semana vs cuántos de esos usuarios regresan a la plataforma después de su primera visita.
                </div>
              </div>
              <CardHeader className="pr-12">
                <CardTitle>Frecuencia de Inicio de Sesión / Retención</CardTitle>
                <CardDescription>Usuarios totales vs Usuarios que regresan por semana.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground animate-pulse">Cargando métricas...</p>
                    </div>
                  ) : retentionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={retentionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="usuarios" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4 }} name="Nuevos Usuarios" />
                        <Line type="monotone" dataKey="retenidos" stroke="#16a34a" strokeWidth={3} dot={{ r: 4 }} name="Usuarios Retenidos" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin datos suficientes para graficar.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gráfica 2: Embudo de Conversión */}
            <Card className="relative">
              <div className="absolute top-4 right-4 text-muted-foreground/50 hover:text-primary transition-colors cursor-help group z-20">
                <AlertCircle className="w-5 h-5" />
                <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  Muestra en qué etapa de la plataforma pierdes usuarios. Ejemplo: De 1000 que entran, 750 ven categorías, pero solo 120 llegan a darle clic a Contactar. ¡El objetivo es hacer esa bajada menos pronunciada!
                </div>
              </div>
              <CardHeader className="pr-12">
                <CardTitle>Embudo de Conversión (Funnel)</CardTitle>
                <CardDescription>Flujo de usuarios desde la Landing Page hasta el contacto.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground animate-pulse">Cargando embudo...</p>
                    </div>
                  ) : funnelData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={funnelData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                        <XAxis type="number" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={120} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="usuarios" radius={[0, 6, 6, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin datos suficientes para graficar.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- Tablas B2B Agrícolas --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-500" /> Intereses y Escasez Real
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Productos ingresados en el registro (Compradores vs Vendedores).
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shortageData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-sm text-foreground">{item.categoria}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">Demanda: <strong className="text-foreground">{item.demandaBuscada}</strong></span>
                          <span className="text-xs text-muted-foreground">Oferta: <strong className="text-foreground">{item.ofertaActual}</strong></span>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.nivelEscasez === 'Crítica' ? 'bg-red-100 text-red-700' :
                        item.nivelEscasez === 'Alta' ? 'bg-orange-100 text-orange-700' :
                        item.nivelEscasez === 'Moderada' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {item.nivelEscasez}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Globe2 className="w-5 h-5 text-blue-500" /> Top Países por Actividad
                  </CardTitle>
                  <CardDescription className="mt-1">Compradores vs Vendedores por país.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {countryData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.bandera}</span>
                        <p className="font-bold text-sm text-foreground">{item.pais}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Compradores</p>
                          <p className="font-bold text-sm text-foreground">{item.compradores}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Vendedores</p>
                          <p className="font-bold text-sm text-foreground">{item.vendedores}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- 1 y 3. ARQUITECTURA DE DATOS E INTEGRACIÓN --- */}
        <TabsContent value="arquitectura" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" /> 1. Arquitectura de Datos (SQL)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-sm mb-2">Alteración a tabla 'users':</h4>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-xl text-xs overflow-x-auto">
{`-- Para rastrear sesiones
ALTER TABLE public.users 
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN session_count INTEGER DEFAULT 0;`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-2">Nueva tabla 'user_events':</h4>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-xl text-xs overflow-x-auto">
{`CREATE TABLE public.user_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id TEXT, -- Para rastrear usuarios anónimos
  event_name TEXT NOT NULL, -- ej: 'click_boton_cotizar'
  event_properties JSONB DEFAULT '{}'::jsonb, -- Datos extra
  url_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para analítica rápida
CREATE INDEX idx_user_events_name ON public.user_events(event_name);
CREATE INDEX idx_user_events_created ON public.user_events(created_at);`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm mb-2">Interfaces TypeScript:</h4>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-xl text-xs overflow-x-auto">
{`export interface UserEvent {
  id: string;
  user_id?: string;
  session_id?: string;
  event_name: 'click_boton_cotizar' | 'formulario_pedido_enviado' | 'click_contactar_vendedor';
  event_properties: Record<string, any>;
  url_path: string;
  created_at: string;
}`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" /> 3. Integración de PostHog/Clarity
                </CardTitle>
                <CardDescription>Para no sobrecargar tu BD SQL, usa un SDK externo.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Crea el archivo <code>components/analytics-provider.tsx</code> e impórtalo en tu <code>app/layout.tsx</code>.
                  </p>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-xl text-xs overflow-x-auto">
{`// components/analytics-provider.tsx
"use client"
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar PostHog (MVP)
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        capture_pageview: false, // Capturaremos manualmente en Next.js
        persistence: 'localStorage'
      })
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

// Para mapear un evento en un botón (Ej: Contactar Vendedor)
// <Button onClick={() => posthog.capture('click_contactar_vendedor', { productId: 123 })}>
//   Contactar
// </Button>`}
                  </pre>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mt-4">
                    <h4 className="font-bold text-yellow-800 text-sm">Integración con Microsoft Clarity</h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      Si prefieres mapas de calor visuales, solo necesitas pegar el script de Clarity en el componente <code>{`<head>`}</code> de tu <code>layout.tsx</code> global. Clarity capturará clics, scrolls y frustración automáticamente sin necesidad de enviar eventos manuales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
