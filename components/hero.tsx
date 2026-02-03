import { Button } from "@/components/ui/button"
import { ArrowRight } from 'lucide-react'
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/campos-agr-colas-verdes-con-plantas-de-cultivo-y-c.jpg')`,
          backgroundAttachment: "fixed",
        }}
      />
      {/* Overlay oscuro para mejorar legibilidad del texto */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Conecta el campo con los <span 
                className="text-primary" 
                style={{ 
                  textShadow: '-0.5px -0.5px 0 white, 0.5px -0.5px 0 white, -0.5px 0.5px 0 white, 0.5px 0.5px 0 white, -1px 0 0 white, 1px 0 0 white, 0 -1px 0 white, 0 1px 0 white'
                }}
              >mercados globales</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100">
              Agrilpa elimina intermediarios y conecta directamente a vendedores agrícolas con compradores mayoristas e
              industrias de todo el mundo, optimizando la cadena de suministro global.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Unirse como vendedor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="bg-white/90 hover:bg-white text-foreground">
                Unirse como comprador
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 pt-8 bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
            <div>
              <p className="text-2xl font-bold text-white">3K+</p>
              <p className="text-sm text-gray-200">Vendedores verificados</p>
            </div>
            <div className="hidden sm:block h-12 w-px bg-white/30" />
            <div>
              <p className="text-2xl font-bold text-white">10+</p>
              <p className="text-sm text-gray-200">Países conectados</p>
            </div>
            <div className="hidden sm:block h-12 w-px bg-white/30" />
            <div>
              <p className="text-2xl font-bold text-white">$10M+</p>
              <p className="text-sm text-gray-200">Volumen transaccionado</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
