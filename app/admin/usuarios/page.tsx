"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface User {
  id: string
  full_name: string
  email: string
  company_name: string
  phone: string
  country: string
  user_type: string
  role: string
  created_at: string
  products_of_interest?: string[]
  annual_volume?: string
  country_code?: string
  metadata_phone_number?: string
  company_website?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const { toast } = useToast()

  const fetchUsers = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true)

    try {
      const response = await fetch(`/api/admin/users?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data || [])
      setLastUpdate(new Date())
    } catch (error: any) {
      console.error("[v0] Admin Users Page error:", error.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch with loading indicator
    fetchUsers(true)

    const intervalId = setInterval(() => {
      fetchUsers(false) // Silent refresh without loading indicator
    }, 3000)

    return () => clearInterval(intervalId)
  }, [fetchUsers])

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (!response.ok) throw new Error("Failed to update role")

      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado exitosamente",
      })

      await fetchUsers(false)
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario",
        variant: "destructive",
      })
    }
  }

  const handleManualRefresh = () => {
    fetchUsers(true)
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra los usuarios registrados en la plataforma</p>
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
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>Total de usuarios: {users.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay usuarios registrados</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Nombre</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Empresa</th>
                    <th className="text-left p-4 font-medium">Web/Link</th>
                    <th className="text-left p-4 font-medium">Teléfono</th>
                    <th className="text-left p-4 font-medium">País</th>
                    <th className="text-left p-4 font-medium">Productos de Interés</th>
                    <th className="text-left p-4 font-medium">Volumen Anual</th>
                    <th className="text-left p-4 font-medium">Tipo</th>
                    <th className="text-left p-4 font-medium">Rol</th>
                    <th className="text-left p-4 font-medium">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{user.full_name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.company_name || "-"}</td>
                      <td className="p-4">
                        {user.company_website ? (
                          <a
                            href={user.company_website.startsWith('http') ? user.company_website : `https://${user.company_website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm truncate max-w-[150px] inline-block"
                          >
                            Visitar sitio
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {user.country_code && user.metadata_phone_number
                          ? `+${user.country_code} ${user.metadata_phone_number}`
                          : user.phone
                            ? (user.phone.startsWith('+') ? user.phone : `+${user.phone}`)
                            : "-"
                        }
                      </td>
                      <td className="p-4">{user.country || "-"}</td>
                      <td className="p-4 max-w-xs">
                        {user.products_of_interest && user.products_of_interest.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.products_of_interest.map((product, idx) => (
                              <span key={idx} className="text-xs font-medium text-foreground bg-secondary/50 px-2 py-1 rounded">
                                {product}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {user.annual_volume ? (
                          <span className="text-sm font-medium">{user.annual_volume}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          {user.user_type || "Usuario"}
                        </span>
                      </td>
                      <td className="p-4">
                        <Select value={user.role || "user"} onValueChange={(value) => handleRoleChange(user.id, value)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="vendedor">Vendedor</SelectItem>
                            <SelectItem value="comprador">Comprador</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
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
