"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, Loader2, Star, Users, Trash2, Crown, UserPlus, Search, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

type PlanFilter = "todos" | "gratis" | "pro"

const DURATION_OPTIONS = [
  { label: "1 mes", value: 1 },
  { label: "3 meses", value: 3 },
  { label: "6 meses", value: 6 },
  { label: "1 año", value: 12 },
  { label: "Sin vencimiento", value: 0 },
]

export default function MembresiasPage() {
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [filter, setFilter] = useState<PlanFilter>("todos")

  // Add Pro dialog state
  const [isAddProOpen, setIsAddProOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedMonths, setSelectedMonths] = useState<number>(1)
  const [confirmStep, setConfirmStep] = useState(false)

  const { toast } = useToast()

  const fetchUsers = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true)
      try {
        const response = await fetch("/api/admin/users", { cache: "no-store" })
        if (!response.ok) throw new Error("Error fetching users")
        const data = await response.json()
        setAllUsers(data.filter((u: any) => u.role !== "admin"))
        setLastUpdate(new Date())
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los usuarios", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => { fetchUsers(true) }, [fetchUsers])

  // Live search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const q = searchQuery.toLowerCase()
    setSearchResults(
      allUsers
        .filter(u =>
          u.email?.toLowerCase().includes(q) ||
          u.full_name?.toLowerCase().includes(q) ||
          u.company_name?.toLowerCase().includes(q)
        )
        .slice(0, 8)
    )
  }, [searchQuery, allUsers])

  const filteredUsers = allUsers.filter((u) => {
    if (filter === "pro") return u.plan_type === "pro"
    if (filter === "gratis") return u.plan_type !== "pro"
    return true
  })

  const proCount = allUsers.filter((u) => u.plan_type === "pro").length
  const gratisCount = allUsers.filter((u) => u.plan_type !== "pro").length

  const callUpdatePlan = async (userId: string, planType: "pro" | "gratis", months?: number) => {
    setIsUpdatingPlan(userId)
    try {
      const res = await fetch("/api/admin/update-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planType, months: months ?? 0 }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Error al actualizar el plan")
      toast({
        title: "✅ Plan actualizado",
        description: planType === "pro"
          ? `Usuario asignado al plan Pro${months ? ` por ${months} mes${months > 1 ? "es" : ""}` : " sin vencimiento"}.`
          : "Usuario revertido al plan Gratis.",
      })
      await fetchUsers(false)
      return true
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      return false
    } finally {
      setIsUpdatingPlan(null)
    }
  }

  const handleConfirmAssignPro = async () => {
    if (!selectedUser) return
    const ok = await callUpdatePlan(selectedUser.id, "pro", selectedMonths)
    if (ok) {
      setIsAddProOpen(false)
      setConfirmStep(false)
      setSelectedUser(null)
      setSearchQuery("")
      setSearchResults([])
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${userToDelete.id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error deleting user")
      toast({ title: "Éxito", description: "Usuario eliminado correctamente" })
      fetchUsers(false)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "No se pudo eliminar el usuario", variant: "destructive" })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const closeAddProDialog = () => {
    setIsAddProOpen(false)
    setConfirmStep(false)
    setSelectedUser(null)
    setSearchQuery("")
    setSearchResults([])
    setSelectedMonths(1)
  }

  const formatExpiry = (dateStr: string | null) => {
    if (!dateStr) return "Sin vencimiento"
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return "Sin vencimiento"
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
  }

  if (loading && allUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-amber-500" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Membresías</h1>
            <p className="text-muted-foreground">Gestiona los planes de suscripción de los usuarios</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">Actualizado: {lastUpdate.toLocaleTimeString()}</span>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchUsers(true)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-gray-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{allUsers.length}</span>
              <Users className="w-8 h-8 text-gray-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 cursor-pointer hover:shadow-md transition-all" onClick={() => setFilter("pro")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan Pro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-amber-600">{proCount}</span>
              <Star className="w-8 h-8 text-amber-300 fill-amber-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-all" onClick={() => setFilter("gratis")}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Plan Gratis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-primary">{gratisCount}</span>
              <Users className="w-8 h-8 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs + Add Pro Button */}
      <div className="flex items-center justify-between border-b pb-1">
        <div className="flex items-center gap-1">
          {(["todos", "gratis", "pro"] as PlanFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all duration-150 ${
                filter === tab
                  ? tab === "pro"
                    ? "bg-amber-50 text-amber-700 border-b-2 border-amber-500"
                    : "bg-primary/10 text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "todos" && `Todos (${allUsers.length})`}
              {tab === "gratis" && `Gratis (${gratisCount})`}
              {tab === "pro" && (
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Pro ({proCount})
                </span>
              )}
            </button>
          ))}
        </div>
        {filter === "pro" && (
          <Button
            size="sm"
            onClick={() => setIsAddProOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Añadir usuario Pro
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/5">
              {filter === "pro" ? (
                <>
                  <Star className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium mb-3">No hay usuarios con plan Pro todavía</p>
                  <Button size="sm" onClick={() => setIsAddProOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                    <UserPlus className="w-4 h-4" />Añadir el primero
                  </Button>
                </>
              ) : (
                <>
                  <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No hay usuarios en esta categoría</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Nombre</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">Empresa</th>
                    <th className="text-left p-4 font-medium">Plan</th>
                    <th className="text-left p-4 font-medium">Vencimiento</th>
                    <th className="text-left p-4 font-medium">Registro</th>
                    <th className="text-left p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isPro = user.plan_type === "pro"
                    const isUpdating = isUpdatingPlan === user.id
                    const expiryDate = user.plan_expires_at ? new Date(user.plan_expires_at) : null
                    const isExpiringSoon = expiryDate && expiryDate > new Date() &&
                      (expiryDate.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000

                    return (
                      <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium">{user.full_name || "-"}</td>
                        <td className="p-4 text-sm">{user.email}</td>
                        <td className="p-4 text-sm">{user.company_name || "-"}</td>
                        <td className="p-4">
                          {isPro ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-500" />PRO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                              GRATIS
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-sm">
                          {isPro ? (
                            <span className={`flex items-center gap-1 ${isExpiringSoon ? "text-orange-600 font-semibold" : "text-muted-foreground"}`}>
                              <Calendar className="w-3.5 h-3.5" />
                              {formatExpiry(user.plan_expires_at)}
                              {isExpiringSoon && <span className="text-xs text-orange-500">⚠ Próximo</span>}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(user.created_at).toLocaleDateString("es-ES")}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {isPro ? (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => callUpdatePlan(user.id, "gratis")}
                                className="text-gray-600 border-gray-300 hover:bg-gray-50 text-xs"
                              >
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : "→ Gratis"}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isUpdating}
                                onClick={() => {
                                  setSelectedUser(user)
                                  setConfirmStep(true)
                                  setIsAddProOpen(true)
                                }}
                                className="text-amber-600 border-amber-300 hover:bg-amber-50 text-xs"
                              >
                                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-500" />→ Pro
                                  </span>
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setUserToDelete(user); setIsDeleteDialogOpen(true) }}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Add/Assign Pro Dialog ── */}
      <Dialog open={isAddProOpen} onOpenChange={(open) => { if (!open) closeAddProDialog() }}>
        <DialogContent className="max-w-lg">
          {!confirmStep ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Añadir usuario al plan Pro
                </DialogTitle>
                <DialogDescription>
                  Busca un usuario por nombre, email o empresa.
                </DialogDescription>
              </DialogHeader>

              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nombre, email o empresa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setSearchResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-1 max-h-72 overflow-y-auto space-y-1">
                {!searchQuery.trim() ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Escribe para buscar usuarios…</p>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No se encontraron usuarios</p>
                ) : (
                  searchResults.map((user) => {
                    const isPro = user.plan_type === "pro"
                    return (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 border border-transparent hover:border-muted transition-all">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold truncate">{user.full_name || "-"}</span>
                          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                          {user.company_name && <span className="text-xs text-muted-foreground">{user.company_name}</span>}
                        </div>
                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                          {isPro ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                              <Star className="w-2.5 h-2.5 fill-amber-500" />PRO
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => { setSelectedUser(user); setConfirmStep(true) }}
                              className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-7 px-3"
                            >
                              Asignar Pro
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  Confirmar membresía Pro
                </DialogTitle>
                <DialogDescription>
                  Configura la duración del plan para <strong>{selectedUser?.full_name || selectedUser?.email}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {/* User info card */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-amber-800">{selectedUser?.full_name}</p>
                  <p className="text-xs text-amber-600">{selectedUser?.email}</p>
                  {selectedUser?.company_name && <p className="text-xs text-amber-600">{selectedUser?.company_name}</p>}
                </div>

                {/* Duration selector */}
                <div>
                  <label className="text-sm font-semibold block mb-2">Duración del plan Pro</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedMonths(opt.value)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                          selectedMonths === opt.value
                            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {selectedMonths > 0 && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Vence el:{" "}
                      <strong>
                        {new Date(Date.now() + selectedMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("es-ES", {
                          day: "2-digit", month: "long", year: "numeric"
                        })}
                      </strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setConfirmStep(false); setSelectedUser(null) }}>
                  ← Volver
                </Button>
                <Button
                  onClick={handleConfirmAssignPro}
                  disabled={isUpdatingPlan === selectedUser?.id}
                  className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                >
                  {isUpdatingPlan === selectedUser?.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Asignando...</>
                  ) : (
                    <><Crown className="w-4 h-4" />Confirmar Pro</>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario <strong>{userToDelete?.full_name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteUser() }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar Usuario"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
