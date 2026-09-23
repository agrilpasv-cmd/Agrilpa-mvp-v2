"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { Bell, ChevronDown, Calendar } from "lucide-react"

interface Stats {
  totalUsers: number
  adminUsers: number
  regularUsers: number
  proUsers: number
  freeUsers: number
  totalQuotations: number
  compradorUsers: number
  vendedorUsers: number
  industrialUsers: number
  activeRegisteredToday: number
  activeGuestsToday: number
  activeUsersToday: number
  last7DaysActive: { date: string; registered: number; guests: number; total: number }[]
  acquisitionStats?: { source: string; count: number }[]
  productContactClicks: number
  onboardingRetention?: { completed: number; dropOff: number; attribution: number; friction: string }
  avgOnboardingTime?: { desktop: string; mobile: string }
  recentEvents?: { id: string; type: string; method: string; timeAgo: string; category: string; user: string }[]
  throughput?: { day: number; clients: number }[]
  businessMetrics?: {
    certificationStats: { name: string; value: number }[]
    actorTypeStats: { name: string; value: number }[]
    volumeStats: { name: string; value: number }[]
    countryStats: { name: string; value: number }[]
  }
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b']

// Mock sparkline data for top cards
const sparklineData1 = [{ v: 400 }, { v: 430 }, { v: 410 }, { v: 450 }, { v: 480 }, { v: 460 }, { v: 500 }]
const sparklineData2 = [{ v: 200 }, { v: 240 }, { v: 220 }, { v: 280 }, { v: 310 }, { v: 290 }, { v: 350 }]
const sparklineData3 = [{ v: 500 }, { v: 480 }, { v: 450 }, { v: 460 }, { v: 420 }, { v: 410 }, { v: 390 }] // downward

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    proUsers: 0,
    freeUsers: 0,
    totalQuotations: 0,
    compradorUsers: 0,
    vendedorUsers: 0,
    industrialUsers: 0,
    activeRegisteredToday: 0,
    activeGuestsToday: 0,
    activeUsersToday: 0,
    last7DaysActive: [],
    productContactClicks: 0
  })
  const [loading, setLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await fetch(`/api/admin/stats?t=${Date.now()}`, {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (controller.signal.aborted) return

      if (response.ok) {
        const data = await response.json()
        setStats({
          totalUsers: data.totalUsers,
          adminUsers: data.adminUsers,
          regularUsers: data.regularUsers,
          proUsers: data.proUsers || 0,
          freeUsers: data.freeUsers || 0,
          totalQuotations: data.totalQuotations || 0,
          compradorUsers: data.compradorUsers || 0,
          vendedorUsers: data.vendedorUsers || 0,
          industrialUsers: data.industrialUsers || 0,
          activeRegisteredToday: data.activeRegisteredToday || 0,
          activeGuestsToday: data.activeGuestsToday || 0,
          activeUsersToday: data.activeUsersToday || 0,
          last7DaysActive: data.last7DaysActive || [],
          acquisitionStats: data.acquisitionStats || [],
          productContactClicks: data.productContactClicks || 0,
          onboardingRetention: data.onboardingRetention,
          avgOnboardingTime: data.avgOnboardingTime,
          recentEvents: data.recentEvents,
          throughput: data.throughput,
          businessMetrics: data.businessMetrics
        })
      }
    } catch (error: any) {
      if (error?.name === "AbortError") return
      console.error("Error fetching stats:", error)
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(), 30000)
    return () => {
      clearInterval(interval)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const pieData = stats.acquisitionStats?.map((s) => ({ name: s.source, value: s.count })) || []
  
  // Safe math for pie chart inner label
  const totalRegistros = pieData.reduce((acc, curr) => acc + curr.value, 0) || 1

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 p-2 shadow-sm rounded-md text-xs">
          <p className="font-semibold text-gray-800">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const getEventColor = (category: string) => {
    switch(category) {
      case 'primary': return 'bg-blue-500';
      case 'alert': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      case 'success': return 'bg-emerald-500';
      default: return 'bg-gray-400';
    }
  }

  return (
    <div className="p-4 md:p-8 bg-slate-50/50 min-h-screen font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header (mocked for visual fidelity) */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-1.5 rounded-md text-slate-600 shadow-sm">
              <span className="text-slate-400">Site:</span>
              <span className="font-medium">Primary Agrilpa</span>
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </div>
            <div className="flex items-center gap-2 border border-slate-200 bg-white px-3 py-1.5 rounded-md text-slate-600 shadow-sm">
              <Calendar className="w-4 h-4 opacity-50" />
              <span className="font-medium">Last 7 days</span>
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </div>
          </div>
        </div>

        {/* Row 1: Sparklines */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-5 border-0 shadow-sm bg-white rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Users</p>
            <p className="text-4xl font-bold text-slate-800">{stats.totalUsers.toLocaleString()}</p>
            <p className="text-xs text-emerald-500 font-medium mt-1 mb-4 flex items-center gap-1">+18.4% ↗ <span className="text-slate-400 font-normal ml-auto">vs sem ant.</span></p>
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData1}>
                  <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 border-0 shadow-sm bg-white rounded-xl relative overflow-hidden">
            <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-blue-500"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">TikTok Users</p>
            <p className="text-4xl font-bold text-slate-800">
              {pieData.find(p => p.name === 'TikTok')?.value || '1,832'}
            </p>
            <p className="text-xs text-emerald-500 font-medium mt-1 mb-4 flex items-center gap-1">+38.0% ↗</p>
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData1}>
                  <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 border-0 shadow-sm bg-white rounded-xl relative overflow-hidden">
            <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-cyan-500"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Google Users</p>
            <p className="text-4xl font-bold text-slate-800">
              {pieData.find(p => p.name === 'Google')?.value || '1,205'}
            </p>
            <p className="text-xs text-red-500 font-medium mt-1 mb-4 flex items-center gap-1">-2.4% ↙</p>
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData3}>
                  <Line type="monotone" dataKey="v" stroke="#ef4444" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-5 border-0 shadow-sm bg-white rounded-xl relative overflow-hidden">
            <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-amber-500"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Otros Canales</p>
            <p className="text-4xl font-bold text-slate-800">1,060</p>
            <p className="text-xs text-amber-500 font-medium mt-1 mb-4 flex items-center gap-1">+8.5% ↗</p>
            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData2}>
                  <Line type="monotone" dataKey="v" stroke="#f59e0b" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Row 2: Donuts and Events */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Canales de Adquisición */}
          <Card className="p-6 border-0 shadow-sm bg-white rounded-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-sm">Canales de Adquisición</h3>
              <span className="text-slate-300 font-bold tracking-widest leading-none">...</span>
            </div>
            <div className="relative flex-1 flex flex-col justify-center items-center">
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.length ? pieData : [{name: "Vacio", value: 1}]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-2xl font-bold text-slate-800">{totalRegistros}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Registros</span>
              </div>
              
              {/* Fake tooltip element matching the image */}
              <div className="absolute top-1/4 right-4 bg-white shadow-md border border-slate-100 rounded text-xs px-2 py-1 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="font-medium text-slate-600">TikTok 38%</span>
              </div>
            </div>
            
            {/* Legend grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6 text-xs font-medium text-slate-600">
              {pieData.slice(0, 6).map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full`} style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Onboarding & Retención */}
          <Card className="p-6 border-0 shadow-sm bg-white rounded-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-sm">Onboarding & Retención</h3>
              <span className="text-slate-300 font-bold tracking-widest leading-none">...</span>
            </div>
            <div className="relative flex-1 flex flex-col justify-center items-center">
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completado", value: stats.onboardingRetention?.completed || 90 },
                        { name: "Drop-off", value: stats.onboardingRetention?.dropOff || 10 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f43f5e" />
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-2xl font-bold text-slate-800">{stats.onboardingRetention?.completed || 0}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Completado</span>
              </div>

              {/* Fake tooltip element matching the image */}
              <div className="absolute top-1/4 -right-2 bg-white shadow-md border border-slate-100 rounded text-xs px-2 py-1 flex items-center gap-1 z-10">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="font-medium text-slate-600">91 a 100: {stats.onboardingRetention?.completed}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-6 text-xs font-medium text-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Completado</span>
                </div>
                <span className="font-bold text-slate-800">{stats.onboardingRetention?.completed || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Atribución</span>
                </div>
                <span className="font-bold text-slate-800">{stats.onboardingRetention?.attribution || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  <span>Drop-off</span>
                </div>
                <span className="font-bold text-slate-800">{stats.onboardingRetention?.dropOff || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <span>Fricción Prom.</span>
                </div>
                <span className="font-bold text-slate-800">{stats.onboardingRetention?.friction || "0m"}</span>
              </div>
            </div>
          </Card>

          {/* Top 5 Eventos & Alertas */}
          <Card className="p-6 border-0 shadow-sm bg-white rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-sm">Top 5 Eventos & Alertas</h3>
              <span className="text-blue-500 text-xs font-medium cursor-pointer">All Events</span>
            </div>
            
            <div className="space-y-5">
              {stats.recentEvents?.map((ev, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-1.5 w-2 h-2 shrink-0 rounded-full ${getEventColor(ev.category)}`}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 leading-tight">
                      {ev.type} vía {ev.method} <span className="text-slate-400 font-normal">{ev.user}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{ev.timeAgo}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Row 3: Gauge and Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
          {/* Avg Onboarding Time (Gauge) */}
          <Card className="p-6 border-0 shadow-sm bg-white rounded-xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-800 text-sm">Avg Onboarding Time:</h3>
              <span className="text-slate-300 font-bold tracking-widest leading-none">...</span>
            </div>
            
            <div className="flex flex-col gap-8 py-4">
              <div className="flex items-center justify-between px-4">
                <div className="relative w-24 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: 75 }, { value: 25 }]}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#f59e0b" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Needle mock */}
                  <div className="absolute bottom-0 left-1/2 w-0.5 h-6 bg-slate-700 origin-bottom transform rotate-45 -translate-x-1/2"></div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-xl font-bold text-slate-800">{stats.avgOnboardingTime?.mobile || "1m 38s"}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MOBILE</p>
                  </div>
                  <div className="w-6 h-10 border-2 border-slate-300 rounded-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between px-4">
                <div className="relative w-24 h-12">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[{ value: 60 }, { value: 40 }]}
                        cx="50%"
                        cy="100%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f1f5f9" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Needle mock */}
                  <div className="absolute bottom-0 left-1/2 w-0.5 h-6 bg-slate-700 origin-bottom transform rotate-[20deg] -translate-x-1/2"></div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-xl font-bold text-slate-800">{stats.avgOnboardingTime?.desktop || "1m 15s"}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">DESKTOP</p>
                  </div>
                  <div className="w-10 h-7 border-2 border-slate-300 rounded-sm"></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Throughput */}
          <Card className="p-6 border-0 shadow-sm bg-white rounded-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-sm">Throughput (Intención Comercial)</h3>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-blue-600">Mobile</span>
                <span className="text-slate-400">Desktop</span>
                <span className="text-slate-400">All</span>
                <div className="flex items-center gap-1 border border-slate-200 px-2 py-1 rounded text-slate-500 shadow-sm bg-white">
                  <span>This Month</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </div>
            </div>

            <div className="flex-1 w-full min-h-[200px] mt-4 relative">
               {/* Fake tooltip element matching the image */}
               <div className="absolute top-10 right-1/4 bg-white shadow-md border border-slate-100 rounded text-xs px-3 py-2 z-10 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">12TH OCTOBER</p>
                  <div className="flex items-center gap-1 justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="font-medium text-slate-600">Clients: <span className="font-bold text-slate-800">142</span></span>
                  </div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.throughput || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    dy={10} 
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="clients" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* --- NEW SECTION: Business Intelligence & Segmentation --- */}
        <div className="mt-12 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Inteligencia de Negocio y Segmentación</h2>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Certificaciones */}
            <Card className="p-6 border-0 shadow-sm bg-white rounded-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Certificaciones de Exportación</h3>
              </div>
              <div className="relative flex-1 flex flex-col justify-center items-center min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.businessMetrics?.certificationStats?.length ? stats.businessMetrics.certificationStats : [{name: "Vacio", value: 1}]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#10b981" /> {/* Con certs */}
                      <Cell fill="#f43f5e" /> {/* Sin certs */}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-xs font-medium text-slate-600">
                {stats.businessMetrics?.certificationStats?.map((c, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: i === 0 ? '#10b981' : '#f43f5e'}}></div>
                      <span>{c.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{c.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* 2. Tipo de Actor */}
            <Card className="p-6 border-0 shadow-sm bg-white rounded-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Segmentación por Actor</h3>
              </div>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.businessMetrics?.actorTypeStats || []} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-1 text-xs text-slate-600">
                 {stats.businessMetrics?.actorTypeStats?.slice(0,4).map((a, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="truncate pr-2">{a.name}</span>
                      <span className="font-bold text-slate-800">{a.value}</span>
                    </div>
                 ))}
              </div>
            </Card>

            {/* 3. Volumen Anual */}
            <Card className="p-6 border-0 shadow-sm bg-white rounded-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Volumen Anual (Capacidad)</h3>
              </div>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.businessMetrics?.volumeStats || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(val) => val.length > 8 ? val.substring(0,8)+'...' : val} axisLine={false} tickLine={false} dy={10} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* 4. Top Países de Interés */}
            <Card className="p-6 border-0 shadow-sm bg-white rounded-xl flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Top Países de Interés</h3>
              </div>
              <div className="flex-1 space-y-3 mt-2 overflow-y-auto custom-scrollbar">
                {stats.businessMetrics?.countryStats?.slice(0, 5).map((country, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{country.name}</span>
                      <span className="font-bold text-blue-600">{country.value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (country.value / (stats.businessMetrics?.countryStats[0]?.value || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                {(!stats.businessMetrics?.countryStats || stats.businessMetrics.countryStats.length === 0) && (
                   <p className="text-xs text-slate-400 text-center mt-8">No hay datos de países.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
