"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { PRODUCT_CATEGORIES } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"
import { CountryPicker, PhoneCodePicker } from "@/components/ui/country-picker"


import {
  Search,
  PackageSearch,
  ArrowLeft,
  Send,
  CalendarDays,
  MapPin,
  Package,
  FileText,
  CheckCircle2,
  Loader2,
  Users,
  ShieldCheck,
  Bell,
  Smile,
  X,
  Clock,
  MessageSquare,
  Mail,
  Phone,
  ClipboardList,
  Globe,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

const EXPIRY_DAYS = 90

export default function SolicitudCompraPage() {
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  // Emoji picker state

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [limitReached, setLimitReached] = useState(false)
  const [limitMessage, setLimitMessage] = useState("")

  // Form fields
  const [productName, setProductName] = useState("")
  const [category, setCategory] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unit, setUnit] = useState("kg")
  const [desiredDate, setDesiredDate] = useState("")
  const [country, setCountry] = useState("")
  const [deliveryState, setDeliveryState] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [description, setDescription] = useState("")
  const [budget, setBudget] = useState("")
  // New fields
  const [specs, setSpecs] = useState("")
  const [sourceType, setSourceType] = useState("cualquiera")
  const [contactMethod, setContactMethod] = useState("email")
  const [contactValue, setContactValue] = useState("")
  const [whatsappCode, setWhatsappCode] = useState("")
  const [whatsappNumber, setWhatsappNumber] = useState("")

  const [userEmail, setUserEmail] = useState("")
  const [userPhone, setUserPhone] = useState("")

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      setUserId(session?.user?.id || null)

      if (session?.user) {
        // Fetch user profile to pre-fill contact info
        const { data: profile } = await supabase
          .from("users")
          .select("email, phone")
          .eq("id", session.user.id)
          .single()

        const email = profile?.email || session.user.email || ""
        const phone = profile?.phone || ""
        setUserEmail(email)
        setUserPhone(phone)
        setContactValue(email) // default to email

        // Parse phone into code + number (format: "+503 70000000")
        if (phone) {
          const match = phone.match(/^\+(\d+[\-]?\d*)\s+(.*)/)
          if (match) {
            setWhatsappCode(match[1])
            setWhatsappNumber(match[2])
          }
        }

        // Check request limit
        try {
          const limRes = await fetch("/api/mis-solicitudes", {
            headers: { Authorization: `Bearer ${session.access_token}` },
          })
          if (limRes.ok) {
            const limData = await limRes.json()
            if (!limData.can_create) {
              setLimitReached(true)
              setLimitMessage(
                limData.is_pro
                  ? `Has alcanzado el l\u00edmite de ${limData.max_requests} solicitudes activas. Edita o elimina una existente.`
                  : "Ya tienes 1 solicitud activa. Actualiza a Pro para publicar hasta 5, o edita tu solicitud existente."
              )
            }
          }
        } catch (e) {
          console.error("Limit check error:", e)
        }
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // When contact method changes, pre-fill with registered data
  const handleContactMethodChange = (method: string) => {
    setContactMethod(method)
    if (method === "email") {
      setContactValue(userEmail)
    } else if (method === "whatsapp") {
      // Parse phone from profile
      if (userPhone) {
        const match = userPhone.match(/^\+(\d+[\-]?\d*)\s+(.*)/)
        if (match) {
          setWhatsappCode(match[1])
          setWhatsappNumber(match[2])
        }
      }
      setContactValue(`+${whatsappCode} ${whatsappNumber}`)
    }
  }

  const handleWhatsappPhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "")
    setWhatsappNumber(val)
    setContactValue(`+${whatsappCode} ${val}`)
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated || !userId) {
      toast({
        title: "Inicia sesión",
        description: "Necesitas una cuenta para crear una solicitud de compra.",
        variant: "destructive",
      })
      router.push("/auth")
      return
    }

    if (contactMethod === "email" && !contactValue.trim()) {
      toast({
        title: "Medio de contacto requerido",
        description: "Por favor indica tu correo electrónico.",
        variant: "destructive",
      })
      return
    }

    if (contactMethod === "whatsapp" && (!whatsappCode || !whatsappNumber.trim())) {
      toast({
        title: "Medio de contacto requerido",
        description: "Por favor indica tu código de país y número de WhatsApp.",
        variant: "destructive",
      })
      return
    }

    // Build contactValue for whatsapp
    if (contactMethod === "whatsapp") {
      setContactValue(`+${whatsappCode} ${whatsappNumber}`)
    }

    setIsSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const formData = new FormData()
      formData.append("productName", productName.trim())
      formData.append("category", category)
      formData.append("quantity", quantity.trim())
      formData.append("unit", unit)
      formData.append("desiredDate", desiredDate || "")
      formData.append("country", country.trim())
      formData.append("deliveryState", deliveryState.trim())
      formData.append("deliveryAddress", deliveryAddress.trim())
      formData.append("description", description.trim())
      formData.append("budget", budget.trim())
      formData.append("specs", specs.trim())
      formData.append("sourceType", sourceType)
      formData.append("contactMethod", contactMethod)
      const finalContactValue = contactMethod === "whatsapp" 
        ? `+${whatsappCode} ${whatsappNumber}` 
        : contactValue.trim()
      formData.append("contactValue", finalContactValue)

      const response = await fetch("/api/solicitud-compra", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al crear la solicitud")
      }

      setIsSuccess(true)
      toast({
        title: "¡Solicitud creada!",
        description: "Tu solicitud ha sido enviada a nuestra red de proveedores. Vigencia: 90 días.",
      })
    } catch (error) {
      console.error("Submit error:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la solicitud. Intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            ¡Solicitud Enviada!
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Tu solicitud de <strong className="text-foreground">{productName}</strong> ha sido registrada exitosamente.
          </p>
          <p className="text-muted-foreground mb-4">
            Notificaremos a nuestra red de proveedores verificados para que te envíen sus mejores cotizaciones directamente.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 text-sm font-semibold mb-8">
            <Clock className="w-4 h-4" />
            Tu solicitud estará activa por {EXPIRY_DAYS} días
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => {
                setIsSuccess(false)
                setProductName(""); setCategory(""); setQuantity(""); setUnit("kg")
                setDesiredDate(""); setCountry(""); setDeliveryState(""); setDeliveryAddress("")
                setDescription(""); setBudget("")
                setSpecs(""); setSourceType("cualquiera")
                setContactMethod("email"); setContactValue(userEmail)

              }}
              className="rounded-xl h-12 font-bold px-8"
            >
              Crear otra solicitud
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/productos")}
              className="rounded-xl h-12 font-bold px-8"
            >
              Volver al catálogo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Limit reached state
  if (limitReached && isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Límite de solicitudes alcanzado
          </h1>
          <p className="text-muted-foreground mb-6">
            {limitMessage}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push("/dashboard/mis-solicitudes")}
              className="rounded-xl h-12 font-bold px-8"
            >
              Ver mis solicitudes
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/pedidos")}
              className="rounded-xl h-12 font-bold px-8"
            >
              Ver pedidos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/* Back link */}
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catálogo
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <PackageSearch className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            ¿No encontraste el producto que buscabas?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            No te preocupes. Cuéntanos qué necesitas, en qué cantidad y para cuándo.
            Nosotros notificaremos a nuestra red de proveedores verificados para que te envíen
            sus mejores cotizaciones directamente.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Red de Proveedores</p>
              <p className="text-xs text-muted-foreground">Cientos de productores activos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Proveedores Verificados</p>
              <p className="text-xs text-muted-foreground">Calidad garantizada</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Notificaciones</p>
              <p className="text-xs text-muted-foreground">Recibe cotizaciones directas</p>
            </div>
          </div>
        </div>

        {/* Not authenticated warning */}
        {!isAuthenticated && (
          <Card className="p-6 mb-8 border-primary/30 bg-primary/5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Inicia sesión para continuar</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Necesitas una cuenta en Agrilpa para crear una solicitud de compra y recibir cotizaciones de proveedores.
                </p>
                <div className="flex gap-3">
                  <Button onClick={() => router.push("/auth")} size="sm" className="rounded-lg font-semibold">
                    Iniciar Sesión
                  </Button>
                  <Button onClick={() => router.push("/auth")} size="sm" variant="outline" className="rounded-lg font-semibold">
                    Crear Cuenta
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Form */}
        <Card className="p-6 sm:p-8 border border-border">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Crear Solicitud de Compra</h2>
              <p className="text-sm text-muted-foreground">Completa los detalles de lo que necesitas</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nombre del Producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Café arábica lavado, Aguacate Hass, Cacao fino de aroma..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                required
              />
            </div>

            {/* Category and Quantity row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Cantidad Requerida <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: 5000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-24 px-3 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  >
                    <option value="kg">kg</option>
                    <option value="ton">ton</option>
                    <option value="lb">lb</option>
                    <option value="quintales">qq</option>
                    <option value="unidades">uds</option>
                    <option value="contenedores">cont.</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Date row */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <CalendarDays className="w-4 h-4 inline mr-1 -mt-0.5" />
                Fecha deseada de entrega
              </label>
              <input
                type="date"
                value={desiredDate}
                onChange={(e) => setDesiredDate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>

            {/* Delivery Location */}
            <div className="border-t border-border pt-6">
              <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Ubicación de entrega
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    País de destino
                  </label>
                  <CountryPicker
                    value={country}
                    onChange={(countryName) => setCountry(countryName)}
                    placeholder="Selecciona el país de entrega"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Estado / Provincia
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Antioquia, Texas, San Salvador..."
                      value={deliveryState}
                      onChange={(e) => setDeliveryState(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Dirección de entrega
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Bodega 5, Zona Industrial..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget and Source Type row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Package className="w-4 h-4 inline mr-1 -mt-0.5" />
                  Presupuesto estimado (USD)
                </label>
                <input
                  type="text"
                  placeholder="Ej: $2,000 - $5,000 o A convenir"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  <Globe className="w-4 h-4 inline mr-1 -mt-0.5" />
                  Origen del producto
                </label>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="cualquiera">Cualquiera (Local o Importado)</option>
                  <option value="local">Solo producto local</option>
                  <option value="importado">Solo producto importado</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Descripción detallada
              </label>
              <textarea
                placeholder="Describe las especificaciones del producto que necesitas: calidad, certificaciones, empaque, condiciones de envío, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              />
            </div>

            {/* Technical Specs */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <ClipboardList className="w-4 h-4 inline mr-1 -mt-0.5" />
                Especificaciones técnicas / Notas
              </label>
              <textarea
                placeholder={"Ej:\n• Humedad máxima al 12%\n• Grano limpio para consumo animal\n• Certificación orgánica requerida\n• Empaque en sacos de 50kg"}
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Agrega cualquier detalle técnico que ayude a los proveedores a entender exactamente lo que necesitas.
              </p>
            </div>


            {/* Divider */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                ¿Cómo deseas ser contactado?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Los proveedores te contactarán por el medio que elijas.
              </p>

              {/* Contact Method Selection */}
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => handleContactMethodChange("email")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    contactMethod === "email"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Correo electrónico
                </button>
                <button
                  type="button"
                  onClick={() => handleContactMethodChange("whatsapp")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    contactMethod === "whatsapp"
                      ? "border-green-500 bg-green-500/10 text-green-600"
                      : "border-border bg-background text-muted-foreground hover:border-green-500/30"
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </button>
              </div>

              {/* Contact Value Input */}
              {contactMethod === "email" ? (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="tu@correo.com"
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    required
                  />
                  {contactValue && contactValue === userEmail && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Datos de tu registro
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Número de WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    <PhoneCodePicker
                      value={whatsappCode}
                      onChange={(phoneCode) => {
                        setWhatsappCode(phoneCode)
                        setContactValue(`+${phoneCode} ${whatsappNumber}`)
                      }}
                      className="w-36 shrink-0"
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="70000000"
                        value={whatsappNumber}
                        onChange={handleWhatsappPhoneInput}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        required
                      />
                    </div>
                  </div>
                  {whatsappCode && whatsappNumber && `+${whatsappCode} ${whatsappNumber}` === userPhone && (
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Datos de tu registro
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Expiry Notice */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Esta solicitud tendrá una vigencia de <strong className="text-foreground">{EXPIRY_DAYS} días</strong> desde su publicación. Después será archivada automáticamente.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !isAuthenticated}
              className="w-full h-14 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando solicitud...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Crear Solicitud de Compra
                </>
              )}
            </Button>

            {!isAuthenticated && (
              <p className="text-center text-sm text-muted-foreground">
                Debes <button onClick={() => router.push("/auth")} className="text-primary font-semibold hover:underline">iniciar sesión</button> para enviar tu solicitud.
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  )
}
