import { Button } from "@/components/ui/button"
import { Search, Zap, Lock } from 'lucide-react'
import Link from "next/link"

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
    <section id="compradores" className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <img
            src="/compradores-mayoristas-negociando-en-mercado-agr-c.jpg"
            alt="Compradores mayoristas"
            className="rounded-lg shadow-lg order-2 md:order-1"
          />

          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Para compradores</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Sourcing directo de productos agrícolas de calidad. Conecta con vendedores verificados y accede a mejores
              precios y volúmenes.
            </p>

            <div className="space-y-6 mb-8">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon
                return (
                  <div key={idx} className="flex gap-4">
                    <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-foreground mb-1">{benefit.title}</h3>
                      <p className="text-muted-foreground text-sm">{benefit.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <Link href="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Unirse como comprador
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
