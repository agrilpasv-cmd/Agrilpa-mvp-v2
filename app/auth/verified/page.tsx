"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

function VerifiedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasError = searchParams.get("error") === "true"
  const [countdown, setCountdown] = useState(4)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    if (hasError) return

    const supabase = createBrowserClient()

    // Supabase puts session tokens in the URL hash after email verification.
    // We wait for onAuthStateChange to fire with SIGNED_IN before starting countdown.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setSessionReady(true)
      }
    })

    // Also check if session already exists (page refresh case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [hasError])

  useEffect(() => {
    if (hasError || !sessionReady) return

    // Start countdown only once session is confirmed
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push("/dashboard")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [hasError, sessionReady, router])

  return (
    <div className="min-h-screen flex w-full">
      {/* Left column - decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-end overflow-hidden"
        style={{ backgroundImage: 'url("/auth-bg-cornfield.jpg")', backgroundSize: "100% 100%" }}
      >
        <div className="relative z-10 p-12 pb-16">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Bienvenido al mercado<br />agrícola global.
          </h2>
          <p className="text-gray-200 text-lg leading-relaxed">
            Tu cuenta ha sido verificada. Ahora puedes cotizar, conectar y expandir tu negocio agrícola.
          </p>
        </div>
      </div>

      {/* Right column */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-md text-center space-y-6">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-block hover:opacity-80 transition">
              <Image src="/agrilpa-logo.svg" alt="Agrilpa Logo" width={160} height={48} />
            </Link>
          </div>

          {hasError ? (
            /* ---- Error state ---- */
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900">Enlace inválido o expirado</h1>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                El enlace de verificación no es válido o ya fue utilizado. Los enlaces expiran después de 24 horas.
              </p>

              <div className="space-y-3 pt-2">
                <Link
                  href="/auth?mode=register"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition"
                >
                  Volver a registrarse
                </Link>
                <Link
                  href="/auth"
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
                >
                  Ir al inicio de sesión
                </Link>
              </div>
            </>
          ) : (
            /* ---- Success state ---- */
            <>
              {/* Animated checkmark circle */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                {/* Ring animation */}
                <div className="absolute inset-0 rounded-full border-4 border-green-400 opacity-30 animate-ping" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">¡Cuenta activada!</h1>
                <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                  Tu correo ha sido verificado y tu cuenta en Agrilpa está lista. Bienvenido a la plataforma agrícola global.
                </p>
              </div>

              {/* Session / countdown status */}
              {sessionReady ? (
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-full">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Redirigiendo en {countdown} segundo{countdown !== 1 ? "s" : ""}...
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-500 text-sm font-medium px-4 py-2 rounded-full">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Iniciando sesión automáticamente...
                </div>
              )}

              {/* Manual redirect button */}
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3.5 rounded-lg hover:bg-primary/90 transition"
              >
                Ir al Dashboard ahora
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              <Link
                href="/auth"
                className="block text-sm text-muted-foreground hover:text-foreground transition"
              >
                Ir al inicio de sesión manualmente
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifiedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Activando tu cuenta...</p>
        </div>
      </div>
    }>
      <VerifiedContent />
    </Suspense>
  )
}
