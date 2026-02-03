"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Check, Loader, X, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { useDashboard } from "../../context"

const exportRequirementsByCountry: Record<string, Array<{ name: string; description: string }>> = {
  "Estados Unidos": [
    { name: "Certificado Fitosanitario", description: "Certificado de ausencia de plagas y enfermedades" },
    { name: "Registro FDA", description: "Registro de instalaciones con la FDA" },
    { name: "Etiquetado de Origen", description: "Etiquetado claro del país de origen" },
    { name: "Factura Comercial", description: "Factura comercial detallada" },
  ],
  Canadá: [
    { name: "Certificado Fitosanitario", description: "Certificado de ausencia de plagas y enfermedades" },
    { name: "Certificado de Salud", description: "Certificado de salud vegetal" },
    { name: "Etiquetado Bilingüe", description: "Etiquetado en inglés y francés" },
    { name: "Factura Comercial", description: "Factura comercial detallada" },
  ],
  México: [
    { name: "Certificado Fitosanitario", description: "Certificado de ausencia de plagas y enfermedades" },
    { name: "Permiso SAGARPA", description: "Permiso de SAGARPA para productos agrícolas" },
    { name: "Etiquetado de Origen", description: "Etiquetado claro del país de origen" },
    { name: "Factura Comercial", description: "Factura comercial detallada" },
  ],
  "Unión Europea": [
    { name: "Certificado Fitosanitario", description: "Certificado de ausencia de plagas y enfermedades" },
    { name: "Cumplimiento RASFF", description: "Cumplimiento de requisitos sanitarios RASFF" },
    { name: "Etiquetado en Español", description: "Etiquetado con información nutricional" },
    { name: "Factura Comercial", description: "Factura comercial detallada" },
  ],
  Japón: [
    { name: "Certificado Fitosanitario", description: "Certificado de ausencia de plagas y enfermedades" },
    { name: "Certificado de Trazabilidad", description: "Sistema de trazabilidad del producto" },
    { name: "Etiquetado en Japonés", description: "Información nutricional en japonés" },
    { name: "Factura Comercial", description: "Factura comercial detallada" },
  ],
}

export default function NuevaPublicacionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
    country: "",
    minOrder: "",
    maturity: "",
    image: "",
    packaging: "",
    packagingSize: "",
    companyName: "",
    contactMethod: "",
    contactInfo: "",
    countryCode: "",
    phoneNumber: "",
    certifications: "",
    incoterm: "A definir con el comprador",
  })
  const [isPriceOnRequest, setIsPriceOnRequest] = useState(false)
  const [certInput, setCertInput] = useState("")
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'loading' | null, text: string }>({ type: null, text: "" })
  const [imagePreview, setImagePreview] = useState<string>("")

  // Custom hook for sidebar updates
  const { refreshCounts } = useDashboard()

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      console.log("Auth check on mount:", session ? "Session found" : "No session")

      if (!session) {
        // Only redirect if explicitly missing session after check
        console.warn("No session found on mount, redirecting to auth...")
        router.push("/auth")
      }
    }

    // Small delay to allow hydration/cookie restoration
    const timer = setTimeout(() => {
      checkAuth()
    }, 500)

    return () => clearTimeout(timer)
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setStatusMessage({ type: 'error', text: "La imagen es demasiado grande. Por favor usa una imagen menor a 5MB." })
        e.target.value = "" // Reset input
        // Auto-hide after 5 seconds
        setTimeout(() => setStatusMessage({ type: null, text: "" }), 5000)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setImagePreview(result)
        setFormData((prev) => ({
          ...prev,
          image: result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage({ type: 'loading', text: "Validando datos..." })

    const requiredFields = [
      { key: "title", label: "Título del Producto" },
      { key: "category", label: "Categoría" },
      { key: "category", label: "Categoría" },
      // Price is optional if "Por Cotizar" is selected
      ...(isPriceOnRequest ? [] : [{ key: "price", label: "Precio" }]),
      { key: "quantity", label: "Cantidad Disponible" },
      { key: "quantity", label: "Cantidad Disponible" },
      { key: "description", label: "Descripción del Producto" },
      { key: "country", label: "País de Origen" },
      { key: "minOrder", label: "Pedido Mínimo" },
      { key: "packaging", label: "Tipo de Embalaje" },
      { key: "packagingSize", label: "Tamaño del Embalaje" },
      { key: "companyName", label: "Nombre de la Empresa" },
      { key: "contactMethod", label: "Medio de Contacto" },
    ]

    const missingField = requiredFields.find((field) => !formData[field.key as keyof typeof formData])

    if (missingField) {
      setStatusMessage({ type: 'error', text: `Falta completar: ${missingField.label}` })
      return
    }

    // Validate contact information based on method
    if (formData.contactMethod === "WhatsApp") {
      if (!formData.countryCode || !formData.phoneNumber) {
        setStatusMessage({ type: 'error', text: "Falta completar: Código de País y Número de Teléfono" })
        return
      }
    } else {
      if (!formData.contactInfo) {
        setStatusMessage({ type: 'error', text: "Falta completar: Usuario / Correo" })
        return
      }
    }

    setIsLoading(true)
    setStatusMessage({ type: 'loading', text: "Enviando producto..." })

    try {
      const supabase = createClient()
      console.log("Checking authentication status...")

      let user = null

      // Try getUser first (most secure, validates with server)
      const { data: { user: dbUser }, error: authError } = await supabase.auth.getUser()

      if (dbUser) {
        user = dbUser
      } else {
        console.warn("getUser failed, attempting to recover session...", authError?.message)

        // Fallback to getSession (local session)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (session?.user) {
          console.log("User recovered from active session")
          user = session.user
        } else {
          console.error("Session recovery failed:", sessionError)
        }
      }

      if (!user) {
        setStatusMessage({
          type: 'error',
          text: `No se pudo identificar al usuario. Por favor recarga la página o inicia sesión nuevamente.`
        })
        return
      }

      console.log("User identified:", user.id)

      const userId = user.id

      const response = await fetch("/api/products/create-user-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...formData,
          price: isPriceOnRequest ? "Por Cotizar" : formData.price,
          // For WhatsApp, send country code and phone number separately
          // For WhatsApp, send country code and phone number separately
          ...(formData.contactMethod === "WhatsApp" && {
            countryCode: formData.countryCode,
            phoneNumber: formData.phoneNumber,
          }),
        }),
      })

      if (!response.ok) {
        let errorMessage = "Error al crear la publicación"
        try {
          const error = await response.json()
          errorMessage = error.error || errorMessage
        } catch (e) {
          // If parsing JSON fails, it might be a payload too large error (HTML response)
          if (response.status === 413) {
            errorMessage = "La imagen es demasiado grande. Intenta con una imagen más pequeña."
          } else {
            errorMessage = `Error del servidor: ${response.status} ${response.statusText}`
          }
        }
        setStatusMessage({ type: 'error', text: errorMessage })
        return
      }

      setStatusMessage({ type: 'success', text: "¡Publicación creada exitosamente! Redirigiendo..." })

      // Update sidebar counts immediately
      await refreshCounts()

      setTimeout(() => {
        router.push("/dashboard/mis-publicaciones")
      }, 1500)
    } catch (error) {
      console.error("[v0] Error creating product:", error)
      setStatusMessage({ type: 'error', text: "Ocurrió un error inesperado. Si el problema persiste, intenta con una imagen diferente." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/mis-publicaciones")}
          className="bg-transparent"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nueva Publicación</h1>
          <p className="text-muted-foreground mt-1">Completa los detalles de tu producto para publicarlo</p>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Información del Producto</CardTitle>
          <CardDescription>
            Ingresa todos los detalles necesarios para que los compradores conozcan tu producto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Foto del Producto</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-2 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Haz clic para subir una imagen</span>
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF (máx. 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                </div>
                {imagePreview && (
                  <div className="w-32 h-32 rounded-md overflow-hidden border border-border">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título del Producto <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ej: Tomates Frescos Orgánicos"
                  disabled={isLoading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  disabled={isLoading}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="Frutas">Frutas</option>
                  <option value="Verduras">Verduras</option>
                  <option value="Café">Café</option>
                  <option value="Cacao">Cacao</option>
                  <option value="Cereales">Cereales</option>
                  <option value="Especias">Especias</option>
                  <option value="Lácteos">Lácteos</option>
                  <option value="Aceites">Aceites</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Precio <span className="text-red-500">*</span>
                </label>

                <div className="flex bg-muted p-1 rounded-lg mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPriceOnRequest(false)
                      setFormData(prev => ({ ...prev, price: "" }))
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isPriceOnRequest
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Precio
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsPriceOnRequest(true)
                      setFormData(prev => ({ ...prev, price: "Por Cotizar" }))
                    }}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isPriceOnRequest
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    Cotización
                  </button>
                </div>

                {!isPriceOnRequest ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                    <Input
                      type="number"
                      name="price"
                      value={formData.price === "Por Cotizar" ? "" : formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="pl-7 pr-12"
                      disabled={isLoading}
                      required={!isPriceOnRequest}
                      step="0.01"
                      min="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/kg</span>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg text-center text-sm text-muted-foreground">
                    El precio se acordará directamente con el comprador
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cantidad Disponible <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Ej: 500 kg"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  País de Origen <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country === "" || ["El Salvador", "Honduras", "Guatemala", "Nicaragua", "Costa Rica", "Panamá", "México", "Colombia", "Ecuador", "Perú", "Otro"].includes(formData.country) ? formData.country : "Otro"}
                  onChange={(e) => {
                    if (e.target.value === "Otro") {
                      setFormData(prev => ({ ...prev, country: "Otro" }))
                    } else {
                      setFormData(prev => ({ ...prev, country: e.target.value }))
                    }
                  }}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  disabled={isLoading}
                  required
                >
                  <option value="">Selecciona un país</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Honduras">Honduras</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Panamá">Panamá</option>
                  <option value="México">México</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Perú">Perú</option>
                  <option value="Otro">Otro...</option>
                </select>
                {(formData.country === "Otro" || (formData.country !== "" && !["El Salvador", "Honduras", "Guatemala", "Nicaragua", "Costa Rica", "Panamá", "México", "Colombia", "Ecuador", "Perú"].includes(formData.country))) && (
                  <Input
                    type="text"
                    name="country"
                    value={formData.country === "Otro" ? "" : formData.country}
                    onChange={handleInputChange}
                    placeholder="Escribe el nombre del país"
                    className="mt-2"
                    disabled={isLoading}
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Pedido Mínimo <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="minOrder"
                  value={formData.minOrder}
                  onChange={handleInputChange}
                  placeholder="Ej: 100 kg"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipo de Maduración <span className="text-xs text-muted-foreground">(Opcional)</span>
                </label>
                <select
                  name="maturity"
                  value={formData.maturity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  disabled={isLoading}
                >
                  <option value="">Sin especificar</option>
                  <option value="Verde">Verde</option>
                  <option value="Semi-maduro">Semi-maduro</option>
                  <option value="Maduro">Maduro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tipo de Embalaje <span className="text-red-500">*</span>
                </label>
                <select
                  name="packaging"
                  value={formData.packaging}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  disabled={isLoading}
                  required
                >
                  <option value="">Selecciona un tipo de embalaje</option>
                  <option value="Sacos">Sacos</option>
                  <option value="Cajas">Cajas</option>
                  <option value="Bolsas">Bolsas</option>
                  <option value="Contenedores">Contenedores</option>
                  <option value="Pallets">Pallets</option>
                  <option value="Barriles">Barriles</option>
                  <option value="Canastillas">Canastillas</option>
                  <option value="Empaques Frescos">Empaques Frescos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tamaño del Embalaje <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    name="packagingSize"
                    value={formData.packagingSize}
                    onChange={handleInputChange}
                    placeholder="Ej: 50, 25, 100"
                    className="w-full"
                    min="1"
                    disabled={isLoading}
                    required
                  />
                  <span className="flex items-center px-3 bg-primary/10 border border-primary/20 rounded-md font-semibold text-primary">
                    kg
                  </span>
                </div>
              </div>
            </div>

            {/* Incoterm Field */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Incoterm <span className="text-xs text-muted-foreground">(Opcional)</span>
              </label>
              <select
                name="incoterm"
                value={formData.incoterm}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                disabled={isLoading}
              >
                <option value="A definir con el comprador">A definir con el comprador</option>
                <option value="EXW">EXW – En fábrica (el comprador recoge en origen)</option>
                <option value="FCA">FCA – Entrega al transportista</option>
                <option value="FOB">FOB – Libre a bordo (puerto de origen)</option>
                <option value="CIF">CIF – Costo, seguro y flete incluidos</option>
                <option value="CFR">CFR – Costo y flete incluidos</option>
                <option value="DAP">DAP – Entregado en destino</option>
                <option value="DDP">DDP – Entregado con impuestos pagados</option>
                <option value="CPT">CPT – Transporte pagado hasta destino</option>
                <option value="CIP">CIP – Transporte y seguro pagados</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1.5">
                Define hasta dónde llega la responsabilidad del vendedor en el envío.
              </p>
              <p className="text-xs text-muted-foreground/70 mt-0.5 italic">
                Este valor es referencial y puede ajustarse con el comprador.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción del Producto <span className="text-red-500">*</span>
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe tu producto, características, origen, calidad, certificaciones, etc."
                rows={5}
                className="w-full"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                Certificaciones <span className="text-xs text-muted-foreground">(Escribe y presiona Enter para agregar)</span>
              </label>

              <div className="flex gap-2 mb-3">
                <Input
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (certInput.trim()) {
                        const currentCerts = formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : []
                        if (!currentCerts.includes(certInput.trim())) {
                          setFormData({
                            ...formData,
                            certifications: [...currentCerts, certInput.trim()].join(',')
                          })
                        }
                        setCertInput("")
                      }
                    }
                  }}
                  placeholder="Escribe una certificación..."
                  className="max-w-md"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (certInput.trim()) {
                      const currentCerts = formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : []
                      if (!currentCerts.includes(certInput.trim())) {
                        setFormData({
                          ...formData,
                          certifications: [...currentCerts, certInput.trim()].join(',')
                        })
                      }
                      setCertInput("")
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.certifications && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.certifications.split(',').map(cert => cert.trim()).filter(c => c).map((cert, index) => (
                    <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 text-sm">
                      {cert}
                      <button
                        type="button"
                        onClick={() => {
                          const newCerts = formData.certifications.split(',').map(c => c.trim()).filter(c => c !== cert)
                          setFormData({
                            ...formData,
                            certifications: newCerts.join(',')
                          })
                        }}
                        className="hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="text-xs text-muted-foreground mb-2">Sugerencias rápidas:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "No aplica",
                  "MAID",
                  "International",
                  "USDA Organic",
                  "Fair Trade",
                  "Global GAP",
                  "Rainforest Alliance",
                  "HACCP",
                  "ISO 9001",
                  "Halal",
                  "Kosher",
                  "Organic EU",
                  "FDA Registered"
                ].map((cert) => {
                  const isActive = formData.certifications.split(',').map(c => c.trim()).includes(cert)
                  if (isActive) return null
                  return (
                    <Badge
                      key={cert}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => {
                        const currentCerts = formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : []
                        setFormData({
                          ...formData,
                          certifications: [...currentCerts, cert].join(',')
                        })
                      }}
                    >
                      + {cert}
                    </Badge>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre de la Empresa <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Ej: Agro Export S.A."
                  disabled={isLoading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Medio de Contacto <span className="text-red-500">*</span>
                </label>
                <select
                  name="contactMethod"
                  value={formData.contactMethod}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  disabled={isLoading}
                  required
                >
                  <option value="">Selecciona un medio</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {formData.contactMethod === "WhatsApp" ? (
                    <>Código y Teléfono <span className="text-red-500">*</span></>
                  ) : (
                    <>Usuario / Correo <span className="text-red-500">*</span></>
                  )}
                </label>
                {formData.contactMethod === "WhatsApp" ? (
                  <div className="flex gap-2">
                    <div className="w-32">
                      <div className="flex">
                        <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-md text-sm text-muted-foreground">
                          +
                        </span>
                        <Input
                          className="pl-6"
                          placeholder="503"
                          type="number"
                          value={formData.countryCode}
                          onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Ej: 503</p>
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="0000 0000"
                        type="number"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        disabled={isLoading}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">Sin espacios ni guiones</p>
                    </div>
                  </div>
                ) : (
                  <Input
                    type="text"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    placeholder={
                      formData.contactMethod === "Email"
                        ? "email@empresa.com"
                        : formData.contactMethod === "WeChat"
                          ? "Tu usuario de WeChat"
                          : formData.contactMethod === "Telegram"
                            ? "@tu_usuario"
                            : "Tu información de contacto"
                    }
                    disabled={isLoading}
                    required
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-6">
              {statusMessage.text && (
                <div className={`p-3 rounded-md text-sm font-medium ${statusMessage.type === 'error' ? 'bg-red-100 text-red-700' :
                  statusMessage.type === 'success' ? 'bg-green-100 text-green-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                  {statusMessage.text}
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/mis-publicaciones")}
                  disabled={isLoading}
                  className="flex-1 hover:bg-red-600 hover:text-white hover:border-red-600"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Publicar Producto
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div >
  )
}
