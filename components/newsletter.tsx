"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Leaf } from "lucide-react"
import { useState, useEffect } from "react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [hasSubscribedBefore, setHasSubscribedBefore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkSubscription = async () => {
      const savedEmail = localStorage.getItem("agrilpa_subscribed_email")
      if (savedEmail) {
        try {
          const response = await fetch(`/api/newsletter/subscribe?email=${encodeURIComponent(savedEmail)}`)

          if (!response.ok) {
            console.error("[v0] Error checking subscription, status:", response.status)
            const localSubscribed = localStorage.getItem("agrilpa_subscribed")
            if (localSubscribed === "true") {
              setHasSubscribedBefore(true)
            }
            return
          }

          const data = await response.json()
          if (data.subscribed) {
            setHasSubscribedBefore(true)
          }
        } catch (err) {
          console.error("[v0] Error checking subscription:", err)
          const localSubscribed = localStorage.getItem("agrilpa_subscribed")
          if (localSubscribed === "true") {
            setHasSubscribedBefore(true)
          }
        }
      }
    }
    checkSubscription()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "newsletter_component",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setError("Este correo ya está registrado")
        } else {
          throw new Error(data.error || "Error al procesar la suscripción")
        }
        setIsSubmitting(false)
        return
      }

      localStorage.setItem("agrilpa_subscribed", "true")
      localStorage.setItem("agrilpa_subscribed_email", email)

      setIsSubscribed(true)
      setHasSubscribedBefore(true)
      setEmail("")
      setIsSubmitting(false)

      setTimeout(() => setIsSubscribed(false), 5000)
    } catch (err) {
      console.error("[v0] Subscription error:", err)
      setError(err instanceof Error ? err.message : "Error al procesar la suscripción")
      setIsSubmitting(false)
    }
  }

  if (hasSubscribedBefore) {
    return null
  }

  return (
    <section className="relative py-16 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      <div className="container max-w-2xl mx-auto relative z-10">
        {isSubscribed ? (
          <div className="flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            <p className="text-lg font-semibold text-foreground">
              ¡Gracias por suscribirte! Revisa tu correo para confirmar.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Leaf className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-balance leading-tight">
                Sé parte de nuestra <span className="text-primary">comunidad agrícola</span>
              </h3>
              <p className="text-base text-muted-foreground text-pretty max-w-xl mx-auto leading-relaxed">
                Accede a tendencias del mercado, oportunidades exclusivas y conecta con exportadores e importadores en
                toda Latinoamérica.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto w-full">
              <div className="flex-1 relative">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="bg-background/50 border-2 border-border/50 hover:border-primary/30 focus:border-primary transition-colors h-12 text-base"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="h-12 px-8 font-semibold text-base">
                {isSubmitting ? "Enviando..." : "Suscribirse"}
              </Button>
            </form>

            {error && (
              <div className="mt-3 text-center text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <p className="text-sm text-muted-foreground text-center">
              🔒 Tu información es segura. Cancela tu suscripción cuando quieras.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
