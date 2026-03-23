"use client"

import { Button } from "@/components/ui/button"
import { Search, Zap, Lock, ArrowRight } from 'lucide-react'
import Link from "next/link"
import { motion } from "framer-motion"

export function ForBuyers() {
  const benefits = [
    {
      icon: Search,
      title: "Catálogo diversificado",
      description: "Accede a productos de múltiples vendedores verificados en una sola plataforma.",
    },
    {
      icon: Zap,
      title: "Proceso ágil",
      description: "Negocia, contrata y recibe directamente sin intermediarios innecesarios.",
    },
    {
      icon: Lock,
      title: "Seguridad garantizada",
      description: "Todos los vendedores están verificados y cumplen con estándares de calidad.",
    },
  ]

  return (
    <section id="compradores" className="py-20 md:py-32 relative overflow-hidden bg-background">
      {/* Decorative background blobs */}
      <div className="absolute top-1/2 right-0 -mt-40 -mr-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Image Column */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative group order-2 md:order-1"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2rem] blur-xl" />
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-border/50 bg-background/50 -rotate-1 group-hover:rotate-0 transition-transform duration-500">
              <img
                src="/para-vendedores-camion.jpg"
                alt="Camión cargado con productos agrícolas"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem]" />
            </div>
          </motion.div>

          {/* Content Column */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="order-1 md:order-2 flex flex-col items-start"
          >
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-6">
              Para Compradores
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-6 tracking-tight leading-tight">
              Abastecimiento inteligente sin intermediarios
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              Sourcing directo de productos agrícolas de calidad. Conecta con vendedores verificados y accede a mejores
              precios y volúmenes.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10 w-full">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon
                return (
                  <div key={idx} className="group p-5 rounded-2xl bg-background border border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                )
              })}
            </div>

            <Link href="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground group px-8 py-6 text-base shadow-lg hover:shadow-primary/25 transition-all">
                Unirse como comprador
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
