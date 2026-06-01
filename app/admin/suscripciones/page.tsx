"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Mail, Check, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuscripcionesPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const fetchSubscriptions = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true)

      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .order("subscribed_at", { ascending: false })

        if (error) {
          console.error("Error fetching subscriptions:", error)
          return
        }

        setSubscriptions(data || [])
        setLastUpdate(new Date())
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    },
    [supabase],
  )

  useEffect(() => {
    fetchSubscriptions(true)
    const interval = setInterval(() => fetchSubscriptions(false), 3000)
    return () => clearInterval(interval)
  }, [fetchSubscriptions])

  const deleteSubscription = async (id: string) => {
    try {
      const response = await fetch("/api/admin/delete-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        console.error("Error deleting subscription:", await response.text())
        return
      }

      fetchSubscriptions(false)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleManualRefresh = () => {
    fetchSubscriptions(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suscripciones</h1>
          <p className="text-muted-foreground mt-2">Gestiona los correos suscritos a tu boletín</p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Total de Suscriptores: {subscriptions.length}
          </CardTitle>
          <CardDescription>{subscriptions.filter((s) => s.is_active).length} activos</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Suscriptores</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Cargando suscriptores...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay suscriptores</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Correo</th>
                    <th className="text-left py-3 px-4 font-semibold">Fecha de Suscripción</th>
                    <th className="text-left py-3 px-4 font-semibold">Estado</th>
                    <th className="text-left py-3 px-4 font-semibold">Fuente</th>
                    <th className="text-left py-3 px-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="border-b hover:bg-muted/50 transition">
                      <td className="py-3 px-4">{subscription.email}</td>
                      <td className="py-3 px-4">
                        {subscription.subscribed_at
                          ? new Date(subscription.subscribed_at).toLocaleDateString("es-ES")
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            subscription.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {subscription.is_active ? (
                            <>
                              <Check className="w-3 h-3" />
                              Activo
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              Inactivo
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{subscription.source || "N/A"}</td>
                      <td className="py-3 px-4">
                        <Button variant="destructive" size="sm" onClick={() => deleteSubscription(subscription.id)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
