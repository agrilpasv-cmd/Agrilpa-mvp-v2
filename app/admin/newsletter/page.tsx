"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Mail, Send, Loader, CheckCircle2, AlertCircle, Users,
    Search, X, UserCheck, ChevronDown, ChevronUp, ShieldAlert,
    Type, Code, Eye
} from "lucide-react"

interface UserRecord {
    id: string
    email: string
    full_name?: string
    company_name?: string
    role?: string
}

type RecipientMode = "all" | "selected" | "specific"
type ContentMode = "text" | "html"

export default function NewsletterPage() {
    const [subject, setSubject] = useState("")
    const [content, setContent] = useState("")
    const [contentMode, setContentMode] = useState<ContentMode>("text")
    const [showPreview, setShowPreview] = useState(false)

    const [recipientMode, setRecipientMode] = useState<RecipientMode>("all")
    const [specificEmail, setSpecificEmail] = useState("")

    const [allUsers, setAllUsers] = useState<UserRecord[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [userSearch, setUserSearch] = useState("")
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set())
    const [usersExpanded, setUsersExpanded] = useState(true)

    const [confirming, setConfirming] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [result, setResult] = useState<{
        success: boolean
        sent?: number
        failed?: number
        totalUsers?: number
        error?: string
    } | null>(null)

    useEffect(() => {
        if (recipientMode === "selected" && allUsers.length === 0) {
            setLoadingUsers(true)
            fetch("/api/admin/users")
                .then(r => r.json())
                .then((data: UserRecord[]) => setAllUsers(Array.isArray(data) ? data : []))
                .catch(() => setAllUsers([]))
                .finally(() => setLoadingUsers(false))
        }
    }, [recipientMode])

    const filteredUsers = useMemo(() => {
        const q = userSearch.toLowerCase().trim()
        if (!q) return allUsers
        return allUsers.filter(u =>
            (u.email || "").toLowerCase().includes(q) ||
            (u.full_name || "").toLowerCase().includes(q) ||
            (u.company_name || "").toLowerCase().includes(q)
        )
    }, [allUsers, userSearch])

    const selectedUsers = useMemo(
        () => allUsers.filter(u => selectedUserIds.has(u.id)),
        [allUsers, selectedUserIds]
    )

    const toggleUser = (id: string) => {
        setSelectedUserIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const canSend = !!(subject.trim() && content.trim() && (
        recipientMode === "all" ||
        (recipientMode === "specific" && specificEmail.trim()) ||
        (recipientMode === "selected" && selectedUserIds.size > 0)
    ))

    const recipientSummary = () => {
        if (recipientMode === "all") return "todos los usuarios registrados"
        if (recipientMode === "specific") return specificEmail
        return `${selectedUserIds.size} usuario${selectedUserIds.size !== 1 ? "s" : ""} seleccionado${selectedUserIds.size !== 1 ? "s" : ""}`
    }

    const handleConfirm = () => {
        if (!canSend) return
        setResult(null)
        setConfirming(true)
    }

    const handleSend = async () => {
        setConfirming(false)
        setIsSending(true)

        // Build the HTML content to send
        const htmlForEmail = contentMode === "html"
            ? content   // user's raw HTML goes directly into the template
            : content.replace(/\n/g, "<br>")  // plain text: convert newlines

        try {
            const body: Record<string, any> = { subject, content: htmlForEmail, rawHtml: contentMode === "html" }
            if (recipientMode === "specific") {
                body.specificEmail = specificEmail
            } else if (recipientMode === "selected") {
                body.selectedEmails = selectedUsers.map(u => ({
                    email: u.email,
                    name: u.company_name || u.full_name || "Usuario"
                }))
            }

            const res = await fetch("/api/admin/send-newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            let data
            try { data = await res.json() }
            catch { throw new Error(`Error del servidor (${res.status})`) }

            if (res.ok && data.success) {
                setResult({
                    success: true,
                    sent: data.sent,
                    failed: data.failed,
                    totalUsers: data.totalUsers,
                    error: data.errors ? `Algunos correos fallaron: ${data.errors.join(", ")}` : undefined
                })
                if (recipientMode === "all") { setSubject(""); setContent("") }
            } else {
                setResult({ success: false, error: data.error || `Error ${res.status}` })
            }
        } catch (err: any) {
            setResult({ success: false, error: err.message || "Error desconocido al enviar." })
        } finally {
            setIsSending(false)
        }
    }

    // Build the preview HTML (for the preview panel)
    const previewHtml = useMemo(() => {
        if (contentMode === "html") return content
        return content.split("\n").map(l => `<p style="margin:0 0 12px 0">${l || "&nbsp;"}</p>`).join("")
    }, [content, contentMode])

    return (
        <div className="space-y-6 p-6 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Mail className="w-8 h-8 text-primary" />
                    Newsletter
                </h1>
                <p className="text-muted-foreground mt-1">
                    Envía correos personalizados a los usuarios de la plataforma
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Componer correo
                    </CardTitle>
                    <CardDescription>
                        {recipientMode === "all" && "El correo será enviado a todos los usuarios registrados"}
                        {recipientMode === "specific" && "El correo será enviado únicamente al destinatario especificado"}
                        {recipientMode === "selected" && `El correo será enviado a ${selectedUserIds.size > 0 ? `${selectedUserIds.size} usuario${selectedUserIds.size !== 1 ? "s" : ""} seleccionado${selectedUserIds.size !== 1 ? "s" : ""}` : "los usuarios que selecciones"}`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* ── Recipient Mode ───────────────────────────────────────── */}
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-sm font-medium">Destinatarios</Label>
                        <div className="flex flex-col gap-2">
                            {(["all", "selected", "specific"] as RecipientMode[]).map(mode => (
                                <label key={mode} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="recipientMode"
                                        checked={recipientMode === mode}
                                        onChange={() => { setRecipientMode(mode); setConfirming(false) }}
                                        className="accent-primary w-4 h-4"
                                    />
                                    <span>
                                        {mode === "all" && "Enviar a todos los usuarios registrados"}
                                        {mode === "selected" && "Seleccionar usuarios específicos"}
                                        {mode === "specific" && "Enviar a un correo manualmente"}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {recipientMode === "specific" && (
                            <div className="mt-3 pl-6">
                                <Input
                                    placeholder="correo@ejemplo.com"
                                    value={specificEmail}
                                    onChange={(e) => setSpecificEmail(e.target.value)}
                                    type="email"
                                />
                            </div>
                        )}
                    </div>

                    {/* ── User Picker ──────────────────────────────────────────── */}
                    {recipientMode === "selected" && (
                        <div className="border rounded-lg overflow-hidden">
                            <div
                                className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer select-none"
                                onClick={() => setUsersExpanded(p => !p)}
                            >
                                <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-sm">
                                        Usuarios registrados
                                        {selectedUserIds.size > 0 && (
                                            <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                                                {selectedUserIds.size} seleccionado{selectedUserIds.size !== 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </span>
                                </div>
                                {usersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                            {usersExpanded && (
                                <>
                                    <div className="p-3 border-b flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar por nombre, empresa o correo..."
                                                value={userSearch}
                                                onChange={e => setUserSearch(e.target.value)}
                                                className="pl-8 h-8 text-sm"
                                            />
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedUserIds(new Set(filteredUsers.map(u => u.id)))} className="text-xs h-8 px-2">
                                            Seleccionar todos
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedUserIds(new Set())} className="text-xs h-8 px-2 text-muted-foreground">
                                            Limpiar
                                        </Button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto divide-y">
                                        {loadingUsers ? (
                                            <div className="flex items-center justify-center p-8 text-muted-foreground gap-2">
                                                <Loader className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">Cargando usuarios...</span>
                                            </div>
                                        ) : filteredUsers.length === 0 ? (
                                            <div className="p-6 text-center text-sm text-muted-foreground">
                                                {userSearch ? "No se encontraron usuarios" : "No hay usuarios registrados"}
                                            </div>
                                        ) : filteredUsers.map(user => (
                                            <label key={user.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUserIds.has(user.id)}
                                                    onChange={() => toggleUser(user.id)}
                                                    className="accent-primary w-4 h-4 shrink-0"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{user.company_name || user.full_name || "Sin nombre"}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                                {user.role === "admin" && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium shrink-0">Admin</span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}
                            {selectedUserIds.size > 0 && (
                                <div className="p-3 border-t bg-muted/10 flex flex-wrap gap-1.5">
                                    {selectedUsers.slice(0, 8).map(u => (
                                        <span key={u.id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                            {u.company_name || u.full_name || u.email}
                                            <button onClick={() => toggleUser(u.id)} type="button" className="hover:text-destructive ml-0.5">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    {selectedUserIds.size > 8 && (
                                        <span className="text-xs text-muted-foreground px-2 py-1">+{selectedUserIds.size - 8} más</span>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Subject ─────────────────────────────────────────────── */}
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium">Asunto del correo</Label>
                        <Input
                            id="subject"
                            placeholder="Ej: ¡Novedades en Agrilpa! 🌱"
                            value={subject}
                            onChange={(e) => { setSubject(e.target.value); setConfirming(false) }}
                            disabled={isSending}
                            className="text-base"
                        />
                    </div>

                    {/* ── Content Mode Toggle ──────────────────────────────────── */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Contenido del mensaje</Label>
                            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border text-sm">
                                <button
                                    type="button"
                                    onClick={() => { setContentMode("text"); setShowPreview(false) }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-xs font-medium ${contentMode === "text"
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <Type className="w-3.5 h-3.5" />
                                    Texto
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContentMode("html")}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-xs font-medium ${contentMode === "html"
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    <Code className="w-3.5 h-3.5" />
                                    HTML
                                </button>
                                {content && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(p => !p)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-xs font-medium ${showPreview
                                                ? "bg-background shadow-sm text-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Vista previa
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Editor area — side by side when preview is open */}
                        <div className={`gap-4 ${showPreview ? "grid grid-cols-2" : ""}`}>
                            {/* Editor */}
                            <div className="flex flex-col">
                                {contentMode === "html" && (
                                    <div className="flex items-center gap-2 mb-1.5 px-1">
                                        <Code className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">Pega aquí tu HTML. El contenido se insertará dentro del template de Agrilpa.</span>
                                    </div>
                                )}
                                <Textarea
                                    id="content"
                                    placeholder={
                                        contentMode === "html"
                                            ? "<h2>Título del correo</h2>\n<p>Hola <strong>{{nombre}}</strong>,</p>\n<p>Tu mensaje aquí...</p>"
                                            : "Escribe aquí el contenido del correo...\n\nPuedes usar varias líneas para separar párrafos."
                                    }
                                    value={content}
                                    onChange={(e) => { setContent(e.target.value); setConfirming(false) }}
                                    disabled={isSending}
                                    rows={14}
                                    className={`text-sm resize-none ${contentMode === "html" ? "font-mono bg-muted/20" : "text-base"}`}
                                />
                                <p className="text-xs text-muted-foreground mt-1.5 px-1">
                                    {contentMode === "text"
                                        ? "Cada línea nueva se convertirá en un salto de línea en el correo"
                                        : "El HTML se insertará directamente en el cuerpo del email"}
                                </p>
                            </div>

                            {/* Preview panel */}
                            {showPreview && (
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1.5 px-1">
                                        <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground font-medium">Vista previa del contenido</span>
                                    </div>
                                    <div
                                        className="border rounded-md p-4 bg-white min-h-[200px] overflow-auto text-sm leading-relaxed"
                                        style={{ maxHeight: "320px" }}
                                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1.5 px-1 italic">
                                        Esta es solo la vista del cuerpo. El email real incluirá encabezado y pie de Agrilpa.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Inline Confirmation ──────────────────────────────────── */}
                    {confirming && (
                        <div className="p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
                            <div className="flex-1">
                                <p className="font-semibold">Confirma el envío</p>
                                <p className="text-sm mt-1">
                                    Se enviará el correo <strong>"{subject}"</strong> a <strong>{recipientSummary()}</strong>.
                                    {contentMode === "html" && <span className="ml-1 text-xs bg-amber-200 px-1.5 py-0.5 rounded">Modo HTML</span>}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <Button size="sm" onClick={handleSend} className="gap-1.5">
                                        <Send className="w-4 h-4" />
                                        Confirmar y enviar
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>Cancelar</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Result ──────────────────────────────────────────────── */}
                    {result && (
                        <div className={`p-4 rounded-lg border flex items-start gap-3 ${result.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                            {result.success
                                ? <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600 shrink-0" />
                                : <AlertCircle className="w-5 h-5 mt-0.5 text-red-600 shrink-0" />
                            }
                            <div className="flex-1 overflow-hidden">
                                {result.success ? (
                                    <>
                                        <p className="font-medium">¡Proceso finalizado!</p>
                                        <p className="text-sm mt-1">
                                            <Users className="w-4 h-4 inline mr-1" />
                                            {result.sent} de {result.totalUsers} correos enviados
                                            {result.failed ? ` (${result.failed} fallidos)` : ""}
                                        </p>
                                        {result.error && (
                                            <div className="mt-2 p-2 bg-red-100/50 rounded text-xs font-mono text-red-700 whitespace-pre-wrap">{result.error}</div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium">Error al enviar</p>
                                        <p className="text-sm mt-1">{result.error}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Send Button ──────────────────────────────────────────── */}
                    {!confirming && (
                        <Button onClick={handleConfirm} disabled={isSending || !canSend} className="w-full gap-2" size="lg">
                            {isSending ? (
                                <><Loader className="w-5 h-5 animate-spin" />Enviando...</>
                            ) : (
                                <><Send className="w-5 h-5" />
                                    {recipientMode === "selected" && selectedUserIds.size > 0
                                        ? `Enviar a ${selectedUserIds.size} usuario${selectedUserIds.size !== 1 ? "s" : ""}`
                                        : "Enviar correo"
                                    }
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
