'use client'

import { useEffect } from 'react'

export default function Privacidad() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidad</h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Información que Recopilamos</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Recopilamos varios tipos de información en conexión con los servicios que proporcionamos:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
              <li>Información de registro (nombre, correo electrónico, empresa, ubicación)</li>
              <li>Información de transacciones (productos, cotizaciones, historial de compras)</li>
              <li>Información de comunicación (mensajes, consultas, feedback)</li>
              <li>Información técnica (dirección IP, tipo de navegador, páginas visitadas)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Cómo Utilizamos tu Información</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
              <li>Proporcionar y mejorar nuestros servicios</li>
              <li>Procesar transacciones y enviar confirmaciones</li>
              <li>Comunicarnos contigo sobre actualizaciones y promociones</li>
              <li>Análisis y investigación para mejorar la plataforma</li>
              <li>Cumplimiento de requisitos legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">3. Seguridad de la Información</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Implementamos medidas de seguridad técnicas y administrativas para proteger tu información personal contra acceso no autorizado. Sin embargo, ningún sistema es completamente seguro.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">4. Compartición de Información</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Tu información puede ser compartida con:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
              <li>Otros usuarios de la plataforma (según sea necesario para transacciones)</li>
              <li>Proveedores de servicios de terceros (socios logísticos, de pago)</li>
              <li>Autoridades legales cuando sea requerido por ley</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">5. Retención de Datos</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Retenemos tu información personal mientras tu cuenta esté activa o según sea necesario para proporcionar servicios. Puedes solicitar la eliminación de tu cuenta en cualquier momento.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">6. Derechos del Usuario</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-foreground/80 space-y-2 mb-4">
              <li>Acceder a tu información personal</li>
              <li>Corregir información inexacta</li>
              <li>Solicitar la eliminación de tu información</li>
              <li>Oponertes al procesamiento de tu información</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">7. Cambios en esta Política</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos sobre cambios significativos a través de tu correo electrónico registrado.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">8. Contacto</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">
              Si tienes preguntas sobre nuestra política de privacidad, contáctanos a través de nuestro formulario de contacto.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
