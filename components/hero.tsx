"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Globe, ShieldCheck } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, Variants } from "framer-motion"
import { AuthStorage } from "@/lib/auth-storage"

export function Hero() {
  const router = useRouter()

  const handleVenderClick = () => {
    const session = AuthStorage.getSession()
    if (session) {
      router.push("/dashboard/mis-publicaciones")
    } else {
      router.push("/auth")
    }
  }
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
      }
    }
  }

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Video Overlay: 25% oscuro izquierda → 0% difuminado derecha */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/10 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-20">
        <motion.div 
          className="flex flex-col items-start text-left max-w-4xl space-y-7"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >


          {/* Main Title */}
          <motion.h1 variants={itemVariants} className="text-6xl sm:text-7xl lg:text-[6rem] font-black text-white leading-[1.05] tracking-tighter">
            Conecta el<br />
            campo con el<br />
            mundo.
          </motion.h1>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-base sm:text-lg text-white/90 leading-relaxed max-w-xl">
            Agrilpa elimina intermediarios y conecta directamente a vendedores agrícolas con compradores mayoristas e
            industrias de todo el mundo, optimizando la cadena de suministro global.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              onClick={handleVenderClick}
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 rounded-lg transition-transform hover:scale-105"
            >
              Vender mis productos
            </Button>
            <Link href="/productos">
              <Button
                size="lg"
                className="bg-black hover:bg-black/80 text-white border border-white/10 font-semibold px-8 h-12 rounded-lg transition-transform hover:scale-105"
              >
                Buscar Proveedores
              </Button>
            </Link>
          </motion.div>

          {/* Stats Card */}
          <motion.div variants={itemVariants} className="mt-12 p-6 sm:px-10 sm:py-7 rounded-3xl bg-transparent shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex flex-wrap items-center gap-8 sm:gap-16 w-fit relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-md border border-white/10 rounded-3xl pointer-events-none bg-white/5" />
            
            <div className="flex flex-col relative z-10">
              <span className="text-4xl font-bold text-white mb-1 tracking-tight">3K+</span>
              <span className="text-sm text-gray-300 font-medium tracking-wide">Vendedores verificados</span>
            </div>
            
            <div className="flex flex-col relative z-10">
              <span className="text-4xl font-bold text-white mb-1 tracking-tight">10+</span>
              <span className="text-sm text-gray-300 font-medium tracking-wide">Países conectados</span>
            </div>

            <div className="flex flex-col relative z-10">
              <span className="text-4xl font-bold text-white mb-1 tracking-tight">$10M+</span>
              <span className="text-sm text-gray-300 font-medium tracking-wide">Volumen transaccionado</span>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  )
}
