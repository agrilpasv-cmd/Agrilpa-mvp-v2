"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, Loader, X, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PRODUCT_CATEGORIES } from "@/lib/constants"
import { PhoneCodePicker } from "@/components/ui/country-picker"
import { CurrencyPicker } from "@/components/ui/currency-picker"
import { compressImage, MAX_FILE_SIZE_MB } from "@/lib/compress-image"

export default function AdminNuevaPublicacionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")

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

  // Load users for the admin to select
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users")
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
      }
    }
    fetchUsers()
  }, [])

  // Auto-fill company name when a user is selected
  useEffect(() => {
    if (selectedUserId && users.length > 0) {
      const selectedUser = users.find(u => u.id === selectedUserId)
      if (selectedUser) {
        setFormData(prev => ({ ...prev, companyName: selectedUser.company_name || selectedUser.full_name || "" }))
      }
    } else {
      setFormData(prev => ({ ...prev, companyName: "" }))
    }
  }, [selectedUserId, users])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let processedValue = value

    if (name === "state") {
      const cleanVal = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageKey: "image" | "image2" | "image3") => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: `La imagen es demasiado grande. Usa una imagen menor a ${MAX_FILE_SIZE_MB}MB.` })
      e.target.value = ""
      return
    }

    setStatusMessage({ type: 'loading', text: "Optimizando imagen..." })
    try {
      const compressed = await compressImage(file)
      if (imageKey === "image")  setImagePreview(compressed)
      if (imageKey === "image2") setImagePreview2(compressed)
      if (imageKey === "image3") setImagePreview3(compressed)
      setFormData((prev) => ({ ...prev, [imageKey]: compressed }))
      setStatusMessage({ type: null, text: "" })
    } catch (err) {
      console.error("Image compression failed:", err)
      setStatusMessage({ type: 'error', text: "Error al procesar la imagen. Intenta con otra." })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage({ type: 'loading', text: "Validando datos..." })

    if (!selectedUserId) {
      setStatusMessage({ type: 'error', text: "Debes seleccionar a qué usuario pertenece esta publicación." })
      return
    }

    const requiredFields = [
      { key: "title", label: "Título del Producto" },
      { key: "category", label: "Categoría" },
      ...(isPriceOnRequest ? [] : [{ key: "price", label: "Precio" }]),
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
      const response = await fetch("/api/products/create-user-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          ...formData,
          price: isPriceOnRequest ? "Por Cotizar" : formData.price,
          currency: formData.currency,
          quantity: `${formData.quantity} ${formData.quantityUnit || "kg"}`,
          minOrder: `${formData.minOrder} ${formData.minOrderUnit || "kg"}`,
          shippingUnitType: formData.shippingUnit,
          containerSize: formData.containerSize || null,
          alcanceComercial: selectedAlcance,
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

      setTimeout(() => {
        router.push("/admin/publicaciones")
      }, 1500)
    } catch (error) {
      console.error("[Agrilpa] Error creating product:", error)
      setStatusMessage({ type: 'error', text: "Ocurrió un error inesperado." })
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
          onClick={() => router.push("/admin/publicaciones")}
          className="bg-transparent"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Crear Publicación para Usuario</h1>
          <p className="text-muted-foreground mt-1">Completa los detalles para publicar a nombre de un usuario</p>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Selección de Usuario e Información del Producto</CardTitle>
          <CardDescription>
            Elige al usuario y luego llena los detalles de la publicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ── Selección de Usuario ── */}
            <div className="p-4 bg-muted/30 border border-border rounded-xl">
              <label htmlFor="userSelect" className="block text-sm font-medium mb-2">
                Asignar a Usuario <span className="text-red-500">*</span>
              </label>
              <select
                id="userSelect"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                required
                disabled={isLoading || users.length === 0}
              >
                <option value="">-- Selecciona un usuario --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email}) {u.company_name ? `- ${u.company_name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fotos del Producto (Hasta 3 imágenes, mínimo 1 requerida)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  {ALL_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                  placeholder="Ej: Jalisco"
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

            <div className="border border-border/60 bg-muted/20 p-4 rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3">
                  ¿Cómo vendes este producto? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, saleMethod: "standard", packaging: prev.packaging === "Contenedores" ? "" : prev.packaging, shippingUnit: "", containerSize: "",
                      quantityUnit: prev.quantityUnit.startsWith("Contenedor") ? "kg" : prev.quantityUnit, minOrderUnit: prev.minOrderUnit.startsWith("Contenedor") ? "kg" : prev.minOrderUnit
                    }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${formData.saleMethod === "standard" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/30 bg-background"}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${formData.saleMethod === "standard" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>📦</div>
                    <div>
                      <p className="font-bold text-sm">Carga General / Sacos</p>
                      <p className="text-xs text-muted-foreground">Venta por sacos, cajas o bultos</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, saleMethod: "fcl", packaging: "Contenedores", shippingUnit: "FCL", containerSize: prev.containerSize || "20ST", quantityUnit: "Contenedor 20'", minOrderUnit: "Contenedor 20'", packagingSize: prev.packagingSize || "21000"
                    }))}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${formData.saleMethod === "fcl" ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/30 bg-background"}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${formData.saleMethod === "fcl" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>🚢</div>
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
                        <Input id="packagingSize" type="number" name="packagingSize" value={formData.packagingSize} onChange={handleInputChange} placeholder="Ej: 50" min="1" disabled={isLoading} required />
                        <span className="flex items-center px-3 bg-primary/10 border border-primary/20 rounded-md font-semibold text-primary">kg</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-sm font-semibold">Opciones de Contenedor FCL</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, containerSize: "20ST", packagingSize: "21000" }))} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center ${formData.containerSize === "20ST" ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-background"}`}>
                        <span className="text-3xl">🚢</span>
                        <p className="font-bold">20' Standard</p>
                      </button>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, containerSize: "40HC", packagingSize: "26000" }))} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center ${formData.containerSize === "40HC" ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-background"}`}>
                        <span className="text-3xl">🏗️</span>
                        <p className="font-bold">40' High Cube</p>
                      </button>
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, containerSize: "Ambos", packagingSize: "21000,26000" }))} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 text-center ${formData.containerSize === "Ambos" ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-background"}`}>
                        <span className="text-2xl">🚢🏗️</span>
                        <p className="font-bold">Ambas Opciones</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Precio <span className="text-red-500">*</span></label>
                <div className="flex bg-muted p-1 rounded-lg mb-3">
                  <button type="button" onClick={() => { setIsPriceOnRequest(true); setFormData(prev => ({ ...prev, price: "Por Cotizar" })) }} className={`flex-1 py-2 text-sm font-medium rounded-md ${isPriceOnRequest ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>Cotización</button>
                  <button type="button" onClick={() => { setIsPriceOnRequest(false); setFormData(prev => ({ ...prev, price: "" })) }} className={`flex-1 py-2 text-sm font-medium rounded-md ${!isPriceOnRequest ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}>Precio</button>
                </div>
                {!isPriceOnRequest ? (
                  <div className="flex gap-2">
                    <CurrencyPicker value={formData.currency} onChange={(val) => setFormData(prev => ({ ...prev, currency: val }))} disabled={isLoading} />
                    <Input type="number" name="price" value={formData.price === "Por Cotizar" ? "" : formData.price} onChange={handleInputChange} placeholder="0.00" disabled={isLoading} required={!isPriceOnRequest} step="0.01" min="0" />
                  </div>
                ) : (
                  <div className="p-3 bg-muted/50 border border-dashed rounded-lg text-center text-sm text-muted-foreground">Precio a acordar</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cantidad Disponible <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <Input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} min="1" className="w-full" disabled={isLoading} required />
                  <select name="quantityUnit" value={formData.quantityUnit} onChange={handleInputChange} className="px-3 py-2 border border-border rounded-md bg-background text-sm min-w-[120px]" disabled={isLoading}>
                    {formData.saleMethod === "fcl" ? <><option value="Contenedor 20'">Contenedor 20'</option><option value="Contenedor 40'">Contenedor 40'</option></> : <><option value="kg">kg</option><option value="lb">lb</option><option value="qq">qq</option></>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Pedido Mínimo <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <Input type="number" name="minOrder" value={formData.minOrder} onChange={handleInputChange} min="1" className="w-full" disabled={isLoading} required />
                  <select name="minOrderUnit" value={formData.minOrderUnit} onChange={handleInputChange} className="px-3 py-2 border border-border rounded-md bg-background text-sm min-w-[120px]" disabled={isLoading}>
                    {formData.saleMethod === "fcl" ? <><option value="Contenedor 20'">Contenedor 20'</option><option value="Contenedor 40'">Contenedor 40'</option></> : <><option value="kg">kg</option><option value="lb">lb</option><option value="qq">qq</option></>}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Capacidad de Abastecimiento <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input type="number" name="supplyCapacity" value={formData.supplyCapacity} onChange={handleInputChange} min="0" disabled={isLoading} className="w-full" />
                <select name="supplyCapacityUnit" value={formData.supplyCapacityUnit} onChange={handleInputChange} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" disabled={isLoading}>
                  <option value="kg">kg</option>
                  <option value="toneladas">toneladas</option>
                  <option value="libras">libras</option>
                </select>
                <select name="supplyCapacityPeriod" value={formData.supplyCapacityPeriod} onChange={handleInputChange} className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm" disabled={isLoading}>
                  <option value="mes">mes</option>
                  <option value="semana">semana</option>
                  <option value="día">día</option>
                  <option value="año">año</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Incoterm <span className="text-xs text-muted-foreground">(Opcional)</span></label>
              <select name="incoterm" value={formData.incoterm} onChange={handleInputChange} className="w-full px-3 py-2 border border-border rounded-md bg-background" disabled={isLoading}>
                <option value="A definir con el comprador">A definir con el comprador</option>
                <option value="EXW">EXW – En fábrica</option>
                <option value="FCA">FCA – Entrega al transportista</option>
                <option value="FOB">FOB – Libre a bordo</option>
                <option value="CIF">CIF – Costo, seguro y flete incluidos</option>
                <option value="CFR">CFR – Costo y flete incluidos</option>
                <option value="DAP">DAP – Entregado en destino</option>
                <option value="DDP">DDP – Entregado con impuestos pagados</option>
              </select>
            </div>

            <div className="bg-muted/10 p-5 rounded-xl border border-border mt-6">
              <label className="block text-sm font-semibold mb-1">Alcance Comercial <span className="text-red-500">*</span></label>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mercado Nacional</h4>
                  <div className="space-y-3 bg-background p-3 rounded-lg border border-border">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={selectedAlcance.some(item => item.includes("Nacional") || item.includes("nacional"))} onChange={(e) => {
                        if (e.target.checked) setSelectedAlcance([...selectedAlcance.filter(item => !item.includes("Nacional")), `Nacional (Cobertura en todo ${formData.country || "El Salvador"})`])
                        else setSelectedAlcance(selectedAlcance.filter((item) => !item.includes("Nacional")))
                      }} className="w-4 h-4 rounded text-primary" />
                      <span className="text-sm font-medium">Nacional (Cobertura en todo el país)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Mercado Internacional</h4>
                  <div className="space-y-3 bg-background p-3 rounded-lg border border-border">
                    {ALCANCE_OPTIONS.internacional.map((opcion) => (
                      <label key={opcion.value} className="flex items-center gap-3 cursor-pointer py-1">
                        <input type="checkbox" checked={selectedAlcance.includes(opcion.value)} onChange={(e) => {
                          if (e.target.checked) setSelectedAlcance([...selectedAlcance, opcion.value])
                          else setSelectedAlcance(selectedAlcance.filter((item) => item !== opcion.value))
                        }} className="w-4 h-4 rounded text-primary" />
                        <span className="text-sm font-medium">{opcion.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descripción del Producto <span className="text-red-500">*</span></label>
              <Textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe tu producto..." rows={5} className="w-full" disabled={isLoading} required minLength={50} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre del Vendedor / Empresa</label>
                <Input name="companyName" value={formData.companyName} onChange={handleInputChange} disabled={isLoading} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Medio de Contacto <span className="text-red-500">*</span></label>
                <select name="contactMethod" value={formData.contactMethod} onChange={handleInputChange} className="w-full px-3 py-2 border border-border rounded-md bg-background" disabled={isLoading} required>
                  <option value="">Selecciona un medio</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {formData.contactMethod === "WhatsApp" ? "Código y Teléfono" : "Usuario / Correo"} <span className="text-red-500">*</span>
                </label>
                {formData.contactMethod === "WhatsApp" ? (
                  <div className="flex gap-2">
                    <div className="w-36 shrink-0">
                      <PhoneCodePicker value={formData.countryCode} onChange={(code) => setFormData({ ...formData, countryCode: code })} />
                    </div>
                    <div className="flex-1">
                      <Input type="number" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} disabled={isLoading} required />
                    </div>
                  </div>
                ) : (
                  <Input type="text" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} disabled={isLoading} required />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-6">
              {statusMessage.text && (
                <div className={`p-3 rounded-md text-sm font-medium ${statusMessage.type === 'error' ? 'bg-red-100 text-red-700' : statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                  {statusMessage.text}
                </div>
              )}
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/publicaciones")} disabled={isLoading} className="flex-1 hover:bg-red-600 hover:text-white">Cancelar</Button>
                <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
                  {isLoading ? <><Loader className="w-4 h-4 animate-spin" /> Publicando...</> : <><Check className="w-4 h-4" /> Crear Producto para Usuario</>}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
