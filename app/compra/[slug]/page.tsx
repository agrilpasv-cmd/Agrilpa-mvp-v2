"use client"

import type React from "react"

import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RatingOverlay } from "@/components/rating-overlay"
import { ChevronLeft, Package, MapPin, CreditCard, Truck, Plane, Ship, CheckCircle, Phone } from "lucide-react"
import { getProductBySlug } from "@/lib/products-data"

const TAX_RATES: Record<string, number> = {
  México: 0.16,
  "Estados Unidos": 0.1,
  Canadá: 0.13,
  España: 0.21,
  Colombia: 0.19,
  Argentina: 0.21,
  Chile: 0.19,
  Perú: 0.18,
  Brasil: 0.17,
  Otro: 0.15,
}

const SHIPPING_COSTS: Record<string, number> = {
  avion: 150,
  barco: 80,
}

// Helper function to check if a string is a valid UUID or numeric ID
const isValidId = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const numberRegex = /^\d+$/
  return uuidRegex.test(str) || numberRegex.test(str)
}

export default function PurchasePage() {
  const params = useParams()
  const slug = typeof params?.slug === "string" ? params.slug : ""

  // State for products
  const staticProduct = getProductBySlug(slug)
  const [userProduct, setUserProduct] = useState<any>(null)

  // Determine if we need to fetch: Valid ID and not a static product
  const shouldFetch = isValidId(slug) && !staticProduct
  const [isLoading, setIsLoading] = useState(shouldFetch)

  const [kg, setKg] = useState(100)
  const [purchaseCompleted, setPurchaseCompleted] = useState(false)
  const [isRatingOpen, setIsRatingOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "", // split phone into countryCode and phoneNumber
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "México",
    shippingMethod: "barco",
    paymentMethod: "transferencia",
    specialInstructions: "",
  })

  useEffect(() => {
    window.scrollTo(0, 0)

    if (isValidId(slug) && !staticProduct) {
      setIsLoading(true)
      fetch(`/api/products/get-user-product-by-id?id=${slug}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.product) {
            // Transform user product to match static product structure
            const transformed = {
              id: data.product.id,
              name: data.product.title,
              category: data.product.category,
              producer: "Productor Local", // Default or extract from desc
              location: data.product.country,
              country: data.product.country,
              description: data.product.description,
              fullDescription: data.product.description,
              price: data.product.price,
              minOrder: data.product.min_order,
              rating: 4.5,
              reviews: 0,
              image: data.product.image || "/placeholder.svg",
              verified: false,
              slug: data.product.id,
            }
            setUserProduct(transformed)
          }
        })
        .finally(() => setIsLoading(false))
    }
  }, [slug])

  useEffect(() => {
    if (purchaseCompleted) {
      window.scrollTo(0, 0)
    }
  }, [purchaseCompleted])

  // Determine which product to display
  const product = staticProduct || userProduct

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!product && slug) {
    // only 404 if done loading and no product
    if (!isLoading) notFound()
  }

  if (!product) return null

  const pricePerUnit = Number.parseFloat((product.price || "0").replace(/[^0-9.]/g, "")) || 0
  const subtotal = pricePerUnit * kg
  const shippingCost = SHIPPING_COSTS[formData.shippingMethod]
  const taxRate = TAX_RATES[formData.country] || 0.15
  const taxAmount = subtotal * taxRate
  const totalPrice = subtotal + shippingCost + taxAmount

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const numericValue = value.replace(/[^\d]/g, "")
    setFormData({
      ...formData,
      [name]: numericValue,
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/purchase/save-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          productSlug: slug,
          quantityKg: kg,
          priceUsd: totalPrice,
          fullName: formData.fullName,
          email: formData.email,
          countryCode: formData.countryCode,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          shippingMethod: formData.shippingMethod,
          paymentMethod: formData.paymentMethod,
          specialInstructions: formData.specialInstructions,
        }),
      })

      if (!response.ok) {
        console.error("[v0] Failed to save purchase")
      }
    } catch (error) {
      console.error("[v0] Purchase save error:", error)
    }

    setPurchaseCompleted(true)
    setTimeout(() => {
      setIsRatingOpen(true)
    }, 1000)
  }

  if (purchaseCompleted) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="bg-card border border-border p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">¡Solicitud de Compra Realizada con Éxito!</h1>

            <p className="text-muted-foreground mb-6">
              Tu solicitud de compra de{" "}
              <strong>
                {kg} kg de {product.name}
              </strong>{" "}
              ha sido procesada correctamente.
            </p>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
              <div className="space-y-3 text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total pagado:</span>
                  <span className="font-bold text-primary text-xl">${totalPrice.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de pago:</span>
                  <span className="font-medium">
                    {formData.paymentMethod === "transferencia" && "Transferencia bancaria"}
                    {formData.paymentMethod === "carta-credito" && "Carta de crédito"}
                    {formData.paymentMethod === "credito" && "Crédito comercial"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Método de envío:</span>
                  <span className="font-medium">
                    {formData.shippingMethod === "barco" ? "Envío por Barco" : "Envío por Avión"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destino:</span>
                  <span className="font-medium">{formData.country}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-900">
                <strong>Próximos pasos:</strong>
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>Recibirás un correo de confirmación en {formData.email}</li>
                <li>El vendedor te contactará en las próximas 24-48 horas</li>
                <li>Se coordinarán los detalles de documentación aduanal y pago</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Link href="/productos">
                <Button variant="outline">Ver más productos</Button>
              </Link>
              <Link href={`/producto/${slug}`}>
                <Button className="bg-primary hover:bg-primary/90">Volver al producto</Button>
              </Link>
            </div>
          </Card>
        </main>

        {isRatingOpen && <RatingOverlay onClose={() => setIsRatingOpen(false)} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/producto/${slug}`}>
          <button className="flex items-center gap-2 text-primary hover:underline mb-8 font-medium">
            <ChevronLeft className="w-4 h-4" />
            Volver al producto
          </button>
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Detalles de Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de compra */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Información del Comprador</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nombre completo *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="juan@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Teléfono *</label>
                  <div className="flex gap-3">
                    <div className="w-24">
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-muted-foreground text-sm font-medium">+</span>
                        <Input
                          type="text"
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handlePhoneInput}
                          inputMode="numeric"
                          placeholder="503"
                          maxLength={4}
                          className="w-full pl-7 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 text-muted-foreground w-5 h-5" />
                        <Input
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

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Dirección de Entrega Internacional</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="country">País *</Label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {Object.keys(TAX_RATES).map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Impuesto aplicable: {(taxRate * 100).toFixed(0)}%
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="address">Dirección *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Calle, número, colonia"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Ciudad *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          placeholder="Ciudad"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado/Provincia *</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          placeholder="Estado"
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">Código Postal *</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          placeholder="12345"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Método de Envío</h3>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="barco"
                        checked={formData.shippingMethod === "barco"}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <Ship className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <span className="font-medium">Envío por Barco</span>
                        <p className="text-xs text-muted-foreground">15-30 días hábiles</p>
                      </div>
                      <span className="font-bold text-primary">${SHIPPING_COSTS.barco} USD</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="avion"
                        checked={formData.shippingMethod === "avion"}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <Plane className="w-5 h-5 text-primary" />
                      <div className="flex-1">
                        <span className="font-medium">Envío por Avión</span>
                        <p className="text-xs text-muted-foreground">5-10 días hábiles</p>
                      </div>
                      <span className="font-bold text-primary">${SHIPPING_COSTS.avion} USD</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Método de Pago</h3>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transferencia"
                        checked={formData.paymentMethod === "transferencia"}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">Transferencia bancaria internacional</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="carta-credito"
                        checked={formData.paymentMethod === "carta-credito"}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">Carta de crédito</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:bg-primary/5 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credito"
                        checked={formData.paymentMethod === "credito"}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">Crédito comercial (sujeto a aprobación)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialInstructions">Instrucciones especiales (opcional)</Label>
                  <Textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    placeholder="Ingresa cualquier instrucción especial para la entrega..."
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg">
                  Confirmar Compra
                </Button>
              </form>
            </Card>
          </div>

          {/* Resumen de compra */}
          <div className="lg:col-span-1">
            <Card className="bg-card border border-border p-6 sticky top-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Resumen del Pedido</h2>

              <div className="space-y-4">
                <div className="flex gap-4 pb-4 border-b border-border">
                  <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.producer}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {product.location}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="kg">Cantidad (kg) *</Label>
                  <Input
                    id="kg"
                    type="number"
                    min="100"
                    step="100"
                    value={kg}
                    onChange={(e) => setKg(Math.max(100, Number.parseInt(e.target.value) || 100))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Pedido mínimo: {product.minOrder}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Precio por kg</span>
                    <span className="font-medium">{product.price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cantidad</span>
                    <span className="font-medium">{kg} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Envío ({formData.shippingMethod === "barco" ? "Barco" : "Avión"})
                    </span>
                    <span className="font-medium">${shippingCost.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Impuestos ({formData.country}, {(taxRate * 100).toFixed(0)}%)
                    </span>
                    <span className="font-medium">${taxAmount.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">${totalPrice.toFixed(2)} USD</span>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Envío Internacional</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        El vendedor te contactará para coordinar los detalles de entrega, documentación aduanal y
                        métodos de pago internacional.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
