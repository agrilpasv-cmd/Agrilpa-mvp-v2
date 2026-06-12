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
import { PRODUCT_CATEGORIES } from "@/lib/constants"
import { useDashboard } from "../../context"
import { PhoneCodePicker } from "@/components/ui/country-picker"
import { CurrencyPicker } from "@/components/ui/currency-picker"

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
    quantityUnit: "kg",
    description: "",
    country: "",
    state: "",
    minOrder: "",
    minOrderUnit: "kg",
    maturity: "",
    image: "",
    image2: "",
    image3: "",
    packaging: "",
    packagingSize: "",
    shippingUnit: "",
    containerSize: "",
    companyName: "",
    contactMethod: "",
    contactInfo: "",
    countryCode: "",
    phoneNumber: "",
    certifications: "",
    incoterm: "A definir con el comprador",
    saleMethod: "standard", // "standard" or "fcl"
    supplyCapacity: "",
    supplyCapacityUnit: "toneladas",
    supplyCapacityPeriod: "mes",
    currency: "US$",
  })
  const [isPriceOnRequest, setIsPriceOnRequest] = useState(true)
  const [certInput, setCertInput] = useState("")
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'loading' | null, text: string }>({ type: null, text: "" })
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imagePreview2, setImagePreview2] = useState<string>("")
  const [imagePreview3, setImagePreview3] = useState<string>("")
  const [selectedAlcance, setSelectedAlcance] = useState<string[]>([])

  const ALL_COUNTRIES = [
    "El Salvador", "Guatemala", "Honduras", "Nicaragua", "Costa Rica", "Panamá", "Belice",
    "México", "Estados Unidos", "Canadá",
    "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Ecuador", "Paraguay", "Perú", "Uruguay", "Venezuela", "Guyana", "Surinam",
    "Cuba", "República Dominicana", "Jamaica", "Haití", "Trinidad y Tobago", "Puerto Rico",
    "España", "Francia", "Alemania", "Italia", "Portugal", "Países Bajos", "Bélgica", "Polonia", "Reino Unido",
    "China", "India", "Japón", "Corea del Sur", "Tailandia", "Vietnam", "Indonesia", "Filipinas", "Malasia", "Turquía",
    "Sudáfrica", "Nigeria", "Kenia", "Etiopía", "Ghana", "Costa de Marfil", "Tanzania", "Uganda", "Marruecos", "Egipto",
    "Australia", "Nueva Zelanda"
  ]

  const ALCANCE_OPTIONS = {
    nacional: [
      { value: 'Nacional (Cobertura en todo el país)', label: 'Nacional (Cobertura en todo el país)' }
    ],
    internacional: [
      { value: 'Regional (Centroamérica)', label: 'Regional (Centroamérica)' },
      { value: 'Norteamérica (EE.UU./Canadá)', label: 'Norteamérica (EE.UU./Canadá)' },
      { value: 'Europa', label: 'Europa' },
      { value: 'Mercado Global (Otros destinos)', label: 'Mercado Global (Otros destinos)' }
    ]
  }


  // Custom hook for sidebar updates
  const { refreshCounts } = useDashboard()

  // Auto-fill company name from user profile
  useEffect(() => {
    const loadProfileCompany = async () => {
      try {
        const res = await fetch("/api/user/profile")
        if (res.ok) {
          const data = await res.json()
          const company = data.user?.company_name || ""
          if (company) {
            setFormData(prev => ({ ...prev, companyName: company }))
          }
        }
      } catch (e) {
        // silent — non-critical
      }
    }
    loadProfileCompany()
  }, [])

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
    let processedValue = value

    if (name === "state") {
      // Allow only letters, spaces, and Spanish characters (áéíóúÁÉÍÓÚñÑüÜ)
      const cleanVal = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
      // Capitalize first letter of each word
      processedValue = cleanVal
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, imageKey: "image" | "image2" | "image3") => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setStatusMessage({ type: 'error', text: "La imagen es demasiado grande. Por favor usa una imagen menor a 5MB." })
        e.target.value = "" // Reset input
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        if (imageKey === "image") setImagePreview(result)
        if (imageKey === "image2") setImagePreview2(result)
        if (imageKey === "image3") setImagePreview3(result)
        setFormData((prev) => ({
          ...prev,
          [imageKey]: result,
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
      { key: "packagingSize", label: "Peso por Embalaje" },
      { key: "image", label: "Foto Principal del Producto" },
      { key: "supplyCapacity", label: "Capacidad de Abastecimiento" },
    ]

    const missingField = requiredFields.find((field) => !formData[field.key as keyof typeof formData])

    if (missingField) {
      setStatusMessage({ type: 'error', text: `Falta completar: ${missingField.label}` })
      return
    }

    if (formData.description.length < 50) {
      setStatusMessage({ type: 'error', text: "La descripción del producto debe tener al menos 50 caracteres." })
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

    if (selectedAlcance.length === 0) {
      setStatusMessage({ type: 'error', text: "Debe seleccionar al menos una opción en 'Alcance Comercial'." })
      return
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
          currency: formData.currency,
          quantity: `${formData.quantity} ${formData.quantityUnit || "kg"}`,
          minOrder: `${formData.minOrder} ${formData.minOrderUnit || "kg"}`,
          shippingUnitType: formData.shippingUnit,
          containerSize: formData.containerSize || null,
          alcanceComercial: selectedAlcance,
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
      console.error("[Agrilpa] Error creating product:", error)
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
              <label className="block text-sm font-medium mb-2">Fotos del Producto (Hasta 3 imágenes, mínimo 1 requerida)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Image 1 (Required) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center w-full">
                    {imagePreview ? (
                      <div className="relative w-full h-32 border border-border rounded-lg overflow-hidden group shadow-sm bg-muted animate-in fade-in zoom-in-95 duration-200">
                        <img src={imagePreview} alt="Preview 1" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview("")
                            setFormData(p => ({ ...p, image: "" }))
                          }}
                          className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white rounded-full p-1.5 shadow-md transition-all duration-200 hover:scale-105"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-muted-foreground animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <p className="mb-2 text-sm text-muted-foreground font-semibold">Foto Principal *</p>
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "image")} className="hidden" disabled={isLoading} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Image 2 (Optional) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center w-full">
                    {imagePreview2 ? (
                      <div className="relative w-full h-32 border border-border rounded-lg overflow-hidden group shadow-sm bg-muted animate-in fade-in zoom-in-95 duration-200">
                        <img src={imagePreview2} alt="Preview 2" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview2("")
                            setFormData(p => ({ ...p, image2: "" }))
                          }}
                          className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white rounded-full p-1.5 shadow-md transition-all duration-200 hover:scale-105"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <p className="mb-2 text-sm text-muted-foreground font-semibold">Foto Adicional</p>
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "image2")} className="hidden" disabled={isLoading} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Image 3 (Optional) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-center w-full">
                    {imagePreview3 ? (
                      <div className="relative w-full h-32 border border-border rounded-lg overflow-hidden group shadow-sm bg-muted animate-in fade-in zoom-in-95 duration-200">
                        <img src={imagePreview3} alt="Preview 3" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview3("")
                            setFormData(p => ({ ...p, image3: "" }))
                          }}
                          className="absolute top-2 right-2 bg-destructive/90 hover:bg-destructive text-white rounded-full p-1.5 shadow-md transition-all duration-200 hover:scale-105"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <p className="mb-2 text-sm text-muted-foreground font-semibold">Foto Adicional</p>
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "image3")} className="hidden" disabled={isLoading} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Título y Categoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Título del Producto <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
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
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Categoría <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  disabled={isLoading}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* País de Origen, Estado/Región y Tipo de Maduración */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-2">
                  País de Origen <span className="text-red-500">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  disabled={isLoading}
                  required
                >
                  <option value="">Selecciona un país</option>
                  <optgroup label="Centroamérica">
                    <option value="El Salvador">El Salvador</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Honduras">Honduras</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Panamá">Panamá</option>
                    <option value="Belice">Belice</option>
                  </optgroup>
                  <optgroup label="Norteamérica">
                    <option value="México">México</option>
                    <option value="Estados Unidos">Estados Unidos</option>
                    <option value="Canadá">Canadá</option>
                  </optgroup>
                  <optgroup label="Sudamérica">
                    <option value="Argentina">Argentina</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Chile">Chile</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Perú">Perú</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Guyana">Guyana</option>
                    <option value="Surinam">Surinam</option>
                  </optgroup>
                  <optgroup label="El Caribe">
                    <option value="Cuba">Cuba</option>
                    <option value="República Dominicana">República Dominicana</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="Haití">Haití</option>
                    <option value="Trinidad y Tobago">Trinidad y Tobago</option>
                    <option value="Puerto Rico">Puerto Rico</option>
                  </optgroup>
                  <optgroup label="Europa">
                    <option value="España">España</option>
                    <option value="Francia">Francia</option>
                    <option value="Alemania">Alemania</option>
                    <option value="Italia">Italia</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Países Bajos">Países Bajos</option>
                    <option value="Bélgica">Bélgica</option>
                    <option value="Polonia">Polonia</option>
                    <option value="Reino Unido">Reino Unido</option>
                  </optgroup>
                  <optgroup label="Asia">
                    <option value="China">China</option>
                    <option value="India">India</option>
                    <option value="Japón">Japón</option>
                    <option value="Corea del Sur">Corea del Sur</option>
                    <option value="Tailandia">Tailandia</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Filipinas">Filipinas</option>
                    <option value="Malasia">Malasia</option>
                    <option value="Turquía">Turquía</option>
                  </optgroup>
                  <optgroup label="África">
                    <option value="Sudáfrica">Sudáfrica</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Kenia">Kenia</option>
                    <option value="Etiopía">Etiopía</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Costa de Marfil">Costa de Marfil</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Marruecos">Marruecos</option>
                    <option value="Egipto">Egipto</option>
                  </optgroup>
                  <optgroup label="Oceanía">
                    <option value="Australia">Australia</option>
                    <option value="Nueva Zelanda">Nueva Zelanda</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium mb-2">
                  Estado / Región
                </label>
                <Input
                  id="state"
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Ej: Jalisco, San Salvador, Alajuela"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="maturity" className="block text-sm font-medium mb-2">
                  Tipo de Maduración <span className="text-red-500">*</span>
                </label>
                <select
                  id="maturity"
                  name="maturity"
                  value={formData.maturity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  disabled={isLoading}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  <option value="No aplica">No aplica</option>
                  <option value="Verde">Verde</option>
                  <option value="Semi-maduro">Semi-maduro</option>
                  <option value="Maduro">Maduro</option>
                  <option value="Sobre-maduro">Sobre-maduro</option>
                </select>
              </div>
            </div>

            {/* ── Elección de Método de Venta ── */}
            <div className="border border-border/60 bg-muted/20 p-4 rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3">
                  ¿Cómo vendes este producto? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => {
                      const cleanQty = prev.quantity.replace(/[^\d.]/g, "")
                      const cleanMin = prev.minOrder.replace(/[^\d.]/g, "")
                      return { 
                        ...prev, 
                        saleMethod: "standard", 
                        packaging: prev.packaging === "Contenedores" ? "" : prev.packaging, 
                        shippingUnit: "", 
                        containerSize: "", 
                        quantity: cleanQty,
                        quantityUnit: prev.quantityUnit.startsWith("Contenedor") ? "kg" : prev.quantityUnit,
                        minOrder: cleanMin,
                        minOrderUnit: prev.minOrderUnit.startsWith("Contenedor") ? "kg" : prev.minOrderUnit
                      }
                    })}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      formData.saleMethod === "standard"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30 bg-background"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${formData.saleMethod === "standard" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      📦
                    </div>
                    <div>
                      <p className="font-bold text-sm">Carga General / Sacos</p>
                      <p className="text-xs text-muted-foreground">Venta por sacos, cajas o bultos</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => {
                      const cleanQty = prev.quantity.replace(/[^\d.]/g, "")
                      const cleanMin = prev.minOrder.replace(/[^\d.]/g, "")
                      return { 
                        ...prev, 
                        saleMethod: "fcl", 
                        packaging: "Contenedores", 
                        shippingUnit: "FCL", 
                        containerSize: prev.containerSize || "20ST", 
                        quantity: cleanQty,
                        quantityUnit: "Contenedor 20'",
                        minOrder: cleanMin || "1",
                        minOrderUnit: "Contenedor 20'",
                        packagingSize: prev.packagingSize || "21000"
                      }
                    })}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      formData.saleMethod === "fcl"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border hover:border-primary/30 bg-background"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${formData.saleMethod === "fcl" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      🚢
                    </div>
                    <div>
                      <p className="font-bold text-sm">Venta por Contenedor</p>
                      <p className="text-xs text-muted-foreground">Exportación FCL (Full Container)</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 ${formData.saleMethod === "fcl" ? "animate-in fade-in slide-in-from-top-4 duration-500" : ""}`}>
                {formData.saleMethod === "standard" ? (
                  <>
                    <div>
                      <label htmlFor="packaging" className="block text-sm font-medium mb-2">
                        Tipo de Embalaje <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="packaging"
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
                        <option value="Pallets">Pallets</option>
                        <option value="Barriles">Barriles</option>
                        <option value="Canastillas">Canastillas</option>
                        <option value="Empaques Frescos">Empaques Frescos</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="packagingSize" className="block text-sm font-medium mb-2">
                        Peso por Embalaje <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <Input
                          id="packagingSize"
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
                  </>
                ) : formData.saleMethod === "fcl" ? (
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold">
                        Opciones de Contenedor FCL
                      </label>
                      <span className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full font-medium">
                        💡 El comprador verá que vendes por contenedor completo
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, containerSize: "20ST", packagingSize: "21000" }))}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all ${
                          formData.containerSize === "20ST"
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border hover:border-primary/40 bg-background"
                        }`}
                      >
                        <span className="text-3xl">🚢</span>
                        <div>
                          <p className="font-bold">20&apos; Standard</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">Capacidad aprox. 21,000 kg</p>
                        </div>
                        {formData.containerSize === "20ST" && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, containerSize: "40HC", packagingSize: "26000" }))}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all ${
                          formData.containerSize === "40HC"
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border hover:border-primary/40 bg-background"
                        }`}
                      >
                        <span className="text-3xl">🏗️</span>
                        <div>
                          <p className="font-bold">40&apos; High Cube</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">Capacidad aprox. 26,000 kg</p>
                        </div>
                        {formData.containerSize === "40HC" && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, containerSize: "Ambos", packagingSize: "21000,26000" }))}
                        className={`relative flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center transition-all ${
                          formData.containerSize === "Ambos"
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border hover:border-primary/40 bg-background"
                        }`}
                      >
                        <div className="flex -space-x-2">
                          <span className="text-2xl z-10">🚢</span>
                          <span className="text-2xl">🏗️</span>
                        </div>
                        <div>
                          <p className="font-bold">Ambas Opciones</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">El comprador elige el tamaño</p>
                        </div>
                        {formData.containerSize === "Ambos" && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Precio, Cantidad Disponible y Pedido Mínimo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-2">
                  Precio <span className="text-red-500">*</span>
                </label>

                <div className="flex bg-muted p-1 rounded-lg mb-3">
                  <button
                    type="button"
                    aria-pressed={isPriceOnRequest}
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
                  <button
                    type="button"
                    aria-pressed={!isPriceOnRequest}
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
                </div>

                {!isPriceOnRequest ? (
                  <div className="flex gap-2">
                    <CurrencyPicker
                      value={formData.currency}
                      onChange={(val) => setFormData(prev => ({ ...prev, currency: val }))}
                      disabled={isLoading}
                    />
                    <div className="relative flex-1">
                      <Input
                        id="price"
                        type="number"
                        name="price"
                        value={formData.price === "Por Cotizar" ? "" : formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="pr-12"
                        disabled={isLoading}
                        required={!isPriceOnRequest}
                        step="0.01"
                        min="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/{formData.saleMethod === "fcl" ? "contenedor" : "kg"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg text-center text-sm text-muted-foreground">
                    El precio se acordará directamente con el comprador
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium mb-2">
                  Cantidad Disponible <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Ej: 500"
                    min="1"
                    className="w-full"
                    disabled={isLoading}
                    required
                  />
                  <select
                    name="quantityUnit"
                    value={formData.quantityUnit}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm min-w-[120px]"
                    disabled={isLoading}
                  >
                    {formData.saleMethod === "fcl" ? (
                      <>
                        <option value="Contenedor 20'">Contenedor 20'</option>
                        <option value="Contenedor 40'">Contenedor 40'</option>
                      </>
                    ) : (
                      <>
                        <option value="kg">kg (Kilogramos)</option>
                        <option value="lb">lb (Libras)</option>
                        <option value="qq">qq (Quintales)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="minOrder" className="block text-sm font-medium mb-2">
                  Pedido Mínimo <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    id="minOrder"
                    type="number"
                    name="minOrder"
                    value={formData.minOrder}
                    onChange={handleInputChange}
                    placeholder="Ej: 100"
                    min="1"
                    className="w-full"
                    disabled={isLoading}
                    required
                  />
                  <select
                    name="minOrderUnit"
                    value={formData.minOrderUnit}
                    onChange={handleInputChange}
                    className="px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm min-w-[120px]"
                    disabled={isLoading}
                  >
                    {formData.saleMethod === "fcl" ? (
                      <>
                        <option value="Contenedor 20'">Contenedor 20'</option>
                        <option value="Contenedor 40'">Contenedor 40'</option>
                      </>
                    ) : (
                      <>
                        <option value="kg">kg (Kilogramos)</option>
                        <option value="lb">lb (Libras)</option>
                        <option value="qq">qq (Quintales)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>


            {/* Capacidad de Abastecimiento */}
            <div>
              <label htmlFor="supplyCapacity" className="block text-sm font-medium mb-2">
                Capacidad de Abastecimiento <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Input
                    id="supplyCapacity"
                    type="number"
                    name="supplyCapacity"
                    value={formData.supplyCapacity}
                    onChange={handleInputChange}
                    placeholder="Ej: 50"
                    min="0"
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>
                <div>
                  <select
                    id="supplyCapacityUnit"
                    name="supplyCapacityUnit"
                    value={formData.supplyCapacityUnit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    disabled={isLoading}
                  >
                    <option value="kg">kg</option>
                    <option value="toneladas">toneladas</option>
                    <option value="libras">libras</option>
                    <option value="TM">TM</option>
                    <option value="unidades">unidades</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-medium px-1">/</span>
                  <select
                    id="supplyCapacityPeriod"
                    name="supplyCapacityPeriod"
                    value={formData.supplyCapacityPeriod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                    disabled={isLoading}
                  >
                    <option value="mes">mes</option>
                    <option value="semana">semana</option>
                    <option value="día">día</option>
                    <option value="año">año</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Indica la cantidad máxima que puedes proveer de este producto en un periodo determinado (ej: 50 toneladas / mes).
              </p>
            </div>

            {/* Incoterm Field */}
            <div>
              <label htmlFor="incoterm" className="block text-sm font-medium mb-2">
                Incoterm <span className="text-xs text-muted-foreground">(Opcional)</span>
              </label>
              <select
                id="incoterm"
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

            {/* Alcance Comercial */}
            <div className="bg-muted/10 p-5 rounded-xl border border-border mt-6">
              <label className="block text-sm font-semibold mb-1">
                Alcance Comercial <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-4">
                Selecciona todas las opciones que apliquen a tu capacidad actual. Esta información es obligatoria para conectar con compradores internacionales.
              </p>

              <div className="space-y-4">
                {/* Mercado Nacional */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Mercado Nacional
                  </h4>
                  <div className="space-y-3 bg-background p-3 rounded-lg border border-border">
                    <div className="flex flex-col gap-2.5">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedAlcance.some(item => item.startsWith("Nacional") || item.includes("nacional") || item.includes("Local"))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const defaultCountry = formData.country || "El Salvador"
                              setSelectedAlcance([
                                ...selectedAlcance.filter(item => !item.startsWith("Nacional") && !item.includes("nacional") && !item.includes("Local")),
                                `Nacional (Cobertura en todo ${defaultCountry})`
                              ])
                            } else {
                              setSelectedAlcance(selectedAlcance.filter((item) => !item.startsWith("Nacional") && !item.includes("nacional") && !item.includes("Local")))
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-sm font-medium text-foreground">
                          Nacional (Cobertura en todo el país)
                        </span>
                      </label>

                      {selectedAlcance.some(item => item.startsWith("Nacional") || item.includes("nacional") || item.includes("Local")) && (
                        <div className="pl-7 space-y-1 animate-in slide-in-from-top-2 duration-200">
                          <label className="block text-xs text-muted-foreground font-medium">
                            Selecciona el país de cobertura nacional:
                          </label>
                          <select
                            value={
                              (() => {
                                const currentNacional = selectedAlcance.find(item => item.startsWith("Nacional") || item.includes("nacional") || item.includes("Local"))
                                if (currentNacional) {
                                  const match = currentNacional.match(/Nacional \(Cobertura en todo (.*?)\)/)
                                  return match ? match[1] : (formData.country || "El Salvador")
                                }
                                return formData.country || "El Salvador"
                              })()
                            }
                            onChange={(e) => {
                              const countryVal = e.target.value
                              setSelectedAlcance([
                                ...selectedAlcance.filter(item => !item.startsWith("Nacional") && !item.includes("nacional") && !item.includes("Local")),
                                `Nacional (Cobertura en todo ${countryVal})`
                              ])
                            }}
                            className="w-full max-w-[280px] px-3 py-1.5 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                          >
                            {ALL_COUNTRIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                {/* Mercado Internacional */}
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Mercado Internacional
                  </h4>
                  <div className="space-y-3 bg-background p-3 rounded-lg border border-border">
                    {ALCANCE_OPTIONS.internacional.map((opcion) => {
                      const isChecked = selectedAlcance.includes(opcion.value);
                      return (
                        <label key={opcion.value} className="flex items-center gap-3 cursor-pointer py-1 select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAlcance([...selectedAlcance, opcion.value])
                              } else {
                                setSelectedAlcance(selectedAlcance.filter((item) => item !== opcion.value))
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                          />
                          <span className="text-sm font-medium text-foreground">
                            {opcion.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>


            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Descripción del Producto <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe tu producto, características, origen, calidad, certificaciones, etc."
                rows={5}
                className="w-full"
                disabled={isLoading}
                required
                minLength={50}
              />
              <p className={`text-xs mt-2 ${formData.description.length < 50 ? 'text-red-500' : 'text-green-600'}`}>
                {formData.description.length} / 50 caracteres mínimos
              </p>
            </div>

            <div>
              <label htmlFor="certifications" className="block text-sm font-medium mb-3">
                Certificaciones <span className="text-xs text-muted-foreground">(Escribe y presiona Enter para agregar)</span>
              </label>

              <div className="flex gap-2 mb-3">
                <Input
                  id="certifications"
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
                <label htmlFor="companyName" className="block text-sm font-medium mb-2">
                  Nombre del Vendedor <span className="text-red-500">*</span>
                </label>
                <Input
                  id="companyName"
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Se completará automáticamente con el nombre de tu perfil"
                  className="bg-muted cursor-not-allowed border-muted-foreground/20"
                  readOnly={true}
                  tabIndex={-1}
                  required
                />
                <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center flex-wrap gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                  Este nombre se basa en tu configuración de perfil y no se puede cambiar aquí.
                  <button 
                    type="button"
                    onClick={() => router.push("/dashboard/perfil")}
                    className="text-primary hover:underline font-medium ml-1 outline-none"
                  >
                    Ir a configuración de perfil
                  </button>
                </p>
              </div>
              <div>
                <label htmlFor="contactMethod" className="block text-sm font-medium mb-2">
                  Medio de Contacto <span className="text-red-500">*</span>
                </label>
                <select
                  id="contactMethod"
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
                <label htmlFor={formData.contactMethod === "WhatsApp" ? "phoneNumber" : "contactInfo"} className="block text-sm font-medium mb-2">
                  {formData.contactMethod === "WhatsApp" ? (
                    <>Código y Teléfono <span className="text-red-500">*</span></>
                  ) : (
                    <>Usuario / Correo <span className="text-red-500">*</span></>
                  )}
                </label>
                {formData.contactMethod === "WhatsApp" ? (
                  <div className="flex gap-2">
                    <div className="w-36 shrink-0">
                      <PhoneCodePicker
                        value={formData.countryCode}
                        onChange={(phoneCode, countryCode) => setFormData({ ...formData, countryCode: phoneCode })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Código de país</p>
                    </div>
                    <div className="flex-1">
                      <Input
                        id="phoneNumber"
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
                    id="contactInfo"
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
                <div
                  role="alert"
                  aria-live="polite"
                  className={`p-3 rounded-md text-sm font-medium ${statusMessage.type === 'error' ? 'bg-red-100 text-red-700' :
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
