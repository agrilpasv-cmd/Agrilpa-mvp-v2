"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export interface FeaturedProduct {
  id: string
  title: string
  category: string
  description: string
  country: string
  price?: string
  min_order?: string
  company_name?: string | null
  seller_is_pro?: boolean
}

function ProductImage({ productId, title }: { productId: string; title: string }) {
  const [loaded, setLoaded] = useState(false)
  const src = `/api/products/${productId}/thumb`

  return (
    <div className="w-full h-full relative bg-slate-100 dark:bg-zinc-800">
      {!loaded && (
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full rounded-none" />
        </div>
      )}
      <img
        src={src}
        alt={title}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setLoaded(true)
          e.currentTarget.src = "/placeholder.svg"
        }}
        className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 15 } },
}

export function ProductPreview() {
  const [products, setProducts] = useState<FeaturedProduct[]>([])
  const [status, setStatus] = useState<"loading" | "done">("loading")

  useEffect(() => {
    let cancelled = false

    fetch("/api/products/featured-preview")
      .then(res => {
        if (!res.ok) throw new Error("not ok")
        return res.json()
      })
      .then(data => {
        if (!cancelled) {
          setProducts((data.products || []).slice(0, 4))
          setStatus("done")
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("done")
      })

    return () => { cancelled = true }
  }, [])

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase mb-2">Productos Destacados</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Descubre lo que ofrecemos
            </h2>
          </div>
          <Link
            href="/productos"
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            Ver todos los productos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {status === "loading" ? (
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div 
                key={`sk-${i}`} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <div className="rounded-2xl overflow-hidden flex flex-col h-[340px] border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-md">
                  <Skeleton className="h-52 w-full rounded-none bg-slate-200 dark:bg-zinc-700" />
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-zinc-700" />
                    <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-zinc-700" />
                    <Skeleton className="h-3 w-full bg-slate-100 dark:bg-zinc-700/60" />
                    <Skeleton className="h-3 w-4/5 bg-slate-100 dark:bg-zinc-700/60" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-4 text-center py-16 text-muted-foreground"
            >
              <p>No hay productos destacados en este momento.</p>
              <Link href="/productos" className="text-primary underline mt-2 inline-block">Ver catálogo completo</Link>
            </motion.div>
          ) : (
            products.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 80, damping: 15, delay: i * 0.1 }}
              >
                <Link href={`/producto/${product.id}`} className="block h-full">
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm hover:shadow-lg hover:border-primary/40 dark:hover:border-primary/40 transition-all cursor-pointer flex flex-col h-full group">

                    {/* Image */}
                    <div className="relative h-52 w-full shrink-0 overflow-hidden bg-slate-100">
                      <ProductImage productId={product.id} title={product.title} />

                      {/* Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <div className="bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2.5 h-6 flex items-center rounded-full shadow-sm">
                          {product.category}
                        </div>
                        {product.seller_is_pro && (
                          <div className="bg-slate-900/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 h-6 flex items-center gap-1 rounded-full shadow-sm">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            Verificado
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-2">
                        <h3 className="text-base font-bold text-foreground leading-tight mb-1 line-clamp-1">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{product.state ? `${product.country}, ${product.state}` : product.country}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1 leading-relaxed">
                        {product.description?.split("---")[0]?.trim()}
                      </p>
                    </div>

                </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>

      </div>
    </section>
  )
}
