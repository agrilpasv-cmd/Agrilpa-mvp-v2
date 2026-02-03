'use client'

import { useEffect } from 'react'

export default function Cookies() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">Política de Cookies</h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">1. ¿Qué son las Cookies?</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. Nos ayudan a recordar tus preferencias y mejorar tu experiencia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Tipos de Cookies que Utilizamos</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              <strong>Cookies Esenciales:</strong> Necesarias para el funcionamiento básico de la plataforma, como autenticación y seguridad.
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4">
              <strong>Cookies de Preferencia:</strong> Recuerdan tus preferencias y configuraciones personales.
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4">
              <strong>Cookies de Análisis:</strong> Nos ayudan a entender cómo utilizas nuestro sitio para mejorarlo constantemente.
            </p>
            <p className="text-foreground/80 leading-relaxed mb-4">
              <strong>Cookies de Marketing:</strong> Utilizadas para mostrar anuncios relevantes y medir la efectividad de campañas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Control de Cookies</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Puedes controlar las cookies a través de la configuración de tu navegador. La mayoría de navegadores te permiten rechazar cookies o alertarte cuando se instala una cookie. Ten en cuenta que desactivar cookies puede afectar la funcionalidad del sitio.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookies de Terceros</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Algunos terceros, como proveedores de análisis y plataformas de publicidad, pueden colocar cookies en tu navegador a través de nuestro sitio. Estos terceros tienen sus propias políticas de privacidad.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Consentimiento de Cookies</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Al utilizar Agrilpa, aceptas el uso de cookies como se describe en esta política. Podemos solicitar tu consentimiento explícito para ciertos tipos de cookies antes de implementarlas.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Duración de las Cookies</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Algunas cookies son temporales (cookies de sesión) y se eliminan cuando cierras el navegador. Otras son permanentes y se almacenan en tu dispositivo durante un período específico.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Actualizaciones de esta Política</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Podemos actualizar esta política de cookies ocasionalmente para reflejar cambios en nuestra práctica o por otras razones operativas, legales o regulatorias.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Contacto</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Si tienes preguntas sobre nuestra política de cookies, contáctanos a través de nuestro formulario de contacto.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
