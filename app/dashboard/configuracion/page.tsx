"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Lock, Loader, CheckCircle2, AlertCircle,
    Eye, EyeOff, Trash2, ShieldAlert, KeyRound
} from "lucide-react"

type Status = { type: "success" | "error"; message: string } | null

export default function ConfiguracionPage() {
    const router = useRouter()

    // ── Change Password ────────────────────────────────────────────
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [pwdLoading, setPwdLoading] = useState(false)
    const [pwdStatus, setPwdStatus] = useState<Status>(null)
    const [currentPwdError, setCurrentPwdError] = useState(false)

    const strengthLevel = (pwd: string) => {
        if (!pwd) return 0
        let score = 0
        if (pwd.length >= 6) score++
        if (pwd.length >= 10) score++
        if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score++
        if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 14) score++
        return score
    }
    const strengthLabels = ["Muy corta", "Débil", "Media", "Buena", "Fuerte"]
    const strengthColors = ["bg-muted", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"]
    const level = strengthLevel(newPassword)

    const handleChangePassword = async () => {
        setPwdStatus(null)
        setCurrentPwdError(false)
        if (!currentPassword) {
            setPwdStatus({ type: "error", message: "Ingresa tu contraseña actual." })
            setCurrentPwdError(true)
            return
        }
        if (!newPassword || newPassword.length < 6) {
            setPwdStatus({ type: "error", message: "La nueva contraseña debe tener al menos 6 caracteres." })
            return
        }
        if (newPassword !== confirmPassword) {
            setPwdStatus({ type: "error", message: "Las contraseñas nuevas no coinciden." })
            return
        }
        setPwdLoading(true)
        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                setPwdStatus({ type: "success", message: "¡Contraseña actualizada correctamente!" })
                setCurrentPassword("")
                setNewPassword("")
                setConfirmPassword("")
            } else {
                if (data.field === "current") setCurrentPwdError(true)
                setPwdStatus({ type: "error", message: data.error || "Error al cambiar la contraseña." })
            }
        } catch {
            setPwdStatus({ type: "error", message: "Error de conexión. Intenta nuevamente." })
        } finally {
            setPwdLoading(false)
        }
    }

    // ── Delete Account ─────────────────────────────────────────────
    const [showDeleteZone, setShowDeleteZone] = useState(false)
    const [deleteReason, setDeleteReason] = useState("")
    const [deleteCustomReason, setDeleteCustomReason] = useState("")
    const [deletePassword, setDeletePassword] = useState("")
    const [showDeletePwd, setShowDeletePwd] = useState(false)
    const [deleteConfirmText, setDeleteConfirmText] = useState("")
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteStatus, setDeleteStatus] = useState<Status>(null)
    const [deletePwdError, setDeletePwdError] = useState(false)

    const DELETE_REASONS = [
        "Ya no necesito el servicio",
        "Encontré otra plataforma que me conviene más",
        "Tengo problemas técnicos o con mi cuenta",
        "No estoy obteniendo los resultados esperados",
        "Preocupaciones de privacidad o seguridad",
        "Otra razón",
    ]

    const handleDeleteAccount = async () => {
        setDeleteStatus(null)
        setDeletePwdError(false)
        if (!deleteReason) {
            setDeleteStatus({ type: "error", message: "Por favor selecciona el motivo de eliminación." })
            return
        }
        if (!deletePassword) {
            setDeleteStatus({ type: "error", message: "Ingresa tu contraseña para confirmar." })
            setDeletePwdError(true)
            return
        }
        if (deleteConfirmText !== "ELIMINAR") {
            setDeleteStatus({ type: "error", message: "Escribe ELIMINAR en mayúsculas para confirmar." })
            return
        }
        setDeleteLoading(true)
        try {
            const res = await fetch("/api/user/delete-account", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: deletePassword, reason: deleteReason, customReason: deleteCustomReason }),
            })
            const data = await res.json()
            if (res.ok && data.success) {
                // Clear client-side storage
                localStorage.clear()
                sessionStorage.clear()
                // Clear server-side HttpOnly session cookies via logout API
                await fetch("/api/auth/logout", { method: "POST" }).catch(() => { })
                // Replace (not push) so the user can't go back to a deleted session
                window.location.replace("/")
            } else {
                if (data.field === "password") setDeletePwdError(true)
                setDeleteStatus({ type: "error", message: data.error || "Error al eliminar la cuenta." })
                setDeleteLoading(false)
            }
        } catch {
            setDeleteStatus({ type: "error", message: "Error de conexión. Intenta nuevamente." })
            setDeleteLoading(false)
        }
    }

    return (
        <div className="space-y-6 p-6">

            {/* ── Page Header ───────────────────────────────────────── */}
            <div>
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p className="text-muted-foreground">Administra la seguridad y los datos de tu cuenta</p>
            </div>

            {/* ── Change Password Card ──────────────────────────────── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-primary" />
                        Cambiar Contraseña
                    </CardTitle>
                    <CardDescription>
                        Actualiza tu contraseña. El cambio se aplica de inmediato y tu sesión permanece activa.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex flex-col gap-5 max-w-md">

                        {/* 1 — Current password */}
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Contraseña Actual</Label>
                            <div className="relative">
                                <Input
                                    id="current-password"
                                    type={showCurrent ? "text" : "password"}
                                    placeholder="Tu contraseña actual"
                                    value={currentPassword}
                                    onChange={e => { setCurrentPassword(e.target.value); setPwdStatus(null); setCurrentPwdError(false) }}
                                    disabled={pwdLoading}
                                    className={`pr-10 ${currentPwdError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {currentPwdError && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Contraseña incorrecta
                                </p>
                            )}
                        </div>

                        {/* 2 — New password */}
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nueva Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="new-password"
                                    type={showNew ? "text" : "password"}
                                    placeholder="Mínimo 6 caracteres"
                                    value={newPassword}
                                    onChange={e => { setNewPassword(e.target.value); setPwdStatus(null) }}
                                    disabled={pwdLoading}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {newPassword && (
                                <div className="space-y-1 pt-1">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className={`h-1.5 flex-1 rounded-full transition-all ${level >= i ? strengthColors[level] : "bg-muted"}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{strengthLabels[level]}</p>
                                </div>
                            )}
                        </div>

                        {/* 3 — Confirm new password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                            <div className="relative">
                                <Input
                                    id="confirm-password"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repite la nueva contraseña"
                                    value={confirmPassword}
                                    onChange={e => { setConfirmPassword(e.target.value); setPwdStatus(null) }}
                                    disabled={pwdLoading}
                                    className="pr-10"
                                    onKeyDown={e => e.key === "Enter" && handleChangePassword()}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirmPassword && (
                                <p className={`text-xs flex items-center gap-1 ${newPassword === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                                    {newPassword === confirmPassword
                                        ? <><CheckCircle2 className="w-3 h-3" /> Las contraseñas coinciden</>
                                        : <><AlertCircle className="w-3 h-3" /> No coinciden</>
                                    }
                                </p>
                            )}
                        </div>
                        {/* Status + Submit — inside the same max-w-md column */}
                        {pwdStatus && (
                            <div className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${pwdStatus.type === "success"
                                ? "bg-green-50 border-green-200 text-green-800"
                                : "bg-red-50 border-red-200 text-red-800"
                                }`}>
                                {pwdStatus.type === "success"
                                    ? <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                                    : <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                                }
                                {pwdStatus.message}
                            </div>
                        )}

                        <Button
                            onClick={handleChangePassword}
                            disabled={pwdLoading || !currentPassword || !newPassword || !confirmPassword}
                            className="w-full gap-2"
                            size="lg"
                        >
                            {pwdLoading
                                ? <><Loader className="w-4 h-4 animate-spin" /> Actualizando...</>
                                : <><Lock className="w-4 h-4" /> Actualizar Contraseña</>
                            }
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ── Danger Zone Card ──────────────────────────────────── */}
            <Card className="border-destructive/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert className="w-5 h-5" />
                        Zona de Peligro
                    </CardTitle>
                    <CardDescription>
                        Estas acciones son permanentes e irreversibles. Todos tus datos, publicaciones y configuraciones serán eliminados.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showDeleteZone ? (
                        /* ── Collapsed state ── */
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5 max-w-md">
                            <div className="flex-1 space-y-0.5">
                                <p className="font-medium text-sm">Eliminar mi cuenta</p>
                                <p className="text-xs text-muted-foreground">
                                    Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2 shrink-0"
                                onClick={() => setShowDeleteZone(true)}
                            >
                                <Trash2 className="w-4 h-4" /> Eliminar cuenta
                            </Button>
                        </div>
                    ) : (
                        /* ── Expanded confirmation flow ── */
                        <div className="flex flex-col gap-6 max-w-md">

                            {/* Step 1 — Reason */}
                            <div className="space-y-3">
                                <p className="text-sm font-semibold">¿Por qué quieres eliminar tu cuenta?</p>
                                <div className="space-y-2">
                                    {DELETE_REASONS.map(reason => (
                                        <label
                                            key={reason}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${deleteReason === reason
                                                ? "border-destructive bg-destructive/5 text-destructive font-medium"
                                                : "border-border hover:bg-muted/50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="deleteReason"
                                                value={reason}
                                                checked={deleteReason === reason}
                                                onChange={() => { setDeleteReason(reason); setDeleteStatus(null); setDeleteCustomReason("") }}
                                                className="accent-destructive"
                                            />
                                            <span className="text-sm">{reason}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Custom reason textarea — only shown for "Otra razón" */}
                            {deleteReason === "Otra razón" && (
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold">Cuéntanos más (opcional)</Label>
                                    <textarea
                                        rows={3}
                                        value={deleteCustomReason}
                                        onChange={e => setDeleteCustomReason(e.target.value)}
                                        disabled={deleteLoading}
                                        placeholder="Describe brevemente tu motivo..."
                                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive/40 resize-none bg-background"
                                    />
                                </div>
                            )}

                            {/* Step 2 — Password */}
                            <div className="space-y-2">
                                <Label htmlFor="delete-password" className="text-sm font-semibold">
                                    Confirma tu contraseña
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="delete-password"
                                        type={showDeletePwd ? "text" : "password"}
                                        placeholder="Tu contraseña actual"
                                        value={deletePassword}
                                        onChange={e => { setDeletePassword(e.target.value); setDeleteStatus(null); setDeletePwdError(false) }}
                                        disabled={deleteLoading}
                                        className={`pr-10 ${deletePwdError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDeletePwd(p => !p)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showDeletePwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {deletePwdError && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Contraseña incorrecta
                                    </p>
                                )}
                            </div>

                            {/* Step 3 — Type ELIMINAR */}
                            <div className="space-y-2">
                                <Label htmlFor="delete-confirm" className="text-sm font-semibold">
                                    Escribe{" "}
                                    <span className="font-mono text-destructive tracking-widest">ELIMINAR</span>
                                    {" "}para confirmar
                                </Label>
                                <Input
                                    id="delete-confirm"
                                    placeholder="ELIMINAR"
                                    value={deleteConfirmText}
                                    onChange={e => { setDeleteConfirmText(e.target.value); setDeleteStatus(null) }}
                                    disabled={deleteLoading}
                                    className="font-mono border-destructive/40 focus-visible:ring-destructive"
                                />
                            </div>

                            {/* Status message */}
                            {deleteStatus && (
                                <div className="flex items-center gap-2 text-sm p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                                    {deleteStatus.message}
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="destructive"
                                    size="lg"
                                    onClick={handleDeleteAccount}
                                    disabled={deleteLoading || deleteConfirmText !== "ELIMINAR"}
                                    className="w-full gap-2"
                                >
                                    {deleteLoading
                                        ? <><Loader className="w-4 h-4 animate-spin" /> Eliminando...</>
                                        : <><Trash2 className="w-4 h-4" /> Confirmar eliminación de cuenta</>
                                    }
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowDeleteZone(false)
                                        setDeleteReason("")
                                        setDeleteCustomReason("")
                                        setDeletePassword("")
                                        setDeleteConfirmText("")
                                        setDeleteStatus(null)
                                        setDeletePwdError(false)
                                    }}
                                    disabled={deleteLoading}
                                    className="w-full"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
