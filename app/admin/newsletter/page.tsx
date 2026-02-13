"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Send, Loader, CheckCircle2, AlertCircle, Users } from "lucide-react"

export default function NewsletterPage() {
    const [subject, setSubject] = useState("")
    const [content, setContent] = useState("")
    const [recipientType, setRecipientType] = useState<"all" | "specific">("all")
    const [specificEmail, setSpecificEmail] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [result, setResult] = useState<{
        success: boolean
        sent?: number
        failed?: number
        totalUsers?: number
        error?: string
    } | null>(null)

    const handleSend = async () => {
        if (!subject.trim() || !content.trim()) {
            setResult({ success: false, error: "El asunto y el contenido son requeridos" })
            return
        }

        if (recipientType === "specific" && !specificEmail.trim()) {
            setResult({ success: false, error: "El correo del destinatario es requerido" })
            return
        }

        const targetDescription = recipientType === "all" ? "TODOS los usuarios registrados" : `el usuario ${specificEmail}`

        const confirmed = window.confirm(
            `¿Estás seguro de enviar este newsletter a ${targetDescription}?\n\nAsunto: ${subject}`
        )
        if (!confirmed) return

        setIsSending(true)
        setResult(null)

        try {
            const res = await fetch("/api/admin/send-newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject,
                    content,
                    specificEmail: recipientType === "specific" ? specificEmail : undefined
                }),
            })

            const data = await res.json()

            if (res.ok) {
                setResult({
                    success: true,
                    sent: data.sent,
                    failed: data.failed,
                    totalUsers: data.totalUsers,
                })
                if (recipientType === "all") {
                    setSubject("")
                    setContent("")
                }
                // Don't clear form if specific email, easier for testing multiple
            } else {
                setResult({ success: false, error: data.error || "Error al enviar" })
            }
        } catch (err) {
            setResult({ success: false, error: "Error de red. Intenta de nuevo." })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="space-y-6 p-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Mail className="w-8 h-8 text-primary" />
                    Newsletter
                </h1>
                <p className="text-muted-foreground mt-1">
                    Envía notificaciones por correo electrónico a los usuarios
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Componer Newsletter
                    </CardTitle>
                    <CardDescription>
                        {recipientType === "all"
                            ? "El correo será enviado a todos los usuarios registrados en la plataforma"
                            : "El correo será enviado únicamente al destinatario especificado"
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                        <Label className="text-sm font-medium">Destinatarios</Label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="recipientType"
                                    checked={recipientType === "all"}
                                    onChange={() => setRecipientType("all")}
                                    className="accent-primary w-4 h-4"
                                />
                                <span>Enviar a todos los usuarios registrados</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="recipientType"
                                    checked={recipientType === "specific"}
                                    onChange={() => setRecipientType("specific")}
                                    className="accent-primary w-4 h-4"
                                />
                                <span>Enviar a un correo específico</span>
                            </label>
                        </div>

                        {recipientType === "specific" && (
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

                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium">
                            Asunto del correo
                        </Label>
                        <Input
                            id="subject"
                            placeholder="Ej: ¡Novedades en Agrilpa! 🌱"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            disabled={isSending}
                            className="text-base"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content" className="text-sm font-medium">
                            Contenido del mensaje
                        </Label>
                        <Textarea
                            id="content"
                            placeholder="Escribe aquí el contenido del newsletter...&#10;&#10;Puedes usar varias líneas para separar párrafos."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            disabled={isSending}
                            rows={10}
                            className="text-base resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            Cada línea nueva se convertirá en un salto de línea en el correo
                        </p>
                    </div>

                    {result && (
                        <div
                            className={`p-4 rounded-lg border flex items-start gap-3 ${result.success
                                ? "bg-green-50 border-green-200 text-green-800"
                                : "bg-red-50 border-red-200 text-red-800"
                                }`}
                        >
                            {result.success ? (
                                <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-600 shrink-0" />
                            ) : (
                                <AlertCircle className="w-5 h-5 mt-0.5 text-red-600 shrink-0" />
                            )}
                            <div>
                                {result.success ? (
                                    <>
                                        <p className="font-medium">¡Newsletter enviado exitosamente!</p>
                                        <p className="text-sm mt-1">
                                            <Users className="w-4 h-4 inline mr-1" />
                                            {result.sent} de {result.totalUsers} correos enviados
                                            {result.failed ? ` (${result.failed} fallidos)` : ""}
                                        </p>
                                    </>
                                ) : (
                                    <p className="font-medium">{result.error}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={handleSend}
                        disabled={isSending || !subject.trim() || !content.trim()}
                        className="w-full gap-2"
                        size="lg"
                    >
                        {isSending ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Enviando a todos los usuarios...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Enviar Newsletter
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
