import { Contact } from "@/components/contact"

export default function ContactoPage() {
  return (
    <main>
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-background/80 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Hablemos de tu negocio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Estamos aquí para ayudarte a conectar con los mejores vendedores y compradores del sector agrícola
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <Contact />
    </main>
  )
}
