"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface UserProduct {
  id: string
  title: string
  category: string
  description: string
  country: string
  image?: string
  company_name?: string
}

const TARGET_TITLES = [
  "plátano harton",
  "tabaco",
  "sulfato ferroso monohidratado",
  "brocoli en florete",
  "verduras",
]

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products/get-user-products", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        const all: UserProduct[] = data.products || []

        // Filter to the specific products requested, then fill up to 4 with any others
        const targeted = all.filter((p) =>
          TARGET_TITLES.some((t) => p.title.toLowerCase().includes(t))
        )
        const others = all.filter(
          (p) => !TARGET_TITLES.some((t) => p.title.toLowerCase().includes(t))
        )

        const combined = [...targeted, ...others].slice(0, 4)
        setProducts(combined)
      } catch (err) {
        console.error("Error fetching preview products:", err)
      }
    }
    fetchProducts()
  }, [])

  if (products.length === 0) return null

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
          {products.map((product) => (
            <motion.div key={product.id} variants={cardVariants} className="h-full">
              <Link href={`/producto/${product.id}`} className="block h-full">
                <Card className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer flex flex-col h-full">

                  {/* Product image - fixed height */}
                  <div className="h-48 w-full shrink-0 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content - flex grows to fill remaining space */}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-foreground leading-snug line-clamp-1">{product.title}</h3>
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-1">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {product.company_name && (
                      <p className="text-sm font-medium text-foreground line-clamp-1">{product.company_name}</p>
                    )}

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="line-clamp-1">{product.country}</span>
                    </div>

                    {/* Description pinned to bottom with fixed height */}
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-auto pt-2">
                      {product.description}
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
