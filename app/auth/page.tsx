"use client"

import type React from "react"
import { Suspense, useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Mail, Lock, User, Phone, MapPin, ArrowRight, ArrowLeft } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { AuthStorage } from "@/lib/auth-storage"

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabaseRef = useRef(createBrowserClient())
  const [isLogin, setIsLogin] = useState(true)
  const [registrationStep, setRegistrationStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    companyName: "",
    userType: "vendedor",
    countryCode: "",
    phoneNumber: "",
    country: "",
    product1: "",
    product2: "",
    product3: "",
    volumeRange: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseRef.current.auth.getSession()

        if (session?.user) {
          console.log("[v0] User already has active session, checking profile...")

          // Verificar el perfil del usuario para determinar el rol
          const { data: profile } = await supabaseRef.current
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle()

          if (profile?.role === "admin") {
            console.log("[v0] Admin user detected, redirecting to /admin")
            router.push("/admin")
            return
          }

          console.log("[v0] Regular user detected, redirecting to /inicio")
          router.push("/inicio")
        }
      } catch (err) {
        console.error("[v0] Error checking existing session:", err)
      }
    }

    checkExistingSession()
  }, [router])

  useEffect(() => {
    const mode = searchParams.get("mode")
    if (mode === "register") {
      setIsLogin(false)
    } else if (mode === "login") {
      setIsLogin(true)
      setRegistrationStep(1) // Reset registration step for next registration
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numericValue = value.replace(/[^\d]/g, "")
    setFormData({
      ...formData,
      [name]: numericValue,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isLogin && registrationStep === 1) {
      // Validate step 1 fields
      if (
        !formData.userType ||
        !formData.fullName ||
        !formData.companyName ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Por favor completa todos los campos")
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden")
        return
      }

      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        return
      }

      // Move to step 2
      setRegistrationStep(2)
      setError("")
      return
    }

    if (!isLogin && registrationStep === 2) {
      // Validate step 2 fields
      if (!formData.country || !formData.countryCode || !formData.phoneNumber) {
        setError("Por favor completa todos los campos requeridos")
        return
      }

      if (!formData.product1 || !formData.product2 || !formData.product3 || !formData.volumeRange) {
        setError("Por favor selecciona tus productos de interés y volumen de movimiento")
        return
      }

      // All validation passed, proceed with registration
      setLoading(true)

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            companyName: formData.companyName,
            phone: `${formData.countryCode}${formData.phoneNumber}`,
            country: formData.country,
            userType: formData.userType,
            product1: formData.product1,
            product2: formData.product2,
            product3: formData.product3,
            volumeRange: formData.volumeRange,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Error en la autenticación")
          setLoading(false)
          return
        }

        setSubmitted(true)
        console.log("[v0] Registration successful, redirecting to login...")

        setTimeout(() => {
          console.log("[v0] Reloading page and redirecting to login")
          window.location.href = "/auth?mode=login"
        }, 2000) // Show success message for 2 seconds before redirecting
      } catch (err) {
        console.error("[v0] Auth error:", err)
        setError("Error de conexión. Intenta nuevamente.")
        setLoading(false)
      }
      return
    }

    // ... existing login code ...
    setLoading(true)

    if (!isLogin) {
      if (formData.password !== formData.confirmPassword) {
        setError("Las contraseñas no coinciden")
        setLoading(false)
        return
      }
      if (formData.password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres")
        setLoading(false)
        return
      }
    }

    try {
      if (isLogin) {
        const { data, error: loginError } = await supabaseRef.current.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (loginError) {
          console.error("[v0] Login error:", loginError)
          setError("Credenciales inválidas")
          setLoading(false)
          return
        }

        if (!data.user) {
          setError("Error al iniciar sesión")
          setLoading(false)
          return
        }

        console.log("[v0] User logged in:", data.user.id, data.user.email)

        const isAdmin = data.user.email === "agrilpasv@gmail.com"
        const role = isAdmin ? "admin" : "user"
        AuthStorage.setSession(data.user.id, data.user.email || "", role)

        if (isAdmin) {
          console.log("[v0] Admin email detected, redirecting to /admin")
          setSubmitted(true)
          window.location.href = "/admin"
          return
        }

        console.log("[v0] Regular user, redirecting to /inicio")
        setSubmitted(true)
        window.location.href = "/inicio"
      }
    } catch (err) {
      console.error("[v0] Auth error:", err)
      setError("Error de conexión. Intenta nuevamente.")
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: 'url("/agricultural-fields-farmer-harvest-crops-farming-c.jpg")',
      }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-gray-200 transition">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg font-medium">Inicio</span>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 hover:opacity-80 transition">
              <Image src="/logo-blanco.svg" alt="Agrilpa Logo" width={100} height={100} />
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">{isLogin ? "Inicia Sesión" : "Únete a Agrilpa"}</h1>
            <p className="text-gray-100 text-lg">
              {isLogin
                ? "Accede a tu cuenta en la plataforma de comercio agrícola global"
                : "Comienza a conectar con compradores y vendedores del mundo"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
                  )}

                  {!isLogin && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between">
                        <div
                          className={`flex-1 h-1 rounded-full ${registrationStep >= 1 ? "bg-primary" : "bg-gray-300"}`}
                        ></div>
                        <div className="mx-2 text-sm font-medium text-foreground">{registrationStep}/2</div>
                        <div
                          className={`flex-1 h-1 rounded-full ${registrationStep >= 2 ? "bg-primary" : "bg-gray-300"}`}
                        ></div>
                      </div>
                    </div>
                  )}

                  {isLogin && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Correo Electrónico</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="tu@email.com"
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Iniciando..." : "Iniciar Sesión"} <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {!isLogin && registrationStep === 1 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Tipo de Usuario</label>
                        <select
                          name="userType"
                          value={formData.userType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                        >
                          <option value="vendedor">Vendedor Agrícola</option>
                          <option value="comprador">Comprador/Distribuidor</option>
                          <option value="empresa">Empresa Industrial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Nombre Completo</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="Juan Pérez"
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Nombre de la Empresa</label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Agro Exportaciones S.A."
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Correo Electrónico</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="tu@email.com"
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Confirmar Contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                          <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
                      >
                        Continuar <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {!isLogin && registrationStep === 2 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">País</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            placeholder="El Salvador"
                            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
                        <div className="flex gap-3">
                          <div className="w-24">
                            <div className="relative">
                              <span className="absolute left-3 top-3 text-muted-foreground text-sm font-medium">+</span>
                              <input
                                type="text"
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={handlePhoneInput}
                                inputMode="numeric"
                                placeholder="503"
                                maxLength="4"
                                className="w-full pl-7 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex-1">
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                              <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handlePhoneInput}
                                inputMode="numeric"
                                placeholder="6000-0000"
                                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Productos de Interés</label>
                        <div className="grid grid-cols-3 gap-4">
                          <input
                            type="text"
                            name="product1"
                            value={formData.product1}
                            onChange={handleInputChange}
                            placeholder="ej. Algodón"
                            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                          />
                          <input
                            type="text"
                            name="product2"
                            value={formData.product2}
                            onChange={handleInputChange}
                            placeholder="ej. Mangos"
                            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                          />
                          <input
                            type="text"
                            name="product3"
                            value={formData.product3}
                            onChange={handleInputChange}
                            placeholder="ej. Fertilizantes"
                            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Volumen de Movimiento Anual
                        </label>
                        <select
                          name="volumeRange"
                          value={formData.volumeRange}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        >
                          <option value="">Selecciona un rango</option>
                          <option value="0-5000">De $0 a $5,000</option>
                          <option value="5001-50000">De $5,001 a $50,000</option>
                          <option value="50001-250000">De $50,001 a $250,000</option>
                          <option value="250001-500000">De $250,001 a $500,000</option>
                          <option value="500001-1000000">De $500,001 a $1,000,000</option>
                          <option value="1000000plus">Más de $1,000,000</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setRegistrationStep(1)}
                          className="flex-1 bg-gray-200 text-foreground font-semibold py-3 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" /> Volver
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Creando..." : "Registrarse"} <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-card text-muted-foreground">O</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        setRegistrationStep(1)
                        setFormData({
                          email: "",
                          password: "",
                          confirmPassword: "",
                          fullName: "",
                          companyName: "",
                          userType: "vendedor",
                          countryCode: "",
                          phoneNumber: "",
                          country: "",
                          product1: "",
                          product2: "",
                          product3: "",
                          volumeRange: "",
                        })
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      {isLogin ? "¿No tienes cuenta? Regístrate aquí" : "¿Ya tienes cuenta? Inicia sesión aquí"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-2xl">✓</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {isLogin ? "¡Bienvenido!" : "¡Registro Exitoso!"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {isLogin
                      ? "Sesión iniciada correctamente. Redirigiendo..."
                      : "Tu cuenta ha sido creada. Puedes iniciar sesión ahora."}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div
                      className="bg-primary h-1 rounded-full animate-pulse"
                      style={{ animation: "pulse 1s ease-in-out infinite" }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <div className="space-y-8 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {isLogin ? "Acceso Rápido y Seguro" : "Únete a Agrilpa"}
                  </h2>
                  <p className="text-gray-100 text-lg leading-relaxed">
                    {isLogin
                      ? "Ingresa a tu cuenta para explorar oportunidades de negocio, gestionar tus productos y conectar con compradores de todo el mundo."
                      : "Regístrate como vendedor o comprador y comienza a expandir tu negocio agrícola en el mercado global. Es rápido, seguro y totalmente gratuito."}
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: "🌍", title: "Mercado Global", description: "Acceso a compradores internacionales" },
                    { icon: "✓", title: "Verificado", description: "Perfiles y transacciones 100% confiables" },
                    { icon: "💰", title: "Mejores Precios", description: "Sin intermediarios, márgenes optimizados" },
                    { icon: "📱", title: "Plataforma Digital", description: "Negocio desde cualquier dispositivo" },
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <div className="text-3xl flex-shrink-0 w-8">{item.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <p className="text-sm text-gray-200">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black/50">
          <div className="text-white">Cargando...</div>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  )
}
