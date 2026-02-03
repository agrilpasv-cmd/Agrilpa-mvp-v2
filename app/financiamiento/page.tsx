"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { DollarSign, CreditCard, TrendingUp, Shield, Clock, CheckCircle, Users, BarChart3 } from "lucide-react"

async function trackFinancingClick(financingType: string) {
  try {
    // Get user email if available from sessionStorage
    const userEmail = sessionStorage.getItem("user_email")
    const userId = sessionStorage.getItem("user_id")

    const response = await fetch("/api/financing/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        financing_type: financingType,
        email: userEmail,
        user_id: userId,
      }),
    })

    if (response.ok) {
      console.log("[v0] Click tracked for:", financingType)
    }
  } catch (error) {
    console.error("[v0] Error tracking click:", error)
    // Don't throw error - tracking shouldn't block navigation
  }
}

export default function Financiamiento() {
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleFinancingOptionClick = async (financingType: string) => {
    await trackFinancingClick(financingType)
    setShowDialog(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gracias por tu interés</AlertDialogTitle>
            <AlertDialogDescription>
              Sabemos que te interesa esta opción y estará disponible pronto. Gracias por tu interés en nuestras
              soluciones de financiamiento agrícola.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setShowDialog(false)}>Entendido</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-primary/5">
        <div className="absolute inset-0 z-0">
          <Image
            src="/agricultural-financing-business-handshake.jpg"
            alt="Financiamiento agrícola"
            fill
            className="object-cover opacity-70"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Soluciones Financieras</span>
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
            Financiamiento Agrícola Inteligente
          </h1>
          <p className="mx-auto max-w-2xl text-xl md:text-2xl text-balance text-foreground">
            Acceda a opciones de financiamiento flexibles diseñadas específicamente para el comercio agrícola B2B
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center">
            <Button asChild size="lg">
              <Link href="/auth?mode=register">Solicitar Financiamiento</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contacto">Hablar con un Asesor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Beneficios Principales */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              ¿Por Qué Elegir Nuestro Financiamiento?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Soluciones financieras adaptadas a las necesidades del sector agrícola
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Aprobación Rápida</h3>
              <p className="leading-relaxed text-muted-foreground">
                Proceso de aprobación ágil con respuesta en 48 horas. Documentación simplificada y decisión inmediata
                para que no pierdas oportunidades de negocio.
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Términos Flexibles</h3>
              <p className="leading-relaxed text-muted-foreground">
                Plazos de pago adaptados a los ciclos de tu negocio. Desde 30 hasta 180 días con opciones de renovación
                según tus necesidades operativas.
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Tasas Competitivas</h3>
              <p className="leading-relaxed text-muted-foreground">
                Accede a las mejores tasas del mercado agrícola. Sin comisiones ocultas y con total transparencia en
                cada operación financiera.
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Transacciones Seguras</h3>
              <p className="leading-relaxed text-muted-foreground">
                Protección completa en cada operación con garantías bancarias y seguros disponibles. Tu inversión está
                respaldada por instituciones confiables.
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Datos en Tiempo Real</h3>
              <p className="leading-relaxed text-muted-foreground">
                Acceso a información de mercado actualizada y análisis de precios para tomar decisiones financieras
                informadas y estratégicas.
              </p>
            </div>

            <div className="group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">Asesoría Personalizada</h3>
              <p className="leading-relaxed text-muted-foreground">
                Equipo especializado en agronegocios listo para orientarte. Acompañamiento continuo desde la solicitud
                hasta el cierre de cada operación.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Opciones de Financiamiento */}
      <section className="bg-muted/50 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Opciones de Financiamiento
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Elige la solución que mejor se adapte a tu operación
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Línea de Crédito */}
            <div className="rounded-2xl bg-card p-8 shadow-lg border border-border hover:border-primary transition-all">
              <div className="mb-6">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <CreditCard className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-foreground">Línea de Crédito</h3>
                <p className="text-muted-foreground">Crédito rotativo para múltiples operaciones</p>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Hasta $500,000 USD disponibles</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Renovación automática mensual</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Tasa preferencial del 8% anual</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Sin garantías inmobiliarias</span>
                </li>
              </ul>
              <Button className="w-full" onClick={() => handleFinancingOptionClick("linea_credito")}>
                Solicitar Ahora
              </Button>
            </div>

            {/* Financiamiento por Orden */}
            <div className="rounded-2xl bg-primary p-8 shadow-lg border-2 border-primary relative overflow-hidden">
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-foreground px-4 py-1 text-xs font-bold rounded-bl-lg">
                MÁS POPULAR
              </div>
              <div className="mb-6">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">Financiamiento por Orden</h3>
                <p className="text-white/90">Pago específico para cada transacción</p>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/90">Financiamiento del 100% del pedido</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/90">Plazos de 30 a 120 días</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/90">Aprobación en 24 horas</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-white/90">Ideal para operaciones puntuales</span>
                </li>
              </ul>
              <Button
                className="w-full bg-white text-primary hover:bg-white/90"
                onClick={() => handleFinancingOptionClick("por_orden")}
              >
                Comenzar
              </Button>
            </div>

            {/* Prefinanciamiento de Cosecha */}
            <div className="rounded-2xl bg-card p-8 shadow-lg border border-border hover:border-primary transition-all">
              <div className="mb-6">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-foreground">Prefinanciamiento</h3>
                <p className="text-muted-foreground">Anticipo para producción y cosecha</p>
              </div>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Hasta el 70% del valor estimado</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Plazos de 90 a 180 días</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Pago al momento de la venta</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Para productores verificados</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => handleFinancingOptionClick("prefinanciamiento")}
              >
                Más Información
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
              Proceso Simple en 4 Pasos
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Obtén financiamiento para tus operaciones agrícolas de forma rápida y segura
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative text-center">
              <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">Registro</h3>
              <p className="text-sm text-muted-foreground">
                Crea tu cuenta y completa tu perfil empresarial con la documentación básica
              </p>
            </div>

            <div className="relative text-center">
              <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">Solicitud</h3>
              <p className="text-sm text-muted-foreground">
                Envía tu solicitud de financiamiento con los detalles de la operación comercial
              </p>
            </div>

            <div className="relative text-center">
              <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">Evaluación</h3>
              <p className="text-sm text-muted-foreground">
                Nuestro equipo analiza tu solicitud y te responde en máximo 48 horas hábiles
              </p>
            </div>

            <div className="relative text-center">
              <div className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                4
              </div>
              <h3 className="mb-2 text-lg font-bold text-foreground">Desembolso</h3>
              <p className="text-sm text-muted-foreground">
                Recibe los fondos aprobados y realiza tu operación comercial sin demoras
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl text-balance">
              ¿Listo para Impulsar tu Negocio?
            </h2>
            <p className="mx-auto mb-8 text-lg text-muted-foreground max-w-2xl">
              Únete a cientos de empresas agrícolas que ya confían en nuestras soluciones de financiamiento. Comienza
              hoy y lleva tu operación al siguiente nivel.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="min-w-[200px]">
                <Link href="/auth?mode=register">Solicitar Ahora</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-w-[200px] bg-transparent">
                <Link href="/contacto">Hablar con un Experto</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
