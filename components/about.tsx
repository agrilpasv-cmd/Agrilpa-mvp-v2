"use client"

import { Lightbulb, MessageSquare, FileCheck, Truck, FileText, Link2, Package, DollarSign } from "lucide-react"
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
            className="group bg-card border border-border rounded-lg p-8 hover:border-primary hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
              <Link2 className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Cadena de Suministro</h3>
            <p className="text-muted-foreground">
              Optimizamos cada eslabón de la cadena desde el origen hasta el destino final. Nuestra plataforma integra
              productores, distribuidores y compradores en un ecosistema conectado que garantiza trazabilidad, calidad y
              eficiencia en todo el proceso comercial.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group bg-card border border-border rounded-lg p-8 hover:border-primary hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
              <Package className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Logística</h3>
            <p className="text-muted-foreground">
              Coordinamos el transporte, empaque y toda la documentación necesaria con máxima eficiencia. Consulta
              certificados fitosanitarios, tiempos de envío y opciones de empaque desde una plataforma centralizada que
              te brinda control completo y visibilidad en tiempo real.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group bg-card border border-border rounded-lg p-8 hover:border-primary hover:shadow-lg transition-all duration-300"
          >
            <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary rounded-xl flex items-center justify-center mb-4 transition-colors duration-300">
              <DollarSign className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Financiamiento</h3>
            <p className="text-muted-foreground">
              Accede a soluciones de financiamiento adaptadas a tus necesidades y obtén información actualizada del
              mercado para decisiones estratégicas. Trabaja con nosotros para mejorar tu proceso de abastecimiento y
              mantener ventaja competitiva con análisis de precios y tendencias.
            </p>
          </motion.div>
        </div>

        <div className="mt-16 relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-[#e8f0d8] via-[#edf3e0] to-[#e2eed4]">
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
                Agrilpa la plataforma B2B que impulsa el{" "}
                <span className="text-primary">comercio agrícola global</span>
              </h3>

              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
                Conectamos a vendedores, distribuidores y compradores internacionales en un ecosistema digital confiable
                y eficiente. En Agrilpa, facilitamos transacciones seguras, transparentes y sostenibles, eliminando las
                barreras tradicionales del comercio agrícola y optimizando la cadena de suministro, promoviendo el
                crecimiento del sector a nivel mundial.
              </p>

              <p className="text-foreground font-semibold text-sm uppercase tracking-widest mb-4 opacity-50">
                Cómo funciona Agrilpa
              </p>

              <ul className="space-y-3">
                {[
                  {
                    Icon: Lightbulb,
                    title: "Descubre oportunidades",
                    desc: "Explora una amplia oferta de productos agrícolas listos para la venta local o exportación.",
                  },
                  {
                    Icon: MessageSquare,
                    title: "Negocia directamente",
                    desc: "Envía cotizaciones, compara precios y contacta con vendedores o compradores en pocos clics.",
                  },
                  {
                    Icon: FileCheck,
                    title: "Asegura tus acuerdos",
                    desc: "Gestiona contratos de forma digital con soporte y verificación en cada paso.",
                  },
                  {
                    Icon: Truck,
                    title: "Optimiza la logística",
                    desc: "Visualiza opciones de transporte, costos y tiempos de entrega sin complicaciones.",
                  },
                  {
                    Icon: FileText,
                    title: "Centraliza tu documentación",
                    desc: "Toda la información comercial y de exportación en un solo espacio accesible y confiable.",
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
