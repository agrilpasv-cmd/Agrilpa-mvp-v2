"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface UserProduct {
  id: string
  title: string
  category: string
  description: string
  country: string
  image?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 70, damping: 14 },
  },
}

export function ProductPreview() {
  const [products, setProducts] = useState<UserProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    fetch("/api/products/get-user-products", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(res => res.ok ? res.json() : { products: [] })
      .then(data => {
        setProducts((data.products || []).slice(0, 4))
      })
      .catch(() => setProducts([]))
      .finally(() => {
        clearTimeout(timeout)
        setIsLoading(false)
      })

    return () => {
      controller.abort()
      clearTimeout(timeout)
    }
  }, [])

  if (!isLoading && products.length === 0) return null

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

        {/* Product Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={`sk-${i}`} variants={cardVariants} className="h-full">
                <Card className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-[320px]">
                  <Skeleton className="h-48 w-full shrink-0 rounded-none bg-primary/5" />
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <Skeleton className="h-5 w-3/4 bg-primary/10" />
                    <Skeleton className="h-4 w-24 rounded-full bg-primary/10" />
                    <div className="flex items-center gap-2 mt-1">
                      <Skeleton className="h-3 w-3 rounded-full bg-primary/10" />
                      <Skeleton className="h-3 w-1/2 bg-primary/10" />
                    </div>
                    <div className="mt-auto space-y-2">
                      <Skeleton className="h-3 w-full bg-primary/5" />
                      <Skeleton className="h-3 w-4/5 bg-primary/5" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            products.map((product) => (
              <motion.div key={product.id} variants={cardVariants} className="h-full">
                <Link href={`/producto/${product.id}`} className="block h-full">
                  <Card className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer flex flex-col h-full">

                    <div className="h-48 w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-5 flex flex-col gap-2 flex-1">
                      <div>
                        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-1">
                          {product.title}
                        </h3>
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-1">
                          {product.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="line-clamp-1">{product.country}</span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-3 mt-auto pt-2">
                        {product.description?.split("---")[0]}
                      </p>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>

      </div>
    </section>
  )
}
