"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Building2, MapPin, Globe, Calendar, Package, ChevronLeft,
  Star, ExternalLink, ArrowRight, Loader, ShieldCheck, Award, Ship
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ExportHistoryItem {
  url: string
  type: "container_photo" | "certificate"
  label: string
  uploaded_at: string
}

interface PublicProfile {
  id: string
  full_name: string
  company_name: string
  country: string
  bio: string
  company_website: string
  address: string
  created_at: string
  avatar_url?: string
  is_pro?: boolean
  export_history?: ExportHistoryItem[]
}

interface Product {
  id: string
  title: string
  category: string
  price: string
  country: string
  state?: string
  image: string
  min_order: string
  packaging: string
  views: number
  created_at: string
  rating?: number
}

export default function VendedorPage() {
  const params = useParams()
  const router = useRouter()
  const userId = typeof params?.userId === "string" ? params.userId : ""

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!userId) return

    const fetchData = async () => {
      try {
        const [profileRes, productsRes] = await Promise.all([
          fetch(`/api/user/public-profile?userId=${userId}`),
          fetch(`/api/products/get-products-by-user?userId=${userId}`)
        ])

        if (!profileRes.ok) {
          setNotFound(true)
          return
        }

        const profileData = await profileRes.json()
        const productsData = productsRes.ok ? await productsRes.json() : { products: [] }

        setProfile(profileData.profile)
        setProducts(productsData.products || [])
      } catch (err) {
        console.error("[VendedorPage] Error:", err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const getInitials = (name: string) => {
    return (name || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getMemberSince = (createdAt: string) => {
    if (!createdAt) return ""
    return new Date(createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Building2 className="w-14 h-14 text-muted-foreground/30 mx-auto" />
          <h2 className="text-2xl font-bold">Perfil no encontrado</h2>
          <p className="text-muted-foreground">Este vendedor no existe o no tiene un perfil público.</p>
          <Button onClick={() => router.push("/productos")} variant="outline">
            Ver catálogo
          </Button>
        </div>
      </div>
    )
  }

  const displayName = profile.company_name || profile.full_name || "Empresa"
  const initials = getInitials(displayName)
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0)

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border">
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/productos">
            <button className="flex items-center gap-2 text-primary hover:underline mb-8 font-medium text-sm">
              <ChevronLeft className="w-4 h-4" />
              Volver al catálogo
            </button>
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              {(profile as any).avatar_url ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/20">
                  <img
                    src={(profile as any).avatar_url}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/30">
                  {initials}
                </div>
              )}
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-green-500 border-2 border-background rounded-full" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground truncate">
                {displayName}
              </h1>

              {/* Verified Pro Badge */}
              {profile.is_pro && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold">Vendedor Verificado</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-3">
                {profile.country && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    <MapPin className="w-3 h-3" />
                    {profile.country}
                  </span>
                )}
                {profile.created_at && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                    <Calendar className="w-3 h-3" />
                    Miembro desde {getMemberSince(profile.created_at)}
                  </span>
                )}
                {profile.company_website && (
                  <a
                    href={profile.company_website.startsWith("http") ? profile.company_website : `https://${profile.company_website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-500/20 transition-colors"
                  >
                    <Globe className="w-3 h-3" />
                    Sitio web
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="p-5 text-center border border-border">
            <p className="text-3xl font-bold text-primary">{products.length}</p>
            <p className="text-sm text-muted-foreground mt-1">Publicaciones activas</p>
          </Card>
          <Card className="p-5 text-center border border-border">
            <p className="text-3xl font-bold text-foreground">{totalViews}</p>
            <p className="text-sm text-muted-foreground mt-1">Vistas totales</p>
          </Card>
          <Card className="p-5 text-center border border-border col-span-2 sm:col-span-1">
            <p className="text-3xl font-bold text-foreground">
              {[...new Set(products.map(p => p.category))].length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Categorías</p>
          </Card>
        </div>

        {/* Bio */}
        {profile.bio && (
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Acerca de la empresa
            </h2>
            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            {profile.address && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                <MapPin className="w-4 h-4 shrink-0" />
                {profile.address}
              </p>
            )}
          </Card>
        )}

        {/* ── Export History (Pro Only) ──────────────────────── */}
        {profile.is_pro && profile.export_history && profile.export_history.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
              <Ship className="w-6 h-6 text-primary" />
              Historial de Exportación
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-bold">
                <ShieldCheck className="w-3 h-3" />
                PRO
              </span>
            </h2>

            {/* Certificates */}
            {profile.export_history.filter(item => item.type === "certificate").length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Certificaciones de Calidad
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.export_history.filter(item => item.type === "certificate").map((item, idx) => (
                    <a
                      key={`cert-${idx}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      <Award className="w-4 h-4 text-green-500" />
                      {item.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Container Photos */}
            {profile.export_history.filter(item => item.type === "container_photo").length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Ship className="w-4 h-4" />
                  Fotos de Contenedores / Exportaciones
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.export_history.filter(item => item.type === "container_photo").map((item, idx) => (
                    <a
                      key={`photo-${idx}`}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block rounded-xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all"
                    >
                      <div className="aspect-video bg-muted">
                        <img
                          src={item.url}
                          alt={item.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-medium truncate">{item.label}</p>
                        <p className="text-white/70 text-xs">
                          {new Date(item.uploaded_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              Productos publicados
              <span className="text-base font-normal text-muted-foreground ml-1">({products.length})</span>
            </h2>
          </div>

          {products.length === 0 ? (
            <Card className="p-12 text-center border border-dashed border-border">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">Este vendedor aún no tiene publicaciones.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`}>
                  <Card className="group overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-muted">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-primary/90 text-white text-xs font-medium px-2 py-0.5 shadow">
                          {product.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col gap-2">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {product.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {product.state ? `${product.country}, ${product.state}` : product.country}
                      </div>

                      {/* Price + views row */}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                        <span className="font-bold text-primary text-lg">
                          {product.price === "Por Cotizar"
                            ? "Por Cotizar"
                            : product.price?.includes("$")
                              ? product.price
                              : `$${product.price}`}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {product.rating || 0}
                        </div>
                      </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
                        Ver producto
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
