"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Mail, Loader2 } from "lucide-react"

export default function TestEmailPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleSendTest = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        setResult(null)

        try {
            const response = await fetch("/api/admin/test-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()
            setResult({ success: response.ok, data })
        } catch (error: any) {
            setResult({ success: false, data: { error: error.message } })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Prueba de Configuración de Email (Resend)
                    </CardTitle>
                    <CardDescription>
                        Envía un correo de prueba para verificar que tu API Key de Resend está funcionando correctamente.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSendTest} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Correo de destino
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu-correo@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Nota: Si usas el plan gratuito de Resend y no tienes dominio verificado,
                                solo puedes enviar correos a la dirección registrada en tu cuenta de Resend.
                            </p>
                        </div>

                        <Button type="submit" disabled={loading || !email} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                "Enviar Correo de Prueba"
                            )}
                        </Button>
                    </form>

                    {result && (
                        <div className={`mt-6 p-4 rounded-lg border ${result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                            <div className="flex items-start gap-3">
                                {result.success ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                )}
                                <div className="flex-1 overflow-hidden">
                                    <h4 className={`font-semibold ${result.success ? "text-green-800" : "text-red-800"}`}>
                                        {result.success ? "Correo enviado exitosamente" : "Error al enviar correo"}
                                    </h4>
                                    <pre className="mt-2 text-xs overflow-x-auto p-2 bg-white/50 rounded border border-black/5 whitespace-pre-wrap break-all">
                                        {JSON.stringify(result.data, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
