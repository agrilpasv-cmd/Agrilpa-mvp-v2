"use client"

import type React from "react"
import { useRef, useState } from "react"
import { motion } from "framer-motion"

export function SuccessStories() {
  const testimonials = [
    {
      company: "Finca El Roble",
      type: "Granja Familiar",
      country: "Guatemala",
      quote:
        "Gracias a Agrilpa, logramos exportar nuestro café orgánico a Francia. En 3 meses duplicamos nuestros ingresos.",
      achievement: "Acceso al mercado europeo",
      logo: "/finca-el-roble-logo.jpg",
    },
    {
      company: "Agroindustrias del Pacífico",
      type: "Procesadora de Frutas",
      country: "Ecuador",
      quote:
        "Conectamos con compradores en Alemania que buscaban piña golden. Ahora exportamos 100 toneladas mensuales.",
      achievement: "Nuevo mercado en Alemania",
      logo: "/agroindustrias-pacifico-logo.jpg",
    },
    {
      company: "Cooperativa Los Andes",
      type: "Cooperativa Agrícola",
      country: "Perú",
      quote:
        "Encontramos compradores para nuestra quinoa orgánica en España e Italia. La plataforma nos cambió el negocio.",
      achievement: "Expansión a 2 países europeos",
      logo: "/cooperativa-los-andes-logo.jpg",
    },
    {
      company: "Finca Verde S.A.",
      type: "Productora de Aguacate",
      country: "México",
      quote:
        "Agrilpa nos ayudó a llegar a distribuidores en Reino Unido. Nuestra producción tiene ahora un mercado asegurado.",
      achievement: "Contrato anual en UK",
      logo: "/finca-verde-logo.jpg",
    },
    {
      company: "Tropical Exports",
      type: "Exportadora",
      country: "Honduras",
      quote: "Cerramos un acuerdo con una cadena hotelera en Dubái para suministrar frutas tropicales todo el año.",
      achievement: "Mercado en Medio Oriente",
      logo: "/tropical-exports-logo.jpg",
    },
    {
      company: "Hacienda San Martín",
      type: "Granja Ganadera",
      country: "Colombia",
      quote:
        "Vendemos carne premium a restaurantes en Suiza. La trazabilidad de Agrilpa nos dio credibilidad internacional.",
      achievement: "Exportación a Suiza",
      logo: "/hacienda-san-martin-logo.jpg",
    },
    {
      company: "BioFarms Nicaragua",
      type: "Cultivos Orgánicos",
      country: "Nicaragua",
      quote: "Accedimos a certificadores y compradores europeos que valoraron nuestras prácticas sostenibles.",
      achievement: "Certificación europea",
      logo: "/biofarms-nicaragua-logo.jpg",
    },
    {
      company: "Azúcar del Valle",
      type: "Ingenio Azucarero",
      country: "El Salvador",
      quote:
        "Negociamos directamente con importadores en Japón. Eliminamos 3 intermediarios y mejoramos nuestros márgenes.",
      achievement: "Comercio directo con Japón",
      logo: "/azucar-del-valle-logo.jpg",
    },
    {
      company: "Finca Los Cerezos",
      type: "Granja Familiar",
      country: "Costa Rica",
      quote:
        "Exportamos mango a Canadá por primera vez. Agrilpa nos conectó con el comprador ideal en menos de 2 semanas.",
      achievement: "Primer envío a Canadá",
      logo: "/finca-los-cerezos-logo.jpg",
    },
    {
      company: "Grupo Agrícola del Sur",
      type: "Holding Agroindustrial",
      country: "Chile",
      quote:
        "Consolidamos ventas de arándanos a 5 países europeos. La plataforma centralizó toda nuestra operación de exportación.",
      achievement: "5 mercados europeos",
      logo: "/grupo-agricola-del-sur-logo.jpg",
    },
    {
      company: "Procesadora Andina",
      type: "Industria de Alimentos",
      country: "Bolivia",
      quote: "Vendemos harina de quinoa a distribuidores en Australia. Nunca pensamos llegar tan lejos.",
      achievement: "Expansión a Oceanía",
      logo: "/procesadora-andina-logo.jpg",
    },
    {
      company: "Viñedos del Sol",
      type: "Bodega",
      country: "Argentina",
      quote:
        "Conectamos con importadores premium en Dinamarca y Noruega. Nuestros vinos ya están en tiendas escandinavas.",
      achievement: "Mercados nórdicos",
      logo: "/vinedos-del-sol-logo.jpg",
    },
  ]

  const allTestimonials = [...testimonials, ...testimonials]

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchEnd = () => setIsDragging(false)

  return (
    <section className="py-16 md:py-24 bg-white/30 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Lo que Dicen Nuestros Clientes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Testimonios reales de granjas, industrias y empresas que han alcanzado nuevos mercados con Agrilpa
          </p>
        </motion.div>
      </div>

      {/* Full-width auto-scrolling slider */}
      <div className="w-full mb-12">
        <div
          className="relative overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing w-full"
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className={`flex gap-5 px-6 pb-8 pt-2 ${isDragging ? "" : "animate-scroll-right"}`}>
            {allTestimonials.map((testimonial, index) => (
              <div
                key={`testimonial-${index}`}
                className="liquid-glass-card min-w-[380px] max-w-[380px] flex-shrink-0 relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between"
                style={{ minHeight: "240px" }}
              >
                {/* Layered glass background */}
                <div className="glass-layer-base" />
                <div className="glass-layer-sheen" />

                {/* Achievement badge — top right */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg">
                    ✦ {testimonial.achievement}
                  </span>
                </div>

                {/* Quote block */}
                <div className="relative z-10 flex-1 pr-2">
                  <span
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: "52px",
                      lineHeight: "1",
                      color: "var(--primary)",
                      opacity: 0.6,
                      display: "block",
                      marginBottom: "-8px",
                      userSelect: "none",
                    }}
                  >
                    &ldquo;
                  </span>
                  <p className="text-[14.5px] text-gray-800 leading-relaxed font-medium">
                    {testimonial.quote}
                  </p>
                </div>

                {/* Footer: avatar + name/role */}
                <div className="relative z-10 flex items-center justify-between mt-5 pt-4 border-t border-white/50">
                  <div className="flex items-center gap-3">
                    {/* Circular avatar */}
                    <div
                      className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/70 shadow-md flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #ffffff, #f3f4f6)" }}
                    >
                      <img
                        src={testimonial.logo || "/placeholder.svg"}
                        alt={`${testimonial.company}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          img.style.display = "none"
                          const parent = img.parentElement
                          if (parent) {
                            parent.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#15803d;">${testimonial.company.charAt(0)}</div>`
                          }
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 leading-tight">{testimonial.company}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {testimonial.type} · {testimonial.country}
                      </p>
                    </div>
                  </div>


                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center" />
      </div>

      <style jsx>{`
        @keyframes scroll-right {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-scroll-right {
          animation: scroll-right 60s linear infinite;
        }
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .animate-scroll-right {
            animation: scroll-right 30s linear infinite;
          }
        }

        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── Liquid Glass Card ── */
        .liquid-glass-card {
          background: rgba(255, 255, 255, 0.52);
          backdrop-filter: blur(30px) saturate(190%) brightness(1.06);
          -webkit-backdrop-filter: blur(30px) saturate(190%) brightness(1.06);
          border: 1px solid rgba(255, 255, 255, 0.78);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.07),
            0 2px 8px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.92),
            inset 1px 0 0 rgba(255, 255, 255, 0.65),
            inset -1px 0 0 rgba(255, 255, 255, 0.65),
            inset 0 -1px 0 rgba(255, 255, 255, 0.25);
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;
        }

        .liquid-glass-card:hover {
          transform: translateY(-8px) scale(1.015);
          box-shadow:
            0 24px 56px rgba(0, 0, 0, 0.11),
            0 6px 20px rgba(22, 163, 74, 0.09),
            inset 0 1px 0 rgba(255, 255, 255, 0.98),
            inset 1px 0 0 rgba(255, 255, 255, 0.75),
            inset -1px 0 0 rgba(255, 255, 255, 0.75),
            inset 0 -1px 0 rgba(255, 255, 255, 0.35);
        }

        /* Base gradient fill */
        .glass-layer-base {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: linear-gradient(
            140deg,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.7) 100%
          );
          pointer-events: none;
          z-index: 0;
        }

        /* Top specular sheen */
        .glass-layer-sheen {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 48%;
          border-radius: 16px 16px 0 0;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.58) 0%,
            rgba(255, 255, 255, 0) 100%
          );
          pointer-events: none;
          z-index: 1;
        }
      `}</style>
    </section>
  )
}
