import { Lightbulb, MessageSquare, FileCheck, Truck, FileText } from "lucide-react"

export function About() {
  return (
    <section id="sobre" className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Sobre Agrilpa</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Somos la plataforma digital que revoluciona el comercio agrícola global eliminando intermediarios
            innecesarios y creando conexiones directas entre vendedores y compradores.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Cadena de Suministro</h3>
            <p className="text-muted-foreground">
              Optimizamos cada eslabón de la cadena desde el origen hasta el destino final. Nuestra plataforma integra
              productores, distribuidores y compradores en un ecosistema conectado que garantiza trazabilidad, calidad y
              eficiencia en todo el proceso comercial.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Logística</h3>
            <p className="text-muted-foreground">
              Coordinamos el transporte, empaque y toda la documentación necesaria con máxima eficiencia. Consulta
              certificados fitosanitarios, tiempos de envío y opciones de empaque desde una plataforma centralizada que
              te brinda control completo y visibilidad en tiempo real.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Financiamiento</h3>
            <p className="text-muted-foreground">
              Accede a soluciones de financiamiento adaptadas a tus necesidades y obtén información actualizada del
              mercado para decisiones estratégicas. Trabaja con nosotros para mejorar tu proceso de abastecimiento y
              mantener ventaja competitiva con análisis de precios y tendencias.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-primary/10 border border-primary/20 rounded-lg p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Agrilpa la plataforma B2B que impulsa el comercio agrícola global
              </h3>
              <p className="text-lg mb-6 text-foreground">
                Conectamos a vendedores, distribuidores y compradores internacionales en un ecosistema digital confiable
                y eficiente. En Agrilpa, facilitamos transacciones seguras, transparentes y sostenibles, eliminando las
                barreras tradicionales del comercio agrícola y optimizando la cadena de suministro, promoviendo el
                crecimiento del sector a nivel mundial.
              </p>

              <h4 className="text-xl font-bold text-foreground mb-4">Cómo funciona Agrilpa:</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <Lightbulb className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-primary">
                    <strong className="text-foreground">Descubre oportunidades:</strong> Explora una amplia oferta de
                    productos agrícolas listos para la venta local o exportación.
                  </span>
                </li>
                <li className="flex items-start">
                  <MessageSquare className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-primary">
                    <strong className="text-foreground">Negocia directamente:</strong> Envía cotizaciones, compara
                    precios y contacta con vendedores o compradores en pocos clics.
                  </span>
                </li>
                <li className="flex items-start">
                  <FileCheck className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-primary">
                    <strong className="text-foreground">Asegura tus acuerdos:</strong> Gestiona contratos de forma
                    digital con soporte y verificación en cada paso.
                  </span>
                </li>
                <li className="flex items-start">
                  <Truck className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-primary">
                    <strong className="text-foreground">Optimiza la logística:</strong> Visualiza opciones de
                    transporte, costos y tiempos de entrega sin complicaciones.
                  </span>
                </li>
                <li className="flex items-start">
                  <FileText className="w-5 h-5 text-black mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-primary">
                    <strong className="text-foreground">Centraliza tu documentación:</strong> Toda la información
                    comercial y de exportación en un solo espacio accesible y confiable.
                  </span>
                </li>
              </ul>
            </div>
            <img
              src="/dashboard-preview.png"
              alt="Plataforma Agrilpa"
              className="rounded-lg shadow-lg w-full h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
