"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  Search, 
  User as UserIcon, 
  Clock, 
  ExternalLink, 
  RefreshCcw,
  MessageCircle,
  Mail,
  LogIn,
  Package,
  FileText,
  MousePointer2,
  X,
  ChevronDown
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface UserActivity {
  id: string
  user_id: string | null
  activity_type: string
  description: string
  metadata: any
  path: string
  created_at: string
  user_email?: string
  user_name?: string
}

interface UserSummary {
  user_id: string
  user_name: string
  user_email: string
  count: number
}

export default function ActividadAdminPage() {
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedUserLabel, setSelectedUserLabel] = useState<string>("")
  const [view, setView] = useState<"tabla" | "usuarios">("tabla")

  const fetchActivities = async (userId?: string) => {
    try {
      setIsLoading(true)
      const url = userId ? `/api/admin/activities?userId=${userId}` : "/api/admin/activities"
      const res = await fetch(url)
      const data = await res.json()
      if (data.activities) {
        setActivities(data.activities)
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities(selectedUserId || undefined)
  }, [selectedUserId])

  // Build user summary for "por usuario" view
  const userSummary: UserSummary[] = Object.values(
    activities.reduce((acc: Record<string, UserSummary>, a) => {
      const key = a.user_id || "guest"
      if (!acc[key]) {
        acc[key] = {
          user_id: a.user_id || "guest",
          user_name: a.user_name || "Invitado",
          user_email: a.user_email || "No registrado",
          count: 0,
        }
      }
      acc[key].count++
      return acc
    }, {})
  ).sort((a, b) => b.count - a.count)

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.activity_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || activity.activity_type === filterType
    return matchesSearch && matchesType
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <LogIn className="w-4 h-4 text-blue-500" />
      case 'contact_whatsapp': return <MessageCircle className="w-4 h-4 text-green-500" />
      case 'contact_email': return <Mail className="w-4 h-4 text-orange-500" />
      case 'create_product': return <Package className="w-4 h-4 text-purple-500" />
      case 'quote_request': return <FileText className="w-4 h-4 text-pink-500" />
      case 'page_view': return <ExternalLink className="w-4 h-4 text-gray-400" />
      case 'click': return <MousePointer2 className="w-4 h-4 text-primary" />
      default: return <MousePointer2 className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityBadgeClass = (type: string) => {
    const styles: Record<string, string> = {
      login: "bg-blue-100 text-blue-700",
      contact_whatsapp: "bg-green-100 text-green-700",
      contact_email: "bg-orange-100 text-orange-700",
      create_product: "bg-purple-100 text-purple-700",
      quote_request: "bg-pink-100 text-pink-700",
      page_view: "bg-gray-100 text-gray-700",
      click: "bg-primary/10 text-primary",
    }
    return styles[type] || "bg-gray-100 text-gray-700"
  }

  const handleSelectUser = (u: UserSummary) => {
    setSelectedUserId(u.user_id === "guest" ? null : u.user_id)
    setSelectedUserLabel(u.user_email || u.user_name)
    setView("tabla")
  }

  const handleClearUser = () => {
    setSelectedUserId(null)
    setSelectedUserLabel("")
    fetchActivities()
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registro de Actividad</h1>
          <p className="text-muted-foreground mt-1">
            Monitorea en tiempo real las acciones y navegación de los usuarios.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "tabla" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("tabla")}
          >
            Tabla
          </Button>
          <Button
            variant={view === "usuarios" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("usuarios")}
          >
            Por Usuario
          </Button>
          <Button onClick={() => fetchActivities(selectedUserId || undefined)} variant="outline" size="sm" className="gap-2">
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Active user filter banner */}
      {selectedUserId && (
        <div className="flex items-center gap-3 mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <UserIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            Filtrando por: <span className="font-bold">{selectedUserLabel}</span>
          </span>
          <button onClick={handleClearUser} className="ml-auto text-blue-500 hover:text-blue-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW: Por Usuario */}
      {view === "usuarios" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Usuarios — {userSummary.length} encontrados
            </p>
          </div>
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {userSummary.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{u.user_name}</p>
                    <p className="text-sm text-gray-500 truncate">{u.user_email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary" className="text-xs">{u.count} acciones</Badge>
                    <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW: Tabla */}
      {view === "tabla" && (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuario, email, acción..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos los eventos</option>
              <option value="login">Inicios de Sesión</option>
              <option value="contact_whatsapp">WhatsApp</option>
              <option value="contact_email">Email</option>
              <option value="create_product">Publicaciones</option>
              <option value="quote_request">Cotizaciones</option>
              <option value="click">Clicks</option>
              <option value="page_view">Vistas de página</option>
            </select>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500">No se encontró actividad reciente.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Página</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <button
                          className="flex items-center gap-3 text-left hover:opacity-70 transition-opacity"
                          onClick={() => {
                            if (activity.user_id) {
                              setSelectedUserId(activity.user_id)
                              setSelectedUserLabel(activity.user_email || activity.user_name || "")
                              fetchActivities(activity.user_id)
                            }
                          }}
                          title={activity.user_id ? "Ver toda la actividad de este usuario" : "Invitado"}
                        >
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm text-gray-900">{activity.user_name || "Invitado"}</span>
                            <span className="text-xs text-gray-500">{activity.user_email || "No registrado"}</span>
                          </div>
                        </button>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className={`gap-1.5 font-medium ${getActivityBadgeClass(activity.activity_type)}`}>
                          {getActivityIcon(activity.activity_type)}
                          {activity.activity_type.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-gray-600 line-clamp-1" title={activity.description}>
                          {activity.description}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md w-fit max-w-[150px] truncate">
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{activity.path}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {format(new Date(activity.created_at), "d MMM, HH:mm", { locale: es })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
