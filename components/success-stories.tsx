"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { useRef, useState } from "react"

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

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

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

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  return (
    <section className="py-16 md:py-24 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Lo que Dicen Nuestros Clientes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Testimonios reales de granjas, industrias y empresas que han alcanzado nuevos mercados con Agrilpa
          </p>
        </div>

        <div className="mb-12">
          <div
            className="relative overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing"
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className={`flex gap-4 ${isDragging ? "" : "animate-scroll-right"}`}>
              {allTestimonials.map((testimonial, index) => (
                <Card
                  key={`testimonial-${index}`}
                  className="min-w-[380px] max-w-[380px] p-4 bg-background hover:shadow-lg transition-shadow flex-shrink-0"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={testimonial.logo || "/placeholder.svg"}
                        alt={`${testimonial.company} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground text-sm">{testimonial.company}</h3>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.type} • {testimonial.country}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mb-2 leading-snug">{testimonial.quote}</p>
                  <div className="pt-2 border-t">
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {testimonial.achievement}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* View All Link */}
        <div className="text-center"></div>
      </div>

      <style jsx>{`
        @keyframes scroll-right {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
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

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
