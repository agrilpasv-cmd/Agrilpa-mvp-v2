"use client"

import { Globe, MessageSquare, ShieldCheck, Lightbulb, FileCheck, Truck, FileText } from "lucide-react"
import { motion } from "framer-motion"

export function About() {
  return (
    <section id="sobre" className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Sobre Agrilpa</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Somos la plataforma digital que revoluciona el comercio agrícola global eliminando intermediarios
            innecesarios y creando conexiones directas entre vendedores y compradores.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-10 hover:border-primary/50 hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500"
          >
            <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
              <Globe className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Visibilidad Global</h3>
            <p className="text-muted-foreground">
              Publica tus productos y llega a una red de compradores globales de todo el mundo sin salir de la plataforma.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-10 hover:border-primary/50 hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500"
          >
            <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
              <MessageSquare className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Negociación Directa</h3>
            <p className="text-muted-foreground">
              Gestiona tus tratos, envía y recibe cotizaciones sin salir de la plataforma. Directo entre vendedor y comprador.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl p-10 hover:border-primary/50 hover:shadow-[0_24px_48px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500"
          >
            <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
              <ShieldCheck className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Seguridad en Identidad</h3>
            <p className="text-muted-foreground">
              Conectamos perfiles profesionales de empresas para que puedas negociar con confianza en cada transacción.
            </p>
          </motion.div>
        </div>

        <div className="mt-20 relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-[#e8f0d8] via-[#edf3e0] to-[#e2eed4] shadow-[0_24px_48px_rgba(0,0,0,0.06)]">
          {/* Subtle grid texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#8BC646 1px,transparent 1px),linear-gradient(90deg,#8BC646 1px,transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          {/* Brand-color glow top-right */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="relative grid md:grid-cols-2 gap-10 items-center p-8 md:p-14"
          >
            {/* ── LEFT: text column ── */}
            <div>
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Plataforma B2B Agrícola
              </span>

              <h3 className="text-2xl md:text-4xl font-extrabold text-foreground leading-tight mb-5">
                Tu centro de control{" "}
                <span className="text-primary">agrícola.</span>
              </h3>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
                Administra tus operaciones comerciales en un solo lugar: publicaciones, cotizaciones y contactos, todo
                integrado para que puedas enfocarte en crecer.
              </p>

              <p className="text-foreground font-semibold text-sm uppercase tracking-widest mb-4 opacity-50">
                Cómo funciona Agrilpa
              </p>

              <ul className="space-y-3">
                {[
                  {
                    Icon: Lightbulb,
                    title: "Administra tus publicaciones",
                    desc: "Crea, edita y gestiona tu catálogo de productos de forma sencilla desde el dashboard.",
                  },
                  {
                    Icon: MessageSquare,
                    title: "Cotizaciones en tiempo real",
                    desc: "Recibe alertas de nuevas cotizaciones y responde a compradores directamente desde la plataforma.",
                  },
                  {
                    Icon: FileCheck,
                    title: "Contacto directo garantizado",
                    desc: "Contacta directamente a compradores y vendedores interesados sin intermediarios.",
                  },
                  {
                    Icon: FileText,
                    title: "Perfil de empresa completo",
                    desc: "Completa y gestiona tu perfil empresarial profesional para generar confianza ante compradores y vendedores.",
                  },
                  {
                    Icon: Truck,
                    title: "Directorio de proveedores",
                    desc: "Explora y filtra empresas agrícolas por categoría, región o producto para encontrar al aliado ideal.",
                  },
                ].map(({ Icon, title, desc }, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 bg-white hover:bg-primary/5 transition-colors rounded-xl px-4 py-3 border border-primary/15 shadow-sm"
                  >
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm leading-snug">
                      <strong className="text-foreground font-semibold">{title}:</strong> {desc}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── RIGHT: image column ── */}
            <div className="relative flex items-center justify-center">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-primary/20 w-full">
                <img
                  src="/dashboard-preview.png"
                  alt="Plataforma Agrilpa"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
