"use client"

import { notFound, useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChatOverlay } from "@/components/chat-overlay"
import { Star, MapPin, MessageCircle, Check, ChevronLeft, FileText, ShoppingCart, Copy, Calendar, Package, Loader, AlertCircle, ArrowRight, ShieldCheck, X, Globe } from "lucide-react"
import { getProductBySlug, getProductsByCategory, allProducts } from "@/lib/products-data"
import { ProductHero } from "@/components/product-hero"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { trackActivity } from "@/lib/track"

// Helper function to check if a string is a valid UUID or numeric ID
const isValidId = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const numberRegex = /^\d+$/
  return uuidRegex.test(str) || numberRegex.test(str)
}

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const slug = typeof params?.slug === "string" ? params.slug : ""

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id)
        // Fetch profile to auto-fill quotation form
        fetch("/api/user/profile")
          .then(res => res.json())
          .then(resData => {
            if (resData.user) {
              setQuotationForm(prev => ({
                ...prev,
                buyerName: resData.user.company_name || resData.user.full_name || "",
                email: resData.user.email || "",
                phoneNumber: resData.user.phone || "",
                countryCode: resData.user.country_code || ""
              }))
            }
          })
          .catch(err => console.error("Error fetching profile for auto-fill:", err))
      }
    })
  }, [])

  // State for static and user products
  const staticProduct = getProductBySlug(slug)
  const [userProduct, setUserProduct] = useState<any>(null)
  // Determine if we need to fetch: Valid ID and not a static product
  const shouldFetch = isValidId(slug) && !staticProduct
  const [isLoading, setIsLoading] = useState(shouldFetch)
  const [notFoundError, setNotFoundError] = useState(false)
  const [dynamicRelatedProducts, setDynamicRelatedProducts] = useState<any[]>([])

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [authDialogAction, setAuthDialogAction] = useState("")
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [isQuotationDialogOpen, setIsQuotationDialogOpen] = useState(false)
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false)
  const [quotationSuccess, setQuotationSuccess] = useState(false)
  const [quotationForm, setQuotationForm] = useState({
    buyerName: "",
    contactMethod: "WhatsApp",
    countryCode: "",
    phoneNumber: "",
    email: "",
    quantity: "",
    destinationCountry: "",
    estimatedDate: "",
    notes: "",
    targetPrice: "",
    incoterm: "",
    currency: "USD",
    containerSize: ""
  })
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  // Fetch user product if slug is a UUID
  useEffect(() => {
    console.log('=== PRODUCT PAGE LOADED ===')
    console.log('Slug:', slug)
    console.log('isValidId:', isValidId(slug))
    console.log('staticProduct:', !!staticProduct)

    window.scrollTo(0, 0)

    // Fetch dynamic products for related section
    fetch('/api/products/get-user-products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          const transformed = data.products.map((p: any) => ({
             id: p.id,
             name: p.title,
             category: p.category,
             description: p.description,
             seller: p.company_name || "Productor Local",
             location: p.country,
             price: p.price,
             quantity: p.quantity,
             rating: p.rating || 0,
             reviews: p.reviews || 0,
             minOrder: p.min_order || "N/A",
             image: p.image || "/placeholder.svg",
             slug: p.id,
             verified: false,
             contactMethod: p.contact_method,
             contactInfo: p.contact_info,
             vendorId: p.user_id,
             sellerIsPro: p.seller_is_pro || false
          }))
          setDynamicRelatedProducts(transformed.filter((p: any) => p.id !== slug))
        }
      })
      .catch(console.error)

    if (isValidId(slug)) {
      console.log('Fetching user product...')
      setIsLoading(true)
      fetch(`/api/products/get-user-product-by-id?id=${slug}&t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.product) {
            // Increment views for user products
            console.log('Calling increment-views API for:', slug)
            fetch('/api/products/increment-views', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: slug })
            })
              .then(res => res.json())
              .then(result => {
                console.log('View increment result:', result)
                trackActivity('page_view', `Visto producto: ${data.product.title}`, { productId: slug })
              })
              .catch(err => console.error('View tracking failed:', err))

            // Parse company info from description if available
            let producerName = "Productor Local"
            let contactMethod = ""
            let contactInfo = ""

            const desc = data.product.description || ""
            const companyMatch = desc.match(/Empresa: (.*?)(\n|$)/)
            if (companyMatch) {
              producerName = companyMatch[1].trim()
            }

            const contactMatch = desc.match(/Contacto: (.*?) - (.*)/)
            if (contactMatch) {
              contactMethod = contactMatch[1].trim()
              contactInfo = contactMatch[2].trim()
            }

            // Extract incoterm from description
            let extractedIncoterm = "A definir con el comprador"
            const incotermMatch = desc.match(/Incoterm: (.*?)(\n|$)/)
            if (incotermMatch) {
              extractedIncoterm = incotermMatch[1].trim()
            }

            // Extract supply capacity from description
            let extractedSupplyCapacity = null
            const supplyMatch = desc.match(/Capacidad de Abastecimiento: (.*?)(\n|$)/)
            if (supplyMatch) {
              extractedSupplyCapacity = supplyMatch[1].trim()
            }

            // Transform user product to match static product structure
            const transformed = {
              id: data.product.id,
              name: data.product.title,
              category: data.product.category,
              producer: producerName,
              vendorId: data.product.user_id,
              location: data.product.country,
              country: data.product.country,
              description: data.product.description,
              fullDescription: data.product.description,
              price: data.product.price,
              minOrder: data.product.min_order,
              rating: data.product.rating || 0,
              reviews: data.product.reviews || 0,
              reviewsData: data.product.reviews_data || [],
              views: data.product.views || 0,
              image: data.product.image || "/placeholder.svg",
              image2: data.product.image2,
              image3: data.product.image3,
              verified: data.product.seller_is_pro || false,
              slug: data.product.id,
              packaging: data.product.packaging,
              packagingSize: `${data.product.packaging_size} kg`,
              contactMethod: data.product.contact_method || contactMethod,
              contactInfo: data.product.contact_info || contactInfo,
              countryCode: data.product.country_code,
              phoneNumber: data.product.phone_number,
              incoterm: extractedIncoterm,
              shippingUnitType: data.product.shipping_unit_type || null,
              containerSize: data.product.container_size || null,
              alcance_comercial: data.product.alcance_comercial || [],
              specifications: [
                { label: "Origen", value: data.product.country },
                { label: "Categoría", value: data.product.category },
                { label: "Embalaje", value: data.product.packaging },
                { label: "Tamaño Embalaje", value: `${data.product.packaging_size} kg` },
                { label: "Vendedor", value: producerName },
                ...(extractedSupplyCapacity ? [{ label: "Capacidad de Abastecimiento", value: extractedSupplyCapacity }] : []),
                ...(data.product.shipping_unit_type ? [{ 
                  label: "Unidad de Envío", 
                  value: data.product.shipping_unit_type === "FCL" 
                    ? `FCL${data.product.container_size === "20ST" ? " – 20' Standard (~21 TM)" : data.product.container_size === "40HC" ? " – 40' High Cube (~26 TM)" : ""}` 
                    : data.product.shipping_unit_type === "LCL" 
                      ? "Carga Consolidada (LCL)" 
                      : "Cantidad Personalizada" 
                }] : []),
              ],
              certifications: data.product.certifications || null,
              sellerIsPro: data.product.seller_is_pro || false
            }
            setUserProduct(transformed)
          } else {
            setNotFoundError(true)
          }
        })
        .catch(error => {
          console.error("[v0] Error fetching user product:", error)
          setNotFoundError(true)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [slug])

  // Determine which product to display
  const product = staticProduct || userProduct

  // Show loading state for user products
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando producto...</p>
        </div>
      </div>
    )
  }

  // Show 404 if product not found - only after loading is complete
  if (!isLoading && !product && slug) {
    if (notFoundError) {
      notFound()
    }
    // If it's a valid ID and we're not loading but have no product, it's a 404
    if (isValidId(slug) && !userProduct) {
      notFound()
    }
    // If it's not a valid ID and not a static product, it's a 404
    if (!isValidId(slug) && !staticProduct) {
      notFound()
    }
  }

  const relatedData = React.useMemo(() => {
    if (!product) return { relatedProducts: [], relatedTitle: "" }

    const normalize = (str: string) => str?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || ""
    const currentName = normalize(product.name || "")

    // Combine dynamic products and static products for a richer suggestion pool
    const allAvailableProducts = [...dynamicRelatedProducts, ...allProducts].filter((p: any) => p.id !== slug && p.slug !== slug)

    const sameNameProducts = allAvailableProducts
      .filter((p) => {
        const pName = normalize(p.name)
        return (pName && currentName.includes(pName)) || (currentName && pName.includes(currentName))
      })

    const sameCategoryProducts = allAvailableProducts
      .filter((p) => p.category === product.category && !sameNameProducts.some(sp => sp.id === p.id))

    const otherProducts = allAvailableProducts
      .filter((p) => !sameNameProducts.some(sp => sp.id === p.id) && !sameCategoryProducts.some(sp => sp.id === p.id))
      .sort((a, b) => {
        const strA = a.id?.toString() || "";
        const strB = b.id?.toString() || "";
        const hashA = (a.name?.length || 0 + (strA.charCodeAt(0) || 0)) % 10;
        const hashB = (b.name?.length || 0 + (strB.charCodeAt(0) || 0)) % 10;
        return hashA - hashB;
      })

    const combinedProducts = [...sameNameProducts, ...sameCategoryProducts, ...otherProducts].slice(0, 3)
    
    const title = (sameNameProducts.length > 0 || sameCategoryProducts.length > 0)
      ? "Productos relacionados"
      : "Otros productos que te pueden interesar"

    return { relatedProducts: combinedProducts, relatedTitle: title }
  }, [product, dynamicRelatedProducts, slug])

  const { relatedProducts, relatedTitle } = relatedData

  const handleContactVendor = () => {
    if (!currentUserId) {
      setAuthDialogAction("contactar al vendedor")
      setIsAuthDialogOpen(true)
      return
    }

    console.log(`[v0] handleContactVendor called for: ${product.name}`)
    const contactMethod = (product as any).contactMethod
    const contactInfo = (product as any).contactInfo
    const countryCode = (product as any).countryCode
    const phoneNumber = (product as any).phoneNumber

    if ((contactMethod === "WhatsApp" && countryCode && phoneNumber) || (contactMethod && contactInfo)) {
      console.log(`[v0] Opening contact dialog for method: ${contactMethod}`)
      setIsContactDialogOpen(true)
    } else {
      console.log(`[v0] No direct contact info, opening chat with vendor: ${(product as any).vendorId}`)
      setIsChatOpen(true)
    }

    // Track initial "Contact Vendor" click (generic)
    setTimeout(() => trackContactClick("generic"), 0)
  }

  const trackContactClick = async (type: string) => {
    if (!product) return

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user?.id) {
        setAuthDialogAction("contactar al vendedor")
        setIsAuthDialogOpen(true)
        return
      }

      console.log(`[v0] Tracking click: ${type}`, {
        productId: product.id,
        sellerId: (product as any).vendorId
      })

      // Standard contact tracking
      await fetch("/api/products/track-contact-click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        keepalive: true,
        body: JSON.stringify({
          productId: product.id,
          productTitle: product.name,
          sellerId: (product as any).vendorId,
          clickType: type,
          userId: session.user.id
        })
      })

      // User activity tracking
      trackActivity('click', `Contacto vía ${type}: ${product.name}`, { 
        productId: product.id, 
        type 
      })

    } catch (error) {
      console.error("Error tracking contact click:", error)
    }
  }

  const handleBuy = () => {
    if (!currentUserId) {
      setAuthDialogAction("comprar este producto")
      setIsAuthDialogOpen(true)
      return
    }
    
    // Track initiation of purchase
    trackActivity('click', `Inició proceso de compra: ${product.name}`, { productId: product.id })
    
    // Redirect to purchase flow
    router.push(`/compra/${slug}`)
  }

  const handleQuotationSubmit = async () => {
    if (!product) return
    
    setIsSubmittingQuotation(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch("/api/products/submit-quotation", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(session ? { Authorization: `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          sellerId: (product as any).vendorId,
          buyerId: currentUserId,
          ...quotationForm
        })
      })

      const result = await response.json()
      if (response.ok) {
        setQuotationSuccess(true)
        trackActivity('click', `Cotización enviada: ${product.name}`, { productId: product.id })
        
        // Reset form but keep contact info
        setQuotationForm(prev => ({
          ...prev,
          quantity: "",
          destinationCountry: "",
          estimatedDate: "",
          notes: "",
          targetPrice: "",
          incoterm: "",
          currency: "USD",
          containerSize: ""
        }))
      } else {
        console.error("Error Response:", result)
        const detailedError = result.details || result.error || "Error al enviar la cotización"
        alert(detailedError)
      }
    } catch (error) {
      console.error("Error submitting quotation:", error)
      alert("Error al enviar la cotización. Revisa tu conexión e intenta de nuevo.")
    } finally {
      setIsSubmittingQuotation(false)
    }
  }

  if (!product) return null

  const specificContactButton = (className: string) => {
    const contactMethod = (product as any).contactMethod
    const contactInfo = (product as any).contactInfo
    const countryCode = (product as any).countryCode
    const phoneNumber = (product as any).phoneNumber

    if (contactMethod === "WhatsApp" && countryCode && phoneNumber) {
      const message = encodeURIComponent(`Hola vi tu producto "${product.name}" en la plataforma Agrilpa, y estoy interesado.`)
      return (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!currentUserId) {
              setAuthDialogAction("contactar al vendedor")
              setIsAuthDialogOpen(true)
            } else {
              window.open(`https://wa.me/${countryCode}${phoneNumber}?text=${message}`, '_blank')
              trackContactClick("whatsapp")
            }
          }}
          className={`flex items-center justify-center gap-2 text-sm border-2 border-slate-900 bg-slate-900 text-white hover:opacity-90 font-semibold rounded-lg transition-all duration-200 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:opacity-90 ${className}`}
        >
          <MessageCircle className="w-5 h-5" />
          Contactar Vendedor
        </button>
      )
    } else if (contactMethod === "Email" && contactInfo) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!currentUserId) {
              setAuthDialogAction("contactar al vendedor")
              setIsAuthDialogOpen(true)
            } else {
              window.open(`mailto:${contactInfo}`, '_blank')
              trackContactClick("email")
            }
          }}
          className={`flex items-center justify-center gap-2 text-sm border-2 border-slate-900 bg-slate-900 text-white hover:opacity-90 font-semibold rounded-lg transition-all duration-200 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:opacity-90 ${className}`}
        >
          <FileText className="w-5 h-5" />
          Contactar Vendedor
        </button>
      )
    } else if (contactMethod === "Telegram" && contactInfo) {
      return (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!currentUserId) {
              setAuthDialogAction("contactar al vendedor")
              setIsAuthDialogOpen(true)
            } else {
              window.open(`https://t.me/${contactInfo}`, '_blank')
              trackContactClick("telegram")
            }
          }}
          className={`flex items-center justify-center gap-2 text-sm border-2 border-slate-900 bg-slate-900 text-white hover:opacity-90 font-semibold rounded-lg transition-all duration-200 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:opacity-90 ${className}`}
        >
          <FileText className="w-5 h-5" />
          Contactar Vendedor
        </button>
      )
    }
    return (
      <button
        onClick={handleContactVendor}
        className={`border-2 border-slate-900 bg-slate-900 text-white hover:opacity-90 flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:opacity-90 ${className}`}
      >
        <MessageCircle className="w-5 h-5" />
        Contactar Vendedor
      </button>
    )
  }

  const genericContactButton = (className: string, variant: "primary" | "secondary" = "primary") => {
    const baseClass = variant === "primary"
      ? "bg-primary hover:bg-primary/90 text-white border-transparent"
      : "bg-secondary hover:bg-secondary/90 text-foreground border border-border"

    const contactMethod = (product as any).contactMethod
    let buttonText = "Contactar Vendedor"
    if (contactMethod === "WhatsApp" || contactMethod === "Telegram") {
      buttonText = "Mandar mensaje"
    } else if (contactMethod === "Email") {
      buttonText = "Mandar correo"
    }

    return (
      <Button
        onClick={handleContactVendor}
        className={`w-full flex items-center justify-center gap-2 ${baseClass} ${className}`}
      >
        <MessageCircle className="w-5 h-5" />
        {buttonText}
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/productos">
          <button className="flex items-center gap-2 text-primary hover:underline mb-8 font-medium">
            <ChevronLeft className="w-4 h-4" />
            Volver al catálogo
          </button>
        </Link>

        <ProductHero
          product={product}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          setIsZoomOpen={setIsZoomOpen}
          currentUserId={currentUserId}
          handleBuy={handleBuy}
          specificContactButton={specificContactButton}
          setAuthDialogAction={setAuthDialogAction}
          setIsAuthDialogOpen={setIsAuthDialogOpen}
          setIsQuotationDialogOpen={setIsQuotationDialogOpen}
        />

        <div className="mb-16">
          <Card className="bg-card border border-border p-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Descripción del Producto</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{product.fullDescription?.split("---")[0]}</p>
          </Card>
        </div>

        {(product as any).certifications && (
          <div className="mb-16">
            <Card className="bg-card border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Certificaciones</h2>
              <div className="flex flex-wrap gap-2">
                {(product as any).certifications.split(/[\n,]/).map((cert: string, index: number) => {
                  const cleanedCert = cert.trim()
                  if (!cleanedCert) return null
                  return (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Check className="w-3 h-3 mr-1" />
                      {cleanedCert}
                    </span>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {(product as any).incoterm && (() => {
          const incotermValue = (product as any).incoterm as string;
          const incotermsMeaning: Record<string, string> = {
            "EXW": "En Fábrica",
            "FCA": "Libre Transportista",
            "FAS": "Libre al Costado del Buque",
            "FOB": "Libre a Bordo",
            "CFR": "Costo y Flete",
            "CIF": "Costo, Seguro y Flete",
            "CPT": "Transporte Pagado Hasta",
            "CIP": "Transporte y Seguro Pagados Hasta",
            "DAP": "Entregado en Lugar",
            "DPU": "Entregado en Lugar Descargado",
            "DDP": "Entregado Derechos Pagados",
          };
          const matchKey = Object.keys(incotermsMeaning).find(key => incotermValue.toUpperCase().includes(key));
          const meaning = matchKey ? incotermsMeaning[matchKey] : null;

          return (
            <div className="mb-16">
              <Card className="bg-card border border-border p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">Condiciones de Entrega (Incoterm)</h2>
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                    <Package className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xl font-bold text-foreground">{incotermValue}</p>
                      {meaning && (
                        <span className="text-lg font-medium text-muted-foreground">
                          — {meaning}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                      *El Incoterm determina quién asume los costos y riesgos del transporte, seguros y trámites aduaneros entre el comprador y el vendedor durante la entrega.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          );
        })()}

        {/* Alcance Comercial */}
        {(product as any).alcance_comercial && (product as any).alcance_comercial.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Alcance Comercial</h2>
            <div className="flex flex-wrap gap-3">
              {(product as any).alcance_comercial.map((alcance: string, index: number) => (
                <div key={index} className="flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-full font-medium shadow-sm">
                  <Globe className="w-4 h-4" />
                  <span>{alcance}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {product.specifications && product.specifications.length > 0 && (
          <div className="mb-16">
            <Card className="bg-card border border-border p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Especificaciones</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                {[...product.specifications].sort((a: any, b: any) => {
                  if (a.label === "Vendedor") return -1;
                  if (b.label === "Vendedor") return 1;
                  return 0;
                }).map((spec: any, index: number) => (
                  <div key={index} className="border-b border-border pb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{spec.label}</p>
                    <p className="text-base font-semibold text-foreground">{spec.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Reseñas Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">Reseñas de Compradores</h2>
          {product.reviewsData && product.reviewsData.length > 0 ? (
            <div className="space-y-4">
              {product.reviewsData.map((review: any) => (
                <Card key={review.id} className="p-6 bg-card border border-border shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {review.buyer_name ? review.buyer_name.substring(0, 2).toUpperCase() : "US"}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{review.buyer_name || "Comprador Anónimo"}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-4 text-muted-foreground italic">"{review.comment}"</p>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-card border border-border">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground text-lg">Este producto aún no tiene reseñas.</p>
              <p className="text-sm text-muted-foreground mt-1">Las reseñas son dejadas por compradores verificados después de recibir su pedido.</p>
            </Card>
          )}
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">{relatedTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link key={relProduct.id} href={`/producto/${relProduct.slug}`}>
                  <Card className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer flex flex-col h-full p-0 gap-0 group">
                    {/* Image Section */}
                    <div className="relative h-52 w-full shrink-0 overflow-hidden bg-slate-100">
                      <img
                        src={relProduct.image || "/placeholder.svg"}
                        alt={relProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        {/* Category Pill */}
                        <div className="bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2.5 h-6 flex items-center justify-center rounded-full shadow-sm leading-none">
                          {relProduct.category}
                        </div>
                        
                        {/* Verified Pill */}
                        {(relProduct.verified || (relProduct as any).sellerIsPro) && (
                          <div className="bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 h-6 flex items-center justify-center gap-1 rounded-full shadow-sm leading-none">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Verificado
                          </div>
                        )}
                      </div>

                      {/* Bottom Image Info (Rating) */}
                      <div className="absolute bottom-3 left-4 right-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-white text-xs font-semibold">{relProduct.rating || "Nuevo"}</span>
                          </div>
                          {relProduct.reviews > 0 && (
                            <span className="text-white/90 text-xs font-medium drop-shadow-sm">{relProduct.reviews} reseñas</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Product Title & Location */}
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-foreground leading-tight mb-1 line-clamp-2">{relProduct.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{relProduct.location}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1 leading-relaxed">
                        {relProduct.description?.split("---")[0]}
                      </p>

                      <hr className="border-t border-dashed border-border mb-3" />

                      {/* Pricing & Minimum Order */}
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Desde</p>
                          <div className="flex items-baseline gap-1">
                            {relProduct.price === "Por Cotizar" ? (
                              <span className="text-lg font-bold text-foreground">Por Cotizar</span>
                            ) : (
                              <>
                                <span className="text-xl font-bold text-foreground">
                                  {relProduct.price?.includes('$') ? relProduct.price : `$${relProduct.price}`}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground"> /kg</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Pedido Mín.</p>
                          <p className="text-base font-semibold text-foreground">
                            {relProduct.minOrder?.replace(/[^0-9.,]/g, '') || relProduct.minOrder}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {isChatOpen && (
        <ChatOverlay
          vendorName={product.producer}
          vendorId={product.vendorId}
          productName={product.name}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 p-3 rounded-full mb-2">
              {(product as any).contactMethod === "WhatsApp" ? (
                <MessageCircle className="w-8 h-8 text-primary" />
              ) : (
                <FileText className="w-8 h-8 text-primary" />
              )}
            </div>
            <DialogTitle className="text-xl">
              {(product as any).contactMethod === "WhatsApp" ? "Contactar por WhatsApp" : "Información de Contacto"}
            </DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Contáctate con el vendedor por medio de <span className="font-bold text-foreground mx-1">{(product as any).contactMethod || "Contacto Directo"}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
            {(product as any).contactMethod === "WhatsApp" && (product as any).countryCode && (product as any).phoneNumber ? (
              <>
                <div className="bg-muted p-4 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Número de Teléfono</p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    +{(product as any).countryCode} {(product as any).phoneNumber}
                  </p>
                </div>

                <div className="grid gap-3">
                  <Button
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 h-12 text-lg font-semibold shadow-md transition-all hover:scale-[1.02]"
                    onClick={() => {
                      const message = encodeURIComponent(`Hola vi tu producto "${product.name}" en la plataforma Agrilpa, y estoy interesado.`)
                      window.open(`https://wa.me/${(product as any).countryCode}${(product as any).phoneNumber}?text=${message}`, '_blank')
                      trackContactClick("whatsapp")
                    }}
                  >
                    <MessageCircle className="w-6 h-6" />
                    Enviar mensaje ahora
                  </Button>

                  <Button
                    variant="secondary"
                    className="w-full gap-2 h-10"
                    onClick={() => {
                      navigator.clipboard.writeText(`+${(product as any).countryCode}${(product as any).phoneNumber}`)
                      alert("Número copiado al portapapeles")
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    Copiar número
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-muted p-4 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">
                    {(product as any).contactMethod === "Email" ? "Correo Electrónico" :
                      (product as any).contactMethod === "WeChat" ? "ID de WeChat" :
                        (product as any).contactMethod === "Telegram" ? "Usuario de Telegram" :
                          "Información"}
                  </p>
                  <p className="text-xl font-bold tracking-tight text-foreground break-all">
                    {(product as any).contactInfo}
                  </p>
                </div>

                <div className="grid gap-3">
                  {(product as any).contactMethod === "Email" ? (
                    <Button
                      className="w-full h-12 text-lg font-semibold shadow-md transition-all hover:scale-[1.02]"
                      onClick={() => {
                        window.open(`mailto:${(product as any).contactInfo}`, '_blank')
                        trackContactClick("email")
                      }}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Enviar Correo
                    </Button>
                  ) : (product as any).contactMethod === "Telegram" ? (
                    <Button
                      className="w-full bg-[#0088cc] hover:bg-[#007dbd] text-white h-12 text-lg font-semibold shadow-md transition-all hover:scale-[1.02]"
                      onClick={() => {
                        window.open(`https://t.me/${(product as any).contactInfo}`, '_blank')
                        trackContactClick("telegram")
                      }}
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Abrir Telegram
                    </Button>
                  ) : null}

                  <Button
                    variant={(product as any).contactMethod === "Email" || (product as any).contactMethod === "Telegram" ? "secondary" : "default"}
                    className={`w-full gap-2 h-10 ${(product as any).contactMethod !== "Email" && (product as any).contactMethod !== "Telegram" ? "h-12 text-lg" : ""}`}
                    onClick={() => {
                      navigator.clipboard.writeText((product as any).contactInfo)
                      alert("Copiado al portapapeles")
                    }}
                  >
                    <Copy className="w-4 h-4" />
                    Copiar {(product as any).contactMethod === "Email" ? "Correo" : "Usuario"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent >
      </Dialog >

      {/* Quotation Dialog */}
      <Dialog open={isQuotationDialogOpen} onOpenChange={(open) => {
        setIsQuotationDialogOpen(open)
        if (!open) setQuotationSuccess(false)
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {quotationSuccess ? (
            /* Success Screen */
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                ¡Cotización Enviada!
              </h2>
              <p className="text-lg text-muted-foreground mb-2">
                Tu solicitud ha sido enviada exitosamente al vendedor.
              </p>
              <p className="text-muted-foreground mb-8">
                El vendedor se pondrá en contacto contigo pronto.
              </p>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-md mx-auto mb-8">
                <h3 className="font-semibold mb-3 flex items-center justify-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Resumen de tu solicitud
                </h3>
                <div className="flex gap-4 justify-center items-center">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="text-left">
                    <p className="font-bold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsQuotationDialogOpen(false)
                    setQuotationSuccess(false)
                  }}
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => router.push("/productos")}
                >
                  Ver más productos
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Solicitar Cotización</DialogTitle>
                <DialogDescription>
                  Completa el formulario para solicitar una cotización de este producto
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Product Info Section */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Información del Producto
                  </h3>
                  <div className="flex flex-row-reverse gap-6">
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-border flex-shrink-0">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-xl mb-1">{product.name}</p>
                      <span className="inline-block text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded mb-3">
                        {product.category}
                      </span>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="bg-background rounded-md p-2 border border-border">
                          <p className="text-xs text-muted-foreground">Pedido mín</p>
                          <p className="font-semibold">{product.minOrder} kg</p>
                        </div>
                        <div className="bg-background rounded-md p-2 border border-border">
                          <p className="text-xs text-muted-foreground">Embalaje</p>
                          <p className="font-semibold">{product.packaging}</p>
                        </div>
                        <div className="bg-background rounded-md p-2 border border-border">
                          <p className="text-xs text-muted-foreground">Origen</p>
                          <p className="font-semibold">{product.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buyer Info Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Tu Información</h3>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Tu nombre o nombre de tu empresa"
                      value={quotationForm.buyerName}
                      onChange={(e) => setQuotationForm({ ...quotationForm, buyerName: e.target.value })}
                      readOnly={!!quotationForm.buyerName}
                      className={quotationForm.buyerName ? "bg-muted cursor-not-allowed" : ""}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Medio de Contacto <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={quotationForm.contactMethod}
                      onChange={(e) => setQuotationForm({ ...quotationForm, contactMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    >
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Email">Email</option>
                    </select>
                  </div>

                  {quotationForm.contactMethod === "WhatsApp" ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-2">Código</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-md text-sm text-muted-foreground">
                            +
                          </span>
                          <Input
                            className="rounded-l-none"
                            placeholder="503"
                            type="number"
                            value={quotationForm.countryCode}
                            onChange={(e) => setQuotationForm({ ...quotationForm, countryCode: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2">Número de Teléfono</label>
                        <Input
                          placeholder="0000 0000"
                          type="number"
                          value={quotationForm.phoneNumber}
                          onChange={(e) => setQuotationForm({ ...quotationForm, phoneNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Correo Electrónico <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={quotationForm.email}
                        onChange={(e) => setQuotationForm({ ...quotationForm, email: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Order Details Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Detalles de tu Pedido</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {product.shippingUnitType === "FCL" ? "Cantidad (Contenedores)" : "Cantidad (kg)"} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder={product.shippingUnitType === "FCL" ? "Ej: 1" : "Ej: 500"}
                        min="1"
                        value={quotationForm.quantity}
                        onChange={(e) => setQuotationForm({ ...quotationForm, quantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {product.shippingUnitType === "FCL" ? "Tipo de Contenedor" : "País de Destino"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={product.shippingUnitType === "FCL" ? (quotationForm.containerSize || product.containerSize || "20ST") : quotationForm.destinationCountry}
                        onChange={(e) => {
                          if (product.shippingUnitType === "FCL") {
                            setQuotationForm({ ...quotationForm, containerSize: e.target.value })
                          } else {
                            setQuotationForm({ ...quotationForm, destinationCountry: e.target.value })
                          }
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        {product.shippingUnitType === "FCL" ? (
                          <>
                            <option value="20ST">20&apos; Standard (~21 TM)</option>
                            <option value="40HC">40&apos; High Cube (~26 TM)</option>
                          </>
                        ) : (
                          <>
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
                        <option value="Otro">Otro</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  {product.shippingUnitType === "FCL" && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-primary font-semibold">
                        País de Destino <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={quotationForm.destinationCountry}
                        onChange={(e) => setQuotationForm({ ...quotationForm, destinationCountry: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background h-10 mb-4"
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
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  )}



                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Fecha Estimada de Entrega <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={quotationForm.estimatedDate}
                      onChange={(e) => setQuotationForm({ ...quotationForm, estimatedDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Notas Adicionales <span className="text-xs text-muted-foreground">(Opcional)</span>
                    </label>
                    <Textarea
                      placeholder="Cualquier información adicional que quieras compartir con el vendedor..."
                      rows={3}
                      value={quotationForm.notes}
                      onChange={(e) => setQuotationForm({ ...quotationForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                {/* Commercial Conditions Section */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Condiciones comerciales (opcional)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium min-h-[2.5rem] flex items-end pb-1">
                        Presupuesto objetivo por kg (opcional)
                      </label>
                      <div className="flex gap-2">
                        <select
                          className="bg-background border border-border h-10 w-24 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={quotationForm.currency}
                          onChange={(e) => setQuotationForm({ ...quotationForm, currency: e.target.value })}
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="MXN">MXN</option>
                          <option value="BRL">BRL</option>
                          <option value="COP">COP</option>
                        </select>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                          <Input
                            type="number"
                            placeholder="Ej: 1.20"
                            className="pl-7 bg-white"
                            value={quotationForm.targetPrice}
                            onChange={(e) => setQuotationForm({ ...quotationForm, targetPrice: e.target.value })}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Precio aproximado que estás dispuesto a pagar por cada kg. No es un compromiso.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium min-h-[2.5rem] flex items-end pb-1">
                        Incoterm preferido
                      </label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={quotationForm.incoterm}
                        onChange={(e) => setQuotationForm({ ...quotationForm, incoterm: e.target.value })}
                      >
                        <option value="">No definido (a acordar)</option>
                        <option value="EXW">EXW – En origen</option>
                        <option value="FOB">FOB – Entregado en puerto de origen</option>
                        <option value="CIF">CIF – Incluye transporte y seguro</option>
                        <option value="DAP">DAP – Entregado en tu país</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Define hasta dónde llega la responsabilidad del vendedor en el envío.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 hover:bg-red-600 hover:text-white hover:border-red-600"
                    onClick={() => setIsQuotationDialogOpen(false)}
                    disabled={isSubmittingQuotation}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleQuotationSubmit}
                    disabled={isSubmittingQuotation}
                  >
                    {isSubmittingQuotation ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Enviar Cotización
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Auth Guard Dialog */}
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="flex flex-col items-center gap-2">
            <div className="bg-primary/10 p-3 rounded-full mb-2">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-xl">Inicia sesión requerida</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Para {authDialogAction}, primero debes iniciar sesión o registrarte en Agrilpa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 mt-2">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg font-semibold"
              onClick={() => router.push("/auth")}
            >
              Iniciar sesión
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 text-lg font-semibold"
              onClick={() => router.push("/auth")}
            >
              Registrarse
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Zoom Dialog - Ultra Large */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-[98vw] h-[98vh] p-0 overflow-hidden bg-black/95 border-none flex flex-col">
          <div className="relative flex-1 w-full h-full overflow-auto flex items-center justify-center p-4 custom-scrollbar">
            <img
              src={selectedImage || product.image || "/placeholder.svg"}
              alt={product.name}
              className="min-w-[100%] md:min-w-[150%] h-auto object-contain cursor-zoom-out"
              onClick={() => setIsZoomOpen(false)}
            />
          </div>
          <div className="absolute top-4 right-4 z-50">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setIsZoomOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
