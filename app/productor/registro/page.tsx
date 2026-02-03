"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from 'next/navigation'
import { ProducerRegistrationForm } from "@/components/producer-registration-form"
import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'
import { Footer } from "@/components/footer"

export default function ProducerRegistrationPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [isVerified, setIsVerified] = useState(true)
  const [showAuthForm, setShowAuthForm] = useState(false)

  // Simulating authentication check
  useEffect(() => {
    // In a real app, check if user is logged in
    // For now, we'll show the form directly
    setIsAuthenticated(true)
    setIsVerified(true) // Allow users to create publications without verification
  }, [])

  const handleGoToAuth = () => {
    router.push("/auth")
  }

  const handleGoToVerification = () => {
    setShowAuthForm(true)
  }

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-cover bg-center relative"
        style={{
          backgroundImage: 'url("/agricultural-fields-farmer-harvest-crops-farming-c.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="container mx-auto px-4 py-12 relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <Image src="/agrilpa-logo.svg" alt="Agrilpa Logo" width={100} height={100} className="mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Inicia Sesión</h1>
            <p className="text-muted-foreground mb-8">
              Para registrarte como vendedor, primero necesitas iniciar sesión en tu cuenta de Agrilpa.
            </p>
            <Button
              onClick={handleGoToAuth}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mb-4 flex items-center justify-center gap-2"
            >
              Ir a Iniciar Sesión
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <Link href="/auth" className="text-primary hover:underline font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Verification check removed - users can now create products directly

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image src="/agrilpa-logo.svg" alt="Agrilpa Logo" width={100} height={100} />
          </Link>
          <div className="text-sm text-muted-foreground">
            Registro como <span className="font-semibold text-foreground">Vendedor Agrícola</span>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <ProducerRegistrationForm />

      {/* Footer */}
      <Footer />
    </div>
  )
}
