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
import { Star, MapPin, MessageCircle, Check, ChevronLeft, FileText, ShoppingCart, Copy, Calendar, Package, Loader } from "lucide-react"
import { getProductBySlug, getProductsByCategory } from "@/lib/products-data"
import { createClient } from "@/lib/supabase/client"

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
                buyerName: resData.user.full_name || "",
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
  const [isChatOpen, setIsChatOpen] = useState(false)
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
    currency: "USD"
  })

  // Fetch user product if slug is a UUID
  useEffect(() => {
    console.log('=== PRODUCT PAGE LOADED ===')
    console.log('Slug:', slug)
    console.log('isValidId:', isValidId(slug))
    console.log('staticProduct:', !!staticProduct)

    window.scrollTo(0, 0)

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
              .then(result => console.log('View increment result:', result))
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
              rating: 4.5,
              reviews: 0,
              views: data.product.views || 0,
              image: data.product.image || "/placeholder.svg",
              verified: false,
              slug: data.product.id,
              packaging: data.product.packaging,
              packagingSize: `${data.product.packaging_size} kg`,
              contactMethod: data.product.contact_method || contactMethod,
              contactInfo: data.product.contact_info || contactInfo,
              countryCode: data.product.country_code,
              phoneNumber: data.product.phone_number,
              incoterm: extractedIncoterm,
              specifications: [
                { label: "Origen", value: data.product.country },
                { label: "Categoría", value: data.product.category },
                { label: "Embalaje", value: data.product.packaging },
                { label: "Tamaño Embalaje", value: `${data.product.packaging_size} kg` },
                { label: "Vendedor", value: producerName },
              ],
              certifications: data.product.certifications || null
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

  const relatedProducts = getProductsByCategory(product?.category || "")
    .filter((p) => p.id !== product?.id)
    .slice(0, 3)

  const handleContactVendor = () => {
    const contactMethod = (product as any).contactMethod
    const contactInfo = (product as any).contactInfo
    const countryCode = (product as any).countryCode
    const phoneNumber = (product as any).phoneNumber

    if ((contactMethod === "WhatsApp" && countryCode && phoneNumber) || (contactMethod && contactInfo)) {
      setIsContactDialogOpen(true)
    } else {
      // Fallback to chat overlay for static products with no specific contact info
      setIsChatOpen(true)
    }
  }

  const handleBuy = () => {
    router.push(`/compra/${slug}`)
  }

  const handleQuotationSubmit = async () => {
    if (!quotationForm.buyerName || !quotationForm.quantity || !quotationForm.destinationCountry || !quotationForm.estimatedDate) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    if (quotationForm.contactMethod === "WhatsApp" && (!quotationForm.countryCode || !quotationForm.phoneNumber)) {
      alert("Por favor ingresa tu código de país y número de teléfono")
      return
    }

    if (quotationForm.contactMethod === "Email" && !quotationForm.email) {
      alert("Por favor ingresa tu correo electrónico")
      return
    }

    const productId = product.id
    const sellerId = (product as any).vendorId

    if (!productId || !sellerId) {
      console.error("Missing product or seller information:", { productId, sellerId })
      alert("Error: No se pudo identificar el producto o el vendedor. Por favor refresca la página.")
      return
    }

    setIsSubmittingQuotation(true)

    try {
      const payload = {
        productId,
        productTitle: product.name,
        productImage: product.image,
        sellerId,
        buyerName: quotationForm.buyerName,
        contactMethod: quotationForm.contactMethod,
        countryCode: quotationForm.countryCode,
        phoneNumber: quotationForm.phoneNumber,
        email: quotationForm.email,
        quantity: quotationForm.quantity,
        destinationCountry: quotationForm.destinationCountry,
        estimatedDate: quotationForm.estimatedDate,
        notes: quotationForm.notes,
        targetPrice: quotationForm.targetPrice,
        incoterm: quotationForm.incoterm,
        currency: quotationForm.currency,
        buyerId: currentUserId
      }

      console.log("=== SENDING QUOTATION ===")
      console.log("Payload:", payload)

      // Detailed check before sending
      const missingInPayload = Object.entries(payload)
        .filter(([key, value]) => {
          // Fields required by API
          const required = ["productId", "sellerId", "buyerName", "quantity", "destinationCountry", "estimatedDate"]
          return required.includes(key) && !value
        })
        .map(([key]) => key)

      if (missingInPayload.length > 0) {
        console.error("Missing fields in payload:", missingInPayload)
        alert(`Error: Faltan datos obligatorios: ${missingInPayload.join(", ")}`)
        setIsSubmittingQuotation(false)
        return
      }

      const apiUrl = '/api/quotations/create'
      console.log(`Hitting API: ${apiUrl}`)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        setQuotationSuccess(true)
        setQuotationForm({
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
          currency: "USD"
        })
      } else {
        console.error("Error Response:", result)
        const detailedError = `[URL: ${apiUrl}] ${result.error || "Error desconocido"}` +
          (result.details ? `\nDetalles: ${result.details}` : "") +
          (result.missingFields ? `\nFaltan: ${result.missingFields.join(", ")}` : "")

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

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/productos">
          <button className="flex items-center gap-2 text-primary hover:underline mb-8 font-medium">
            <ChevronLeft className="w-4 h-4" />
            Volver al catálogo
          </button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg overflow-hidden h-96 flex items-center justify-center">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">{product.name}</h1>
                  <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                {product.verified && (
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Verificado
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-foreground ml-2">{product.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reseñas)</span>
            </div>

            <Card className="bg-primary/5 border border-primary/20 p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Productor</p>
                  <p className="text-lg font-bold text-foreground">{product.producer}</p>
                </div>
                {(product as any).contactMethod === "WhatsApp" && (product as any).countryCode && (product as any).phoneNumber ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Contactar por WhatsApp</p>
                    <a
                      href={`https://api.whatsapp.com/send?phone=${(product as any).countryCode}${(product as any).phoneNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-md transition-colors w-full justify-center"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Mandar mensaje
                    </a>
                  </div>
                ) : (product as any).contactMethod === "Email" && (product as any).contactInfo ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Contactar por Correo</p>
                    <a
                      href={`mailto:${(product as any).contactInfo}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors w-full justify-center"
                    >
                      <FileText className="w-4 h-4" />
                      Mandar correo
                    </a>
                  </div>
                ) : (product as any).contactMethod === "Telegram" && (product as any).contactInfo ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Contactar por Telegram</p>
                    <a
                      href={`https://t.me/${(product as any).contactInfo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#007dbd] text-white font-semibold rounded-md transition-colors w-full justify-center"
                    >
                      <FileText className="w-4 h-4" />
                      Mandar mensaje
                    </a>
                  </div>
                ) : (product as any).contactMethod && (product as any).contactInfo ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Contacto ({(product as any).contactMethod})
                    </p>
                    <p className="text-lg font-bold text-foreground overflow-hidden text-ellipsis">
                      {(product as any).contactInfo}
                    </p>
                  </div>
                ) : null}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <p className="text-sm">{product.location}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-primary/10 border border-primary/30 p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Precio</p>
                  <p className="text-2xl font-bold text-primary">
                    {product.price === "Por Cotizar" ? "Por Cotizar" : (product.price?.includes('$') ? product.price : `$${product.price}`)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">por kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Pedido mínimo</p>
                  <p className="text-2xl font-bold text-foreground">{product.minOrder}</p>
                  <p className="text-xs text-muted-foreground mt-1">kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tipo de Embalaje</p>
                  <p className="text-lg font-bold text-foreground">{product.packaging}</p>
                  <p className="text-xs text-muted-foreground mt-1">tipo de empaque</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tamaño de Embalaje</p>
                  <p className="text-lg font-bold text-foreground">{product.packagingSize}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-semibold text-primary">kg</span> por embalaje
                  </p>
                </div>
              </div>

              {/* Owner Check Logic */}
              {currentUserId && (product as any).vendorId === currentUserId ? (
                <div className="space-y-3">
                  <Button
                    disabled
                    className="w-full bg-muted text-muted-foreground py-6 flex items-center justify-center gap-2 cursor-not-allowed border border-border"
                  >
                    <Package className="w-5 h-5" />
                    Este es tu producto
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    No puedes comprar ni cotizar tus propios productos.
                  </p>
                </div>
              ) : (
                <>
                  {product.price === "Por Cotizar" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={() => setIsQuotationDialogOpen(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-6 flex items-center justify-center gap-2"
                      >
                        <FileText className="w-5 h-5" />
                        Solicitar Cotización
                      </Button>
                      <Button
                        onClick={handleContactVendor}
                        className="w-full bg-secondary hover:bg-secondary/90 text-foreground py-6 flex items-center justify-center gap-2 border border-border"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Contactar Vendedor
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Button
                        onClick={handleBuy}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-6 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Comprar
                      </Button>
                      <Button
                        onClick={handleContactVendor}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-6 flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Contactar Vendedor
                      </Button>
                      <Button
                        onClick={() => setIsQuotationDialogOpen(true)}
                        className="w-full bg-secondary hover:bg-secondary/90 text-foreground py-6 flex items-center justify-center gap-2 border border-border"
                      >
                        <FileText className="w-5 h-5" />
                        Solicitar Cotización
                      </Button>
                    </div>
                  )}
                </>
              )}
              <p className="text-xs text-muted-foreground text-center pt-2">
                Para realizar una cotización o compra, necesitas ser un usuario verificado
              </p>
            </Card>
          </div>
        </div>

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

        {(product as any).incoterm && (
          <div className="mb-16">
            <Card className="bg-card border border-border p-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">Incoterm</h2>
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{(product as any).incoterm}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Define hasta dónde llega la responsabilidad del vendedor en el envío
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic border-t border-border pt-4">
                * Este valor es referencial y puede ajustarse con el comprador.
              </p>
            </Card>
          </div>
        )}

        {product.specifications && product.specifications.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Especificaciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {product.specifications.map((spec: any, index: number) => (
                <Card key={index} className="bg-card border border-border p-6">
                  <p className="text-sm text-muted-foreground mb-2">{spec.label}</p>
                  <p className="font-semibold text-foreground">{spec.value}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProducts.map((relProduct) => (
                <Link key={relProduct.id} href={`/producto/${relProduct.slug}`}>
                  <Card className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 h-40 flex items-center justify-center overflow-hidden">
                      <img
                        src={relProduct.image || "/placeholder.svg"}
                        alt={relProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-foreground mb-2">{relProduct.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 flex-1">{relProduct.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">
                          {relProduct.price?.includes('$') ? relProduct.price : `$${relProduct.price}`}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{relProduct.rating}</span>
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
                      const message = encodeURIComponent(`Hola, estoy interesado en su producto "${product.name}" publicado en Agrilpa.`)
                      window.open(`https://api.whatsapp.com/send?phone=${(product as any).countryCode}${(product as any).phoneNumber}&text=${message}`, '_blank')
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
                        Cantidad (kg) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        placeholder="Ej: 500"
                        min="1"
                        value={quotationForm.quantity}
                        onChange={(e) => setQuotationForm({ ...quotationForm, quantity: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        País de Destino <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={quotationForm.destinationCountry}
                        onChange={(e) => setQuotationForm({ ...quotationForm, destinationCountry: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        <option value="">Selecciona un país</option>
                        <option value="Estados Unidos">Estados Unidos</option>
                        <option value="Canadá">Canadá</option>
                        <option value="México">México</option>
                        <option value="El Salvador">El Salvador</option>
                        <option value="Guatemala">Guatemala</option>
                        <option value="Honduras">Honduras</option>
                        <option value="Nicaragua">Nicaragua</option>
                        <option value="Costa Rica">Costa Rica</option>
                        <option value="Panamá">Panamá</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Perú">Perú</option>
                        <option value="Ecuador">Ecuador</option>
                        <option value="Unión Europea">Unión Europea</option>
                        <option value="Reino Unido">Reino Unido</option>
                        <option value="Japón">Japón</option>
                        <option value="China">China</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>

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
    </div >
  )
}
