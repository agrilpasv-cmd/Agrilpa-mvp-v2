import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, Globe, Banknote } from "lucide-react"
import Link from "next/link"

export function ForProducers() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Mejores precios",
      description: "Elimina intermediarios y accede a precios justos directamente de compradores mayoristas.",
    },
    {
      icon: Globe,
      title: "Mercados globales",
      description: "Expande tu negocio a más de 50 países sin necesidad de importadores.",
    },
    {
      icon: TrendingUp,
      title: "Crecimiento escalable",
      description: "Crece a tu ritmo con acceso a compradores de múltiples sectores.",
    },
    {
      icon: Banknote,
      title: "Financiamiento",
      description: "Accede a opciones de financiamiento flexibles para impulsar tu producción y expandir tu negocio.",
    },
  ]

  return (
    <section id="vendedores" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Para vendedores</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Accede a oportunidades de negocio sin intermediarios. Conecta directamente con compradores mayoristas y
              empresas industriales en todo el mundo.
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
                Unirse como vendedor
              </Button>
            </Link>
          </div>

          <img
            src="/exportaci-n-de-productos-agr-colas-en-contenedores.jpg"
            alt="Exportación agrícola"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  )
}
