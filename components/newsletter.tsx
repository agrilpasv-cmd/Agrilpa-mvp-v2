"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Leaf } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

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
            console.error("[Agrilpa] Error checking subscription, status:", response.status)
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
          console.error("[Agrilpa] Error checking subscription:", err)
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
      console.error("[Agrilpa] Subscription error:", err)
      setError(err instanceof Error ? err.message : "Error al procesar la suscripción")
      setIsSubmitting(false)
    }
  }

  if (hasSubscribedBefore) {
    return null
  }

  return (
    <section className="relative py-16 md:py-24 bg-background overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          
          {/* ── LEFT: Text & Form ── */}
          <div className="order-2 md:order-1">
            {isSubscribed ? (
              <div className="flex flex-col items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-2xl font-bold text-foreground">¡Gracias por suscribirte!</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  Revisa tu correo electrónico para confirmar tu suscripción.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-[1.1] mb-4">
                    Sé parte de nuestra <br className="hidden lg:block"/>
                    <span className="text-primary">comunidad agrícola</span>
                  </h3>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
                    Accede a tendencias del mercado, oportunidades exclusivas y conecta con exportadores e importadores en
                    toda Latinoamérica.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md w-full pt-2">
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-12 sm:h-14 flex-1 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:border-primary shadow-sm px-4"
                  />
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="h-12 sm:h-14 px-8 rounded-xl font-bold text-base bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-md whitespace-nowrap transition-all"
                  >
                    {isSubmitting ? "Enviando..." : "Suscribirse"}
                  </Button>
                </form>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2 max-w-md">
                    {error}
                  </div>
                )}

                <p className="text-sm text-muted-foreground pt-2">
                  Tu información es segura. Cancela tu suscripción cuando quieras.
                </p>
              </div>
            )}
          </div>

          {/* ── RIGHT: Image Stack ── */}
          <div className="order-1 md:order-2 relative flex justify-center md:justify-end">
            <div className="relative w-full max-w-sm lg:max-w-md">
              {/* Stacked background cards */}
              <div className="absolute inset-0 rounded-3xl transform rotate-6 translate-x-4 translate-y-3 opacity-80 overflow-hidden shadow-xl border border-white/10">
                <img
                  src="/manos-cultivando-en-la-tierra.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-3xl transform -rotate-3 -translate-x-2 -translate-y-2 opacity-60 overflow-hidden shadow-xl border border-white/10">
                <img
                  src="/exportaci-n-de-productos-agr-colas-en-contenedores.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Main image */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="/agricultural-landscape-modern-farm.jpg"
                  alt="Comunidad Agrilpa"
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  )
}
