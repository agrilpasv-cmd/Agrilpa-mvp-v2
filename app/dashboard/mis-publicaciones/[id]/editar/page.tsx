"use client"

import type React from "react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Check, Loader, X, Plus, ChevronRight, ChevronLeft, ShieldCheck, Image as ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PRODUCT_CATEGORIES, UNIDADES_MEDIDA } from "@/lib/constants"
import { useDashboard } from "../../../context"
import { CurrencyPicker } from "@/components/ui/currency-picker"
import { compressImage, MAX_FILE_SIZE_MB } from "@/lib/compress-image"

const PREDEFINED_CERTS = [
  "Global GAP", "USDA Organic", "Fair Trade", "Rainforest Alliance",
  "HACCP", "ISO 9001", "FDA Registered", "SMETA", "Kosher", "Halal", "Organic EU"
]

export default function EditarPublicacionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    title: "", category: "", price: "", quantity: "", unit: "kg", description: "",
    country: "", state: "", minOrderQuantity: "", maturity: "", image: "", image2: "", image3: "",
    packaging: "", packagingSize: "", shippingUnit: "", containerSize: "", companyName: "",
    contactEmail: "", countryCode: "", phoneNumber: "", certifications: "",
    incoterm: "A definir con el comprador", saleMethod: "standard", supplyCapacity: "",
    supplyCapacityUnit: "toneladas", supplyCapacityPeriod: "mes", currency: "US$",
  })
  
  const [priceType, setPriceType] = useState<"fixed" | "quote">("fixed")
  const [certInput, setCertInput] = useState("")
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'loading' | null, text: string }>({ type: null, text: "" })
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imagePreview2, setImagePreview2] = useState<string>("")
  const [imagePreview3, setImagePreview3] = useState<string>("")
  const [selectedAlcance, setSelectedAlcance] = useState<string[]>([])

  const ALL_COUNTRIES = [
    "El Salvador", "Guatemala", "Honduras", "Nicaragua", "Costa Rica", "Panamá", "Belice",
    "México", "Estados Unidos", "Canadá", "Argentina", "Bolivia", "Brasil", "Chile", 
    "Colombia", "Ecuador", "Paraguay", "Perú", "Uruguay", "Venezuela",
    "España", "Alemania", "Países Bajos", "Reino Unido", "China", "Japón"
  ]

  const ALCANCE_OPTIONS = {
    internacional: [
      { value: 'Regional (Centroamérica)', label: 'Centroamérica' },
      { value: 'Norteamérica (EE.UU./Canadá)', label: 'Norteamérica (EE.UU./Canadá)' },
      { value: 'Europa', label: 'Europa' },
      { value: 'Mercado Global (Otros destinos)', label: 'Mercado Global' }
    ]
  }

  const { refreshCounts } = useDashboard()

  // Load existing product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/products/get-user-product-by-id?id=${resolvedParams.id}`)
        const data = await res.json()
        if (data.product) {
          const p = data.product
          let cleanDesc = p.description || ""
          if (cleanDesc.includes("---\nInformación del Vendedor:")) {
            cleanDesc = cleanDesc.split("---\nInformación del Vendedor:")[0].trim()
          }
          // Parse quantity number only
          const qtyNum = p.quantity ? p.quantity.toString().replace(/[^\d.]/g, "") : ""
          const minNum = p.min_order_quantity ? p.min_order_quantity.toString() : (p.min_order ? p.min_order.toString().replace(/[^\d.]/g, "") : "")
          setPriceType(p.price_type || (p.price === "Por Cotizar" ? "quote" : "fixed"))
          setFormData(prev => ({
            ...prev,
            title: p.title || "",
            category: p.category || "",
            price: p.price === "Por Cotizar" ? "" : (p.price || ""),
            currency: p.currency || "US$",
            quantity: qtyNum,
            unit: p.unit || "kg",
            description: cleanDesc,
            country: p.country || "",
            state: p.state || "",
            minOrderQuantity: minNum,
            maturity: p.maturity || "",
            image: p.image || "",
            image2: p.image2 || "",
            image3: p.image3 || "",
            packaging: p.packaging || "",
            packagingSize: (p.packaging_size?.toString() || "").replace(/[a-zA-Z\s]+$/g, ""),
            shippingUnit: p.shipping_unit_type || "",
            containerSize: p.container_size || "",
            companyName: p.company_name || "",
            contactEmail: p.contact_email || "",
            countryCode: p.country_code || "503",
            phoneNumber: p.phone_number || "",
            certifications: p.certifications || "",
            incoterm: p.incoterm || "A definir con el comprador",
            saleMethod: p.shipping_unit_type === "FCL" ? "fcl" : "standard",
            supplyCapacity: "",
            supplyCapacityUnit: "toneladas",
            supplyCapacityPeriod: "mes",
          }))
          setImagePreview(p.image || "")
          setImagePreview2(p.image2 || "")
          setImagePreview3(p.image3 || "")
          setSelectedAlcance(p.alcance_comercial || [])
        }
      } catch (e) {
        setStatusMessage({ type: 'error', text: "Error al cargar el producto." })
      } finally {
        setIsLoadingData(false)
      }
    }
    loadProduct()
  }, [resolvedParams.id])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push("/auth")
    }
    const timer = setTimeout(() => checkAuth(), 500)
    return () => clearTimeout(timer)
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let processedValue = value
    if (name === "state") {
      const cleanVal = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "")
      processedValue = cleanVal.split(" ").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
    }
    if (name === "price") {
      let cleanVal = value.replace(/[^0-9.]/g, "")
      const parts = cleanVal.split(".")
      if (parts[0].length > 2) parts[0] = parts[0].slice(0, 2)
      if (parts.length > 1) {
        parts[1] = parts[1].slice(0, 2)
        cleanVal = parts.slice(0, 2).join(".")
      } else {
        cleanVal = parts[0]
      }
      processedValue = cleanVal
    }
    setFormData((prev) => ({ ...prev, [name]: processedValue }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageKey: "image" | "image2" | "image3") => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: `La imagen no debe superar los ${MAX_FILE_SIZE_MB}MB.` })
      e.target.value = ""
      return
    }
    setStatusMessage({ type: 'loading', text: "Optimizando imagen..." })
    try {
      const compressed = await compressImage(file)
      if (imageKey === "image") setImagePreview(compressed)
      if (imageKey === "image2") setImagePreview2(compressed)
      if (imageKey === "image3") setImagePreview3(compressed)
      setFormData((prev) => ({ ...prev, [imageKey]: compressed }))
      setStatusMessage({ type: null, text: "" })
    } catch (err) {
      setStatusMessage({ type: 'error', text: "Error al procesar la imagen." })
    }
  }

  // --- LÓGICA DE CERTIFICACIONES MEJORADA ---
  const toggleCertification = (cert: string) => {
    const currentCerts = formData.certifications ? formData.certifications.split(',').map(c => c.trim()).filter(Boolean) : []
    if (currentCerts.includes(cert)) {
      setFormData({ ...formData, certifications: currentCerts.filter(c => c !== cert).join(',') })
    } else {
      setFormData({ ...formData, certifications: [...currentCerts, cert].join(',') })
    }
  }

  const handleAddCustomCert = (e?: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) => {
    // Si viene de teclado y no es Enter, no hacemos nada
    if (e && 'key' in e && e.key !== 'Enter') return;
    
    e?.preventDefault()
    const newCert = certInput.trim()
    if (newCert) {
      const currentCerts = formData.certifications ? formData.certifications.split(',').map(c => c.trim()).filter(Boolean) : []
      if (!currentCerts.includes(newCert)) {
        setFormData({ ...formData, certifications: [...currentCerts, newCert].join(',') })
      }
      setCertInput("")
    }
  }

  const validateStep = (step: number) => {
    setStatusMessage({ type: null, text: "" })
    if (step === 1) {
      if (!formData.image) return "La Foto Principal es obligatoria."
      if (!formData.title) return "Debes ingresar el Título del Producto."
      if (!formData.category) return "Selecciona una Categoría."
      if (!formData.country) return "Selecciona el País de Origen."
      if (formData.description.length < 50) return "La descripción debe ser más detallada (mín. 50 caracteres)."
    }
    if (step === 3) {
      if (priceType === "fixed" && !formData.price) return "Debes indicar un precio o seleccionar 'Cotización'."
      if (!formData.quantity) return "Indica la Cantidad Disponible."
      if (!formData.minOrderQuantity) return "Indica el Pedido Mínimo."
      if (!formData.supplyCapacity) return "Indica tu Capacidad de Abastecimiento."
      if (selectedAlcance.length === 0) return "Selecciona al menos una región en tu Alcance Comercial."
    }
    return null
  }

  const handleNextStep = () => {
    const error = validateStep(currentStep)
    if (error) return setStatusMessage({ type: 'error', text: error })
    setCurrentStep((prev) => Math.min(prev + 1, 3))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePrevStep = () => {
    setStatusMessage({ type: null, text: "" })
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const error = validateStep(3)
    if (error) return setStatusMessage({ type: 'error', text: error })

    setIsLoading(true)
    setStatusMessage({ type: 'loading', text: "Guardando cambios..." })

    try {
      const response = await fetch("/api/products/update-product", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resolvedParams.id,
          title: formData.title,
          category: formData.category,
          price: priceType === "quote" ? "Por Cotizar" : formData.price,
          price_type: priceType,
          currency: formData.currency,
          unit: formData.unit,
          quantity: `${formData.quantity} ${formData.unit}`,
          description: formData.description,
          country: formData.country,
          state: formData.state,
          min_order: `${formData.minOrderQuantity} ${formData.unit}`,
          min_order_quantity: Number(formData.minOrderQuantity) || null,
          maturity: formData.maturity,
          packaging: formData.packaging || (formData.saleMethod === "fcl" ? "Contenedores" : "Cajas de Cartón"),
          packaging_size: formData.packagingSize ? parseInt(formData.packagingSize) : null,
          image: formData.image,
          image2: formData.image2,
          image3: formData.image3,
          certifications: formData.certifications,
          incoterm: formData.incoterm,
          shipping_unit_type: formData.saleMethod === "fcl" ? "FCL" : null,
          container_size: formData.containerSize || null,
          alcanceComercial: selectedAlcance,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || "Error al actualizar la publicación.")
      }

      setStatusMessage({ type: 'success', text: "¡Publicación actualizada exitosamente!" })
      await refreshCounts()
      setTimeout(() => router.push("/dashboard/mis-publicaciones"), 1500)
    } catch (error: any) {
      setStatusMessage({ type: 'error', text: error.message || "Ocurrió un problema de conexión. Intenta de nuevo." })
      setIsLoading(false)
    }
  }

  const activeCertsArray = formData.certifications ? formData.certifications.split(',').map(c => c.trim()).filter(Boolean) : []

  return (
    // VOLVEMOS AL MAX-W-4XL (Estructura centrada y enfocada)
    <div className="p-4 md:p-6 space-y-6 w-full max-w-4xl mx-auto">
      
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/mis-publicaciones")} className="rounded-full hover:bg-muted transition-colors duration-300" disabled={isLoading}>
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Editar Publicación</h1>
          <p className="text-sm text-muted-foreground mt-1">Actualiza los datos de tu publicación.</p>
        </div>
      </div>

      <Card className="border border-border/50 shadow-sm bg-background overflow-hidden">
        
        {/* STEPPER ELEGANTE */}
        <CardHeader className="bg-muted/10 border-b border-border/50 py-5">
          <div className="flex items-center justify-between w-full relative px-2 md:px-8">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-muted z-0" />
            <div 
              className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-primary z-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" 
              style={{ width: `calc(${((currentStep - 1) / 2) * 100}% - 3rem)` }} 
            />
            {[
              { num: 1, label: "Info Básica" },
              { num: 2, label: "Logística" },
              { num: 3, label: "Negocio" }
            ].map((step) => {
              const isActive = currentStep >= step.num
              const isPast = currentStep > step.num
              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center gap-2 bg-transparent">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 shadow-sm ${
                    isActive ? 'bg-primary text-primary-foreground scale-110 ring-4 ring-primary/20' : 'bg-background text-muted-foreground border-2 border-muted hover:border-primary/50'
                  }`}>
                    {isPast ? <Check className="w-5 h-5" /> : step.num}
                  </div>
                  <span className={`text-[11px] md:text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </CardHeader>
        
        <CardContent className="p-5 md:p-8">
          <form onSubmit={handleSubmit} className="min-h-[400px]">
            
            {/* PASO 1: INFO BÁSICA Y CERTIFICACIONES */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 ease-out fill-mode-forwards">
                
                {/* Sección Fotos */}
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary"/> Registro Visual <span className="text-muted-foreground font-normal text-xs">(Mín. 1 foto)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[
                      { key: 'image', prev: imagePreview, setter: setImagePreview, label: 'Foto Principal *' },
                      { key: 'image2', prev: imagePreview2, setter: setImagePreview2, label: 'Detalle / Empaque' },
                      { key: 'image3', prev: imagePreview3, setter: setImagePreview3, label: 'Campo / Cosecha' }
                    ].map((imgInfo, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden bg-muted/20 border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-300 aspect-[4/3] flex items-center justify-center cursor-pointer">
                        {imgInfo.prev ? (
                          <>
                            <img src={imgInfo.prev} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                            <button type="button" onClick={(e) => { e.preventDefault(); imgInfo.setter(""); setFormData(p => ({ ...p, [imgInfo.key]: "" })) }} className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-foreground hover:bg-destructive hover:text-white rounded-full p-2 shadow-sm transition-all duration-200">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                            <div className="w-10 h-10 rounded-full bg-background shadow-sm border border-border flex items-center justify-center mb-2 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <span className="text-sm font-semibold text-muted-foreground">{imgInfo.label}</span>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, imgInfo.key as any)} className="hidden" />
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Nombre del Producto <span className="text-destructive">*</span></label>
                    <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="Ej: Aguacate Hass Orgánico" className="h-11 bg-muted/10 transition-all focus-visible:ring-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Categoría <span className="text-destructive">*</span></label>
                    <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                      <SelectTrigger className="h-11 bg-muted/10"><SelectValue placeholder="Selecciona el rubro..." /></SelectTrigger>
                      <SelectContent>{PRODUCT_CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Descripción Técnica y Comercial <span className="text-destructive">*</span></label>
                  <Textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Detalla calidad, calibre, origen, condiciones de suelo, y por qué tu producto es ideal para compradores exigentes..." className="min-h-[100px] resize-y p-3 bg-muted/10 transition-all focus-visible:ring-primary/50" />
                  <div className="flex justify-end">
                    <span className={`text-[11px] font-bold transition-colors ${formData.description.length < 50 ? 'text-destructive' : 'text-emerald-600'}`}>
                      {formData.description.length} / 50 min.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">País Origen <span className="text-destructive">*</span></label>
                    <Select value={formData.country} onValueChange={(v) => setFormData(p => ({ ...p, country: v }))}>
                      <SelectTrigger className="h-11 bg-muted/10"><SelectValue placeholder="País" /></SelectTrigger>
                      <SelectContent>{ALL_COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Región / Zona Cosecha</label>
                    <Input name="state" value={formData.state} onChange={handleInputChange} placeholder="Ej: Valle de..." className="h-11 bg-muted/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground">Maduración</label>
                    <Select value={formData.maturity} onValueChange={(v) => setFormData(p => ({ ...p, maturity: v }))}>
                      <SelectTrigger className="h-11 bg-muted/10"><SelectValue placeholder="Estado" /></SelectTrigger>
                      <SelectContent>
                        {["No aplica", "Verde (Para exportación)", "Semi-maduro", "Maduro"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* --- NUEVO PANEL DE CERTIFICACIONES (EXPLICITO Y CLARO) --- */}
                <div className="bg-muted/10 p-5 md:p-6 rounded-xl border border-border/60 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <h3 className="font-bold text-foreground">Certificaciones y Estándares</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">Selecciona los sellos de calidad que posee tu producto (vital para exportación).</p>
                  </div>
                  
                  {/* Chips Predefinidos */}
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_CERTS.map(cert => {
                      const isActive = activeCertsArray.includes(cert);
                      return (
                        <button
                          key={cert}
                          type="button"
                          onClick={() => toggleCertification(cert)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                            isActive 
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105' 
                              : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:bg-muted'
                          }`}
                        >
                          {cert}
                        </button>
                      )
                    })}
                  </div>
                  
                  {/* Input de Certificación Personalizada (Ahora con botón) */}
                  <div className="pt-4 border-t border-border/50">
                    <label className="text-xs font-bold text-muted-foreground block mb-2">¿Tienes alguna otra certificación? Agrégala aquí:</label>
                    <div className="flex gap-2 max-w-md">
                      <Input 
                        value={certInput} 
                        onChange={(e) => setCertInput(e.target.value)} 
                        onKeyDown={handleAddCustomCert} 
                        placeholder="Ej: Certificado Fitosanitario" 
                        className="h-10 text-sm bg-background"
                      />
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={handleAddCustomCert}
                        className="h-10 px-4 font-bold shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Agregar
                      </Button>
                    </div>
                  </div>

                  {/* Chips Personalizados Agregados */}
                  {activeCertsArray.filter(c => !PREDEFINED_CERTS.includes(c)).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {activeCertsArray.filter(c => !PREDEFINED_CERTS.includes(c)).map(cert => (
                        <Badge key={cert} variant="default" className="pl-3 pr-1.5 py-1 flex items-center gap-1.5 text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30">
                          {cert} 
                          <button type="button" onClick={() => toggleCertification(cert)} className="hover:bg-primary hover:text-white rounded-full p-0.5 transition-colors"><X className="w-3 h-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* PASO 2: LOGÍSTICA Y EMPAQUE */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 ease-out fill-mode-forwards">
                
                <div>
                  <h3 className="text-base font-bold mb-4">Estructura de Venta <span className="text-destructive">*</span></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <label className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 ease-out flex gap-4 items-start ${formData.saleMethod === "standard" ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-muted hover:border-primary/40 bg-background hover:bg-muted/30"}`}>
                      <input type="radio" className="peer sr-only" checked={formData.saleMethod === "standard"} onChange={() => setFormData(p => ({ ...p, saleMethod: "standard", containerSize: "", unit: "kg" }))} />
                      <div className={`w-12 h-12 rounded-full flex shrink-0 items-center justify-center text-xl transition-colors ${formData.saleMethod === "standard" ? "bg-primary text-white" : "bg-muted"}`}>📦</div>
                      <div>
                        <h4 className="font-bold text-foreground">Carga General / Fraccionada</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Ideal para venta local o regional por cajas, pallets o sacos.</p>
                      </div>
                    </label>

                    <label className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 ease-out flex gap-4 items-start ${formData.saleMethod === "fcl" ? "border-primary bg-primary/5 shadow-md scale-[1.02]" : "border-muted hover:border-primary/40 bg-background hover:bg-muted/30"}`}>
                      <input type="radio" className="peer sr-only" checked={formData.saleMethod === "fcl"} onChange={() => setFormData(p => ({ ...p, saleMethod: "fcl", packaging: "Contenedores", shippingUnit: "FCL", containerSize: "40HC", unit: "Contenedor 40'" }))} />
                      <div className={`w-12 h-12 rounded-full flex shrink-0 items-center justify-center text-xl transition-colors ${formData.saleMethod === "fcl" ? "bg-primary text-white" : "bg-muted"}`}>🚢</div>
                      <div>
                        <h4 className="font-bold text-foreground">Exportación FCL (Contenedor)</h4>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">Venta orientada a exportación en contenedores marítimos o terrestres.</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-muted/10 p-5 md:p-6 rounded-xl border border-border/60">
                  {formData.saleMethod === "standard" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Tipo de Embalaje Principal</label>
                        <Select value={formData.packaging} onValueChange={(v) => setFormData(p => ({ ...p, packaging: v }))}>
                          <SelectTrigger className="h-11 bg-background"><SelectValue placeholder="Selecciona formato..." /></SelectTrigger>
                          <SelectContent>
                            {["Cajas de Cartón", "Cajas Plásticas", "Sacos", "Pallets", "Granel", "Totes/Octabins"].map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Capacidad neta por envase <span className="text-muted-foreground font-normal">(Ej: 15kg)</span></label>
                        <Input name="packagingSize" type="number" value={formData.packagingSize} onChange={handleInputChange} placeholder="Kilos / Litros por unidad" className="h-11 bg-background" />
                      </div>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-500">
                      <label className="text-sm font-bold text-foreground mb-4 block">Capacidad Marítima / Terrestre</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { id: '20ST', label: "20' Standard", desc: "Aprox. 21 tons" },
                          { id: '40HC', label: "40' High Cube", desc: "Aprox. 26 tons" },
                          { id: 'Ambos', label: "Ambas Opciones", desc: "Según requerimiento" }
                        ].map(opt => (
                          <button key={opt.id} type="button" onClick={() => setFormData(p => ({ ...p, containerSize: opt.id }))} className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${formData.containerSize === opt.id ? "border-primary bg-background shadow-sm" : "border-border hover:border-primary/30 bg-background/50"}`}>
                            <p className="font-bold">{opt.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Incoterm Base <span className="text-muted-foreground font-normal">(Condiciones de envío)</span></label>
                  <Select value={formData.incoterm} onValueChange={(v) => setFormData(p => ({ ...p, incoterm: v }))}>
                    <SelectTrigger className="h-11 max-w-md bg-muted/10"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A definir con el comprador">A definir (Negociable)</SelectItem>
                      <SelectItem value="EXW">EXW – En finca / origen</SelectItem>
                      <SelectItem value="FOB">FOB – Puesto en puerto/frontera</SelectItem>
                      <SelectItem value="CIF">CIF – Entregado con seguro</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Agrilpa no gestiona la logística, esta información guía al comprador sobre tu alcance de entrega.</p>
                </div>
              </div>
            )}

            {/* PASO 3: NEGOCIO Y ALCANCE */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 ease-out fill-mode-forwards">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Unidad y Precios */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Unidad Base Comercial <span className="text-destructive">*</span></label>
                      <Select value={formData.unit} onValueChange={(v) => setFormData(p => ({ ...p, unit: v }))}>
                        <SelectTrigger className="h-11 bg-muted/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {UNIDADES_MEDIDA.map((u) => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Cotización <span className="text-destructive">*</span></label>
                      <div className="flex bg-muted/40 p-1.5 rounded-lg border border-border/50">
                        <button type="button" onClick={() => { setPriceType("quote"); setFormData(p => ({ ...p, price: "" })) }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-300 ${priceType === "quote" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>A Convenir (Chat)</button>
                        <button type="button" onClick={() => setPriceType("fixed")} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-300 ${priceType === "fixed" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Precio Fijo</button>
                      </div>
                      
                      {priceType === "fixed" && (
                        <div className="flex gap-2 mt-3 animate-in slide-in-from-top-2 fade-in duration-300">
                          <CurrencyPicker value={formData.currency} onChange={(val) => setFormData(p => ({ ...p, currency: val }))} />
                          <Input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Valor por unidad" className="h-11 font-bold" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Volúmenes */}
                  <div className="space-y-6 bg-muted/10 p-5 md:p-6 rounded-xl border border-border/50">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Pedido Mínimo (MOQ) <span className="text-destructive">*</span></label>
                      <div className="relative">
                        <Input type="number" name="minOrderQuantity" value={formData.minOrderQuantity} onChange={handleInputChange} placeholder="Volumen mínimo" className="h-11 pr-16 bg-background" />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold uppercase">{formData.unit}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Cantidad Stock Actual <span className="text-destructive">*</span></label>
                      <Input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} placeholder="Disp. Inmediata" className="h-11 bg-background" />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <label className="text-sm font-bold text-primary">Capacidad de Abastecimiento Continua</label>
                      <div className="flex gap-2">
                        <Input type="number" name="supplyCapacity" value={formData.supplyCapacity} onChange={handleInputChange} placeholder="Volumen" className="h-11 bg-background" />
                        <Select value={formData.supplyCapacityPeriod} onValueChange={(v) => setFormData(p => ({ ...p, supplyCapacityPeriod: v }))}>
                          <SelectTrigger className="h-11 w-32 bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="semana">/ Semana</SelectItem>
                            <SelectItem value="mes">/ Mes</SelectItem>
                            <SelectItem value="temporada">/ Temporada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-foreground">Mercados de Interés (Alcance) <span className="text-destructive">*</span></label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className={`cursor-pointer flex items-center justify-center p-3 rounded-xl border-2 text-sm font-bold text-center transition-all duration-300 ${selectedAlcance.some(i => i.startsWith("Nacional")) ? "bg-primary text-white border-primary shadow-sm" : "bg-background border-border hover:border-primary/40 text-muted-foreground"}`}>
                      <input type="checkbox" className="hidden" checked={selectedAlcance.some(i => i.startsWith("Nacional"))} onChange={(e) => setSelectedAlcance(e.target.checked ? [...selectedAlcance, `Nacional (Cobertura en ${formData.country || "tu país"})`] : selectedAlcance.filter(i => !i.startsWith("Nacional")))} />
                      Mercado Nacional
                    </label>
                    {ALCANCE_OPTIONS.internacional.map((opcion) => {
                      const isSelected = selectedAlcance.includes(opcion.value);
                      return (
                        <label key={opcion.value} className={`cursor-pointer flex items-center justify-center p-3 rounded-xl border-2 text-sm font-bold text-center transition-all duration-300 ${isSelected ? "bg-primary text-white border-primary shadow-sm" : "bg-background border-border hover:border-primary/40 text-muted-foreground"}`}>
                          <input type="checkbox" className="hidden" checked={isSelected} onChange={(e) => setSelectedAlcance(e.target.checked ? [...selectedAlcance, opcion.value] : selectedAlcance.filter(i => i !== opcion.value))} />
                          {opcion.label}
                        </label>
                      )
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* BARRA ESTADO DE ERRORES */}
            {statusMessage.text && (
              <div className={`mt-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${statusMessage.type === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/20' : statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                {statusMessage.type === 'error' && <X className="w-5 h-5 shrink-0" />}
                {statusMessage.text}
              </div>
            )}

            {/* CONTROLADORES INFERIORES */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t border-border/50">
              <div>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isLoading} className="h-12 px-6 rounded-full hover:bg-muted font-bold transition-all duration-300">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Atrás
                  </Button>
                )}
              </div>
              
              <div>
                {currentStep < 3 ? (
                  <Button type="button" onClick={handleNextStep} className="h-12 px-8 rounded-full font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading} className="h-12 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    {isLoading ? <><Loader className="w-5 h-5 mr-2 animate-spin" /> Guardando...</> : <><Check className="w-5 h-5 mr-2" /> Guardar Cambios</>}
                  </Button>
                )}
              </div>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  )
}
