"use client"
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    company: "Finca El Roble",
    type: "Granja Familiar",
    country: "Guatemala",
    quote: "Gracias a Agrilpa, logramos exportar nuestro café orgánico a Francia. En 3 meses duplicamos nuestros ingresos.",
    achievement: "Acceso al mercado europeo",
    logo: "/finca-el-roble-logo.jpg",
  },
  {
    company: "Agroindustrias del Pacífico",
    type: "Procesadora de Frutas",
    country: "Ecuador",
    quote: "Conectamos con compradores en Alemania que buscaban piña golden. Ahora exportamos 100 toneladas mensuales.",
    achievement: "Nuevo mercado en Alemania",
    logo: "/agroindustrias-pacifico-logo.jpg",
  },
  {
    company: "Cooperativa Los Andes",
    type: "Cooperativa Agrícola",
    country: "Perú",
    quote: "Encontramos compradores para nuestra quinoa orgánica en España e Italia. La plataforma nos cambió el negocio.",
    achievement: "Expansión a 2 países europeos",
    logo: "/cooperativa-los-andes-logo.jpg",
  },
  {
    company: "Finca Verde S.A.",
    type: "Productora de Aguacate",
    country: "México",
    quote: "Agrilpa nos ayudó a llegar a distribuidores en Reino Unido. Nuestra producción tiene ahora un mercado asegurado.",
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
    quote: "Vendemos carne premium a restaurantes en Suiza. La trazabilidad de Agrilpa nos dio credibilidad internacional.",
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
    quote: "Negociamos directamente con importadores en Japón. Eliminamos 3 intermediarios y mejoramos nuestros márgenes.",
    achievement: "Comercio directo con Japón",
    logo: "/azucar-del-valle-logo.jpg",
  },
  {
    company: "Finca Los Cerezos",
    type: "Granja Familiar",
    country: "Costa Rica",
    quote: "Exportamos mango a Canadá por primera vez. Agrilpa nos conectó con el comprador ideal en menos de 2 semanas.",
    achievement: "Primer envío a Canadá",
    logo: "/finca-los-cerezos-logo.jpg",
  },
  {
    company: "Grupo Agrícola del Sur",
    type: "Holding Agroindustrial",
    country: "Chile",
    quote: "Consolidamos ventas de arándanos a 5 países europeos. La plataforma centralizó toda nuestra operación de exportación.",
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
    quote: "Conectamos con importadores premium en Dinamarca y Noruega. Nuestros vinos ya están en tiendas escandinavas.",
    achievement: "Mercados nórdicos",
    logo: "/vinedos-del-sol-logo.jpg",
  },
];

const getVisibleCount = (width: number): number => {
  if (width >= 1280) return 6; // Changed to 6 for large screens
  if (width >= 1024) return 4;
  if (width >= 768) return 2;
  return 1;
};

export function SuccessStories() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      
      const oldVisibleCount = getVisibleCount(windowWidth);
      const newVisibleCount = getVisibleCount(newWidth);
      
      if (oldVisibleCount !== newVisibleCount) {
        const maxIndexForNewWidth = Math.max(0, testimonials.length - newVisibleCount);
        if (currentIndex > maxIndexForNewWidth) {
          setCurrentIndex(maxIndexForNewWidth);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [windowWidth, currentIndex]);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        const visibleCount = getVisibleCount(windowWidth);
        const maxIndex = Math.max(0, testimonials.length - visibleCount);

        setCurrentIndex((prev) => {
          // Loop continuously left to right
          if (prev >= maxIndex) {
            return 0;
          }
          return prev + 1;
        });
      }, 4000);
    };

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, windowWidth]);

  const visibleCount = getVisibleCount(windowWidth);
  const maxIndex = Math.max(0, testimonials.length - visibleCount);

  const goNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    pauseAutoPlay();
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    pauseAutoPlay();
  };

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const handleDragEnd = (event: any, info: any) => {
    const { offset } = info;
    const swipeThreshold = 30;

    if (offset.x < -swipeThreshold) {
      goNext();
    } else if (offset.x > swipeThreshold) {
      goPrev();
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    pauseAutoPlay();
  };

  return (
    <section className="py-16 md:py-24 bg-white/30 backdrop-blur-xl overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm uppercase tracking-wider mb-3">
            Casos de Éxito
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Lo que Dicen Nuestros Clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Testimonios reales de granjas, industrias y empresas que han alcanzado nuevos mercados con Agrilpa
          </p>
        </motion.div>
      </div>

      <div className="w-full relative px-2 sm:px-4" ref={containerRef}>
        <div className="max-w-[1400px] mx-auto relative mb-6 sm:mb-0">
          <div className="flex justify-center sm:justify-end sm:absolute sm:-top-24 right-4 sm:right-6 lg:right-8 space-x-2 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={goPrev}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 text-primary transition-all duration-300"
              aria-label="Testimonio anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={goNext}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 text-primary transition-all duration-300"
              aria-label="Siguiente testimonio"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="overflow-hidden relative">
          <motion.div
            className="flex"
            animate={{ x: `-${currentIndex * (100 / visibleCount)}%` }}
            transition={{ 
              type: 'spring', 
              stiffness: 70, 
              damping: 20 
            }}
          >
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                className={`flex-shrink-0 px-2`}
                style={{ width: `${100 / visibleCount}%` }}
                initial={{ opacity: 0.5, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98, cursor: 'grabbing' }}
              >
                <motion.div 
                  className="relative overflow-hidden rounded-2xl p-5 h-full bg-white border border-gray-100 shadow-lg shadow-primary/5 cursor-grab flex flex-col"
                  whileHover={{
                    boxShadow: "0 10px 20px -5px rgba(139, 198, 70, 0.15), 0 4px 6px -2px rgba(139, 198, 70, 0.05)"
                  }}
                >
                  {/* Achievement badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg">
                      ✦ {testimonial.achievement}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 opacity-5 pointer-events-none">
                    <Quote size={60} className="text-primary" />
                  </div>
                  
                  <div className="relative z-10 flex-1 flex flex-col">
                    <p className="text-[13px] sm:text-sm text-gray-700 font-medium mb-6 leading-relaxed flex-1">
                      &ldquo;{testimonial.quote}&rdquo;
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-gray-50 flex items-center justify-center text-primary font-bold">
                            {testimonial.logo ? (
                              <img
                                src={testimonial.logo}
                                alt={testimonial.company}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.innerHTML = testimonial.company.charAt(0);
                                }}
                              />
                            ) : (
                              testimonial.company.charAt(0)
                            )}
                          </div>
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-primary/20"
                            animate={{ 
                              scale: [1, 1.2, 1],
                              opacity: [0, 0.3, 0] 
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1
                            }}
                          />
                        </div>
                        <div className="ml-3">
                          <h4 className="font-bold text-sm text-gray-900 leading-tight line-clamp-1" title={testimonial.company}>{testimonial.company}</h4>
                          <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-1">{testimonial.type} · {testimonial.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
            
        <div className="flex justify-center mt-8">
          {Array.from({ length: testimonials.length - visibleCount + 1 }, (_: any, index: any) => (
            <motion.button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative mx-1 focus:outline-none"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Ir al testimonio ${index + 1}`}
            >
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex 
                    ? 'bg-primary' 
                    : 'bg-gray-300'
                }`}
                animate={{ 
                  scale: index === currentIndex ? [1, 1.2, 1] : 1
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: index === currentIndex ? Infinity : 0,
                  repeatDelay: 1
                }}
              />
              {index === currentIndex && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/30"
                  animate={{ 
                    scale: [1, 1.8],
                    opacity: [1, 0] 
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
