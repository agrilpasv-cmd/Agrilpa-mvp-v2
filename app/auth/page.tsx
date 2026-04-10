"use client"

import type React from "react"
import { Suspense, useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSearchParams } from "next/navigation"
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { CountryPicker, PhoneCodePicker } from "@/components/ui/country-picker"
import { MapPin } from "lucide-react"
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
    state: "",
    product1: "",
    product2: "",
    product3: "",
    supplyCountry1: "",
    supplyCountry2: "",
    supplyCountry3: "",
    providerCountry1: "",
    providerCountry2: "",
    providerCountry3: "",
    hasExportCertificates: "",
    doesProvideInternationally: "false",
    volumeRange: "",
    companyWebsite: "",
    address: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // Show/hide password toggles
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [showRegPwd, setShowRegPwd] = useState(false)
  const [showRegConfirmPwd, setShowRegConfirmPwd] = useState(false)

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseRef.current.auth.getSession()

        if (session?.user) {
          console.log("[Agrilpa] User already has active session, checking profile...")

          // Verificar el perfil del usuario para determinar el rol
          const { data: profile } = await supabaseRef.current
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle()

          if (profile?.role === "admin") {
            console.log("[Agrilpa] Admin user detected, redirecting to /admin")
            router.push("/admin")
            return
          }

          console.log("[Agrilpa] Regular user detected, redirecting to /")
          router.push("/")
        }
      } catch (err) {
        console.error("[Agrilpa] Error checking existing session:", err)
      }
    }

    checkExistingSession()
  }, [router])

  useEffect(() => {
    const mode = searchParams.get("mode")
    const emailParam = searchParams.get("email")
    if (mode === "register") {
      setIsLogin(false)
    } else if (mode === "login") {
      setIsLogin(true)
      setRegistrationStep(1)
      // Pre-fill email if coming from registration
      if (emailParam) {
        setFormData(prev => ({ ...prev, email: decodeURIComponent(emailParam) }))
      }
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
        !formData.fullName ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Por favor completa los datos de tu cuenta")
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
      if (
        !formData.userType ||
        !formData.companyName ||
        !formData.country ||
        !formData.state ||
        !formData.address ||
        !formData.countryCode ||
        !formData.phoneNumber
      ) {
        setError("Por favor completa todos los campos requeridos de tu perfil comercial")
        return
      }

      // Validate export certificates field (required)
      if (formData.hasExportCertificates === "") {
        setError("Por favor indica si posees certificados para exportar")
        return
      }

      // Move to step 3
      setRegistrationStep(3)
      setError("")
      return
    }

    if (!isLogin && registrationStep === 3) {
      // Validate step 3 fields
      if (!formData.product1 && !formData.product2 && !formData.product3) {
        setError("Por favor ingresa al menos un producto de interés")
        return
      }

      if (formData.doesProvideInternationally === "true" && !formData.providerCountry1) {
        setError("Por favor ingresa al menos un país del cual te abasteces o provees")
        return
      }

      if (!formData.volumeRange) {
        setError("Por favor selecciona tu volumen de movimiento")
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
            phone: `+${formData.countryCode} ${formData.phoneNumber}`,
            country: formData.country,
            state: formData.state,
            userType: formData.userType,
            product1: formData.product1,
            product2: formData.product2,
            product3: formData.product3,
            volumeRange: formData.volumeRange,
            companyWebsite: formData.companyWebsite,
            address: formData.address,
            supplyCountry1: formData.supplyCountry1,
            supplyCountry2: formData.supplyCountry2,
            supplyCountry3: formData.supplyCountry3,
            providerCountry1: formData.doesProvideInternationally === "true" ? formData.providerCountry1 : "",
            providerCountry2: formData.doesProvideInternationally === "true" ? formData.providerCountry2 : "",
            providerCountry3: formData.doesProvideInternationally === "true" ? formData.providerCountry3 : "",
            hasExportCertificates: formData.hasExportCertificates === "true",
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "Error en la autenticación")
          setLoading(false)
          return
        }

        setSubmitted(true)
        console.log("[Agrilpa] Registration successful, redirecting to login...")

        setTimeout(() => {
          console.log("[Agrilpa] Reloading page and redirecting to login")
          window.location.href = `/auth?mode=login&email=${encodeURIComponent(formData.email)}`
        }, 2000) // Show success message for 2 seconds before redirecting
      } catch (err) {
        console.error("[Agrilpa] Auth error:", err)
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
          console.error("[Agrilpa] Login error:", loginError)
          setError("Credenciales inválidas")
          setLoading(false)
          return
        }

        if (!data.user) {
          setError("Error al iniciar sesión")
          setLoading(false)
          return
        }

        console.log("[Agrilpa] User logged in:", data.user.id, data.user.email)

        const isAdmin = data.user.email === "agrilpasv@gmail.com"
        const role = isAdmin ? "admin" : "user"
        AuthStorage.setSession(data.user.id, data.user.email || "", role)

        if (isAdmin) {
          console.log("[Agrilpa] Admin email detected, redirecting to /admin")
          setSubmitted(true)
          window.location.href = "/admin"
          return
        }

        console.log("[Agrilpa] Regular user, redirecting to /")
        setSubmitted(true)
        window.location.href = "/"
      }
    } catch (err) {
      console.error("[Agrilpa] Auth error:", err)
      setError("Error de conexión. Intenta nuevamente.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Columna Izquierda (Imagen e información) - Oculta en móviles */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden">
        {/* Capa de fondo con imagen */}
        <div 
          className="absolute inset-0 bg-no-repeat bg-center"
          style={{ backgroundImage: 'url("/auth-bg-cornfield.jpg")', backgroundSize: '100% 100%' }}
        />

        
        {/* Contenido superior de la columna izquierda */}
        <div className="relative z-10 p-8 xl:p-12 flex flex-col h-full justify-end">
          <Link href="/" className="absolute top-8 left-8 xl:top-12 xl:left-12 text-white hover:text-gray-200 transition">
            <ArrowLeft className="w-7 h-7" />
          </Link>
          {/* Contenido inferior de la columna izquierda */}
          <div className="mt-auto pb-12">
            <div className="flex gap-8 items-end">
              {/* Texto a la izquierda */}
              <div className="flex-1">
                <h2 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                  {isLogin 
                    ? "Cotiza, reserva y realiza el seguimiento de tus productos en línea." 
                    : "Conecta y expande tu negocio en el mercado agrícola global."}
                </h2>
                <p className="text-lg text-gray-200 leading-relaxed">
                  {isLogin
                    ? "Gestiona todas tus necesidades comerciales en un solo lugar. Inicia sesión para disfrutar de las ventajas del comercio digital y realiza transacciones con facilidad."
                    : "Regístrate como vendedor o comprador y comienza a expandir tu negocio agrícola en el mercado global. Es rápido, seguro y totalmente gratuito."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha (Formulario) */}
      <div className="w-full lg:w-1/2 flex flex-col overflow-y-auto bg-white">
        <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-12 xl:px-24 max-w-2xl mx-auto w-full">
          
          {/* Logo de Agrilpa */}
          <div className="flex justify-center mb-10">
            <Link href="/" className="inline-block hover:opacity-80 transition">
              <Image src="/agrilpa-logo.svg" alt="Agrilpa Logo" width={170} height={50} />
            </Link>
          </div>

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Volver a Inicio</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {isLogin ? "Iniciar Sesión" : "Únete a Agrilpa"}
            </h1>
            {!isLogin && (
              <p className="text-muted-foreground text-sm mt-2">
                ¿Ya tienes una cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(true)
                    setRegistrationStep(1)
                    setError("")
                  }}
                  className="text-primary hover:underline font-semibold"
                >
                  Inicia sesión
                </button>
              </p>
            )}
          </div>

          <div className="w-full">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
                )}

                {!isLogin && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div className={`flex-1 h-1 rounded-full ${registrationStep >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
                      <div className="mx-3 text-xs font-semibold text-foreground bg-gray-100 px-2 py-1 rounded-full">{registrationStep}/3</div>
                      <div className={`flex-1 h-1 rounded-full ${registrationStep >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Correo electrónico *</label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="tu@email.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Contraseña *</label>
                      <div className="relative">
                        <input
                          type={showLoginPwd ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPwd(p => !p)}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showLoginPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                       <input type="checkbox" id="remember" className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                       <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">Acuérdate de mí</label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary text-white font-semibold py-3.5 rounded-md hover:bg-primary/90 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                    >
                      {loading ? "Iniciando..." : "Iniciar Sesión"} <ArrowRight className="w-5 h-5 ml-1" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false)
                        setRegistrationStep(1)
                        setError("")
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
                          state: "",
                          product1: "",
                          product2: "",
                          product3: "",
                          supplyCountry1: "",
                          supplyCountry2: "",
                          supplyCountry3: "",
                          providerCountry1: "",
                          providerCountry2: "",
                          providerCountry3: "",
                          hasExportCertificates: "",
                          doesProvideInternationally: "false",
                          volumeRange: "",
                          companyWebsite: "",
                          address: "",
                        })
                      }}
                      className="w-full border-2 border-primary text-primary font-semibold py-3.5 rounded-md hover:bg-primary/5 transition flex items-center justify-center gap-2 mt-3"
                    >
                      Crear Cuenta
                    </button>
                  </>
                )}

                {!isLogin && registrationStep === 1 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Nombre Completo *</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Juan Pérez"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Correo Electrónico *</label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="tu@email.com"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Contraseña *</label>
                      <div className="relative">
                        <input
                          type={showRegPwd ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPwd(p => !p)}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showRegPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Confirmar Contraseña *</label>
                      <div className="relative">
                        <input
                          type={showRegConfirmPwd ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPwd(p => !p)}
                          className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showRegConfirmPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary text-white font-semibold py-3.5 mt-4 rounded-md hover:bg-primary/90 transition flex items-center justify-center gap-2 uppercase"
                    >
                      CONTINUAR <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </>
                )}

                {!isLogin && registrationStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-4">
                        Paso 2 de 3: Información de la Empresa
                      </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Tipo de Usuario *</label>
                        <select
                          name="userType"
                          value={formData.userType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition bg-white"
                        >
                          <option value="vendedor">Vendedor Agrícola</option>
                          <option value="comprador">Comprador/Distribuidor</option>
                          <option value="empresa">Empresa Industrial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Nombre de la Empresa *</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="Agro Exportaciones S.A."
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">¿Posee certificados para exportar? *</label>
                        <select
                          name="hasExportCertificates"
                          value={formData.hasExportCertificates as string}
                          onChange={(e) => setFormData({ ...formData, hasExportCertificates: e.target.value })}
                          className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white transition ${
                            formData.hasExportCertificates === "" ? "border-amber-400 bg-amber-50" : "border-gray-300"
                          }`}
                          required
                        >
                          <option value="" disabled>Selecciona una opción...</option>
                          <option value="true">Sí, tengo certificados de exportación</option>
                          <option value="false">No, no tengo certificados</option>
                        </select>
                        {formData.hasExportCertificates === "" && (
                          <p className="text-xs text-amber-600 mt-1">⚠ Este campo es obligatorio</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Página web (Opcional)</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="companyWebsite"
                            value={formData.companyWebsite}
                            onChange={handleInputChange}
                            placeholder="www.tuempresa.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                          />
                        </div>
                      </div>

                      <div className="w-full react-select-container">
                        <label className="block text-sm font-medium text-foreground mb-2">País *</label>
                        <CountryPicker
                          value={formData.country}
                          syncPhoneCode
                          onChange={(countryName, phoneCode) => {
                            setFormData(prev => ({
                              ...prev,
                              country: countryName,
                              ...(phoneCode ? { countryCode: phoneCode } : {}),
                            }))
                          }}
                          placeholder="Selecciona tu país"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Estado / Provincia *</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="Ej. Antioquia, Texas, San Salvador"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Dirección de la Empresa *</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Calle Principal #123"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Teléfono *</label>
                        <div className="flex gap-3">
                          <PhoneCodePicker
                            value={formData.countryCode}
                            onChange={(phoneCode) =>
                              setFormData(prev => ({ ...prev, countryCode: phoneCode }))
                            }
                            className="w-36 shrink-0"
                          />
                          <div className="flex-1">
                            <div className="relative">
                              <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handlePhoneInput}
                                inputMode="numeric"
                                placeholder="00000000"
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setRegistrationStep(1)}
                        className="flex-1 bg-white border border-gray-300 text-foreground font-semibold py-3.5 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 transition"
                      >
                        <ArrowLeft className="w-5 h-5 mr-1" /> ATRÁS
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !formData.userType ||
                            !formData.companyName ||
                            !formData.country ||
                            !formData.state ||
                            !formData.address ||
                            !formData.countryCode ||
                            !formData.phoneNumber
                          ) {
                            setError("Por favor completa los campos requeridos antes de continuar")
                            return
                          }
                          if (formData.hasExportCertificates === "") {
                            setError("Por favor indica si posees certificados para exportar")
                            return
                          }
                          setError("")
                          setRegistrationStep(3)
                        }}
                        className="flex-[2] bg-primary text-white font-semibold py-3.5 rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 transition uppercase"
                      >
                        SIGUIENTE<span className="hidden sm:inline"> PASO</span> <ArrowRight className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                  </div>
                )}

                {!isLogin && registrationStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-4">
                        Paso 3 de 3: Intereses y Volumen
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Productos de Interés * <span className="text-muted-foreground font-normal">(Ingresa al menos 1)</span></label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          name="product1"
                          value={formData.product1}
                          onChange={handleInputChange}
                          placeholder="ej. Algodón"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                        <input
                          type="text"
                          name="product2"
                          value={formData.product2}
                          onChange={handleInputChange}
                          placeholder="ej. Mangos"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                        <input
                          type="text"
                          name="product3"
                          value={formData.product3}
                          onChange={handleInputChange}
                          placeholder="ej. Fertilizantes"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Países de interés comercial (Opcional)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          name="supplyCountry1"
                          value={formData.supplyCountry1}
                          onChange={handleInputChange}
                          placeholder="ej. México"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                        <input
                          type="text"
                          name="supplyCountry2"
                          value={formData.supplyCountry2}
                          onChange={handleInputChange}
                          placeholder="ej. Colombia"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                        <input
                          type="text"
                          name="supplyCountry3"
                          value={formData.supplyCountry3}
                          onChange={handleInputChange}
                          placeholder="ej. Guatemala"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">¿Abastecen o proveen productos de algún país? *</label>
                      <select
                        name="doesProvideInternationally"
                        value={formData.doesProvideInternationally}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white transition mb-3"
                      >
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                      </select>

                      {formData.doesProvideInternationally === "true" && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in zoom-in duration-300">
                          <input
                            type="text"
                            name="providerCountry1"
                            value={formData.providerCountry1}
                            onChange={handleInputChange}
                            placeholder="Ej. México *"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                            required={formData.doesProvideInternationally === "true"}
                          />
                          <input
                            type="text"
                            name="providerCountry2"
                            value={formData.providerCountry2}
                            onChange={handleInputChange}
                            placeholder="Ej. Colombia (Opcional)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                          />
                          <input
                            type="text"
                            name="providerCountry3"
                            value={formData.providerCountry3}
                            onChange={handleInputChange}
                            placeholder="Ej. Guatemala (Opcional)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Volumen de Movimiento Anual * <span className="text-muted-foreground font-normal">(USD $)</span>
                      </label>
                      <select
                        name="volumeRange"
                        value={formData.volumeRange}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white transition"
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

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setRegistrationStep(2)}
                        className="flex-1 bg-white border border-gray-300 text-foreground font-semibold py-3.5 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 transition"
                      >
                        <ArrowLeft className="w-5 h-5 mr-1" /> ATRÁS
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-primary text-white font-semibold py-3.5 flex items-center justify-center gap-2 rounded-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                      >
                        {loading ? "CREANDO..." : "REGISTRARSE"} <ArrowRight className="w-5 h-5 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">✓</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {isLogin ? "¡Bienvenido!" : "¡Registro Exitoso!"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {isLogin
                    ? "Sesión iniciada correctamente. Redirigiendo..."
                    : "Tu cuenta ha sido creada. Redirigiendo a inicio de sesión..."}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1 max-w-xs mx-auto overflow-hidden">
                  <div
                    className="bg-primary h-1 rounded-full animate-pulse"
                    style={{ animation: "pulse 1.5s ease-in-out infinite", width: "100%" }}
                  ></div>
                </div>
              </div>
            )}
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
