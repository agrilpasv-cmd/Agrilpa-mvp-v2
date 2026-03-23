"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Globe, ShieldCheck } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, Variants } from "framer-motion"
import { AuthStorage } from "@/lib/auth-storage"
import { useEffect, useRef } from "react"

export function Hero() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true
      videoRef.current.muted = true
      videoRef.current.play().catch(e => console.log("Autoplay did not start:", e))
    }
  }, [])

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
        ref={videoRef}
        src="https://res.cloudinary.com/dvdz0yhuh/video/upload/v1774293524/184808-874264370_medium_p3dznv.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

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
            La plataforma B2B para promocionar tus productos agrícolas y negociar directamente con compradores
            internacionales. Sin intermediarios, sin complicaciones.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              size="lg"
              onClick={handleVenderClick}
              className="bg-primary hover:bg-primary/85 text-white font-bold px-10 h-14 rounded-2xl shadow-[0_0_32px_rgba(139,198,70,0.35)] hover:shadow-[0_0_48px_rgba(139,198,70,0.5)] hover:-translate-y-1 transition-all duration-300 text-base"
            >
              Vender mis productos
            </Button>
            <Link href="/productos">
              <span
                className="relative inline-flex items-center justify-center px-8 h-14 rounded-2xl font-semibold text-base text-white cursor-pointer select-none overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
                style={{ WebkitBackdropFilter: "blur(8px)", backdropFilter: "blur(8px)" }}
              >
                {/* Glass tint — barely visible, just a light wash */}
                <span className="absolute inset-0 rounded-2xl bg-white/8 group-hover:bg-white/12 transition-colors duration-400" />
                {/* Outer border ring */}
                <span className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/30 group-hover:ring-white/50 transition-all duration-300" />
                {/* Top edge — sharp reflective shine */}
                <span className="absolute inset-x-4 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
                {/* Inner highlight — top half glow */}
                <span className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/12 to-transparent pointer-events-none" />
                {/* Hover shimmer sweep */}
                <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/18 via-transparent to-transparent pointer-events-none" />
                {/* Label */}
                <span className="relative z-10 drop-shadow-sm">Buscar Proveedores</span>
              </span>
            </Link>
          </motion.div>



        </motion.div>
      </div>
    </section>
  )
}
