export function Commission() {
  return (
    <section className="py-20 md:py-32 bg-primary/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-background border border-primary/20 rounded-lg p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">Modelo de comisión</h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="text-center p-6 bg-primary/5 rounded-lg">
              <p className="text-5xl font-bold text-primary mb-2">10%</p>
              <p className="text-foreground font-semibold mb-2">Comisión por transacción</p>
              <p className="text-muted-foreground">
                Agrilpa obtiene una comisión del 10% de cada transacción exitosa realizada en la plataforma.
              </p>
            </div>

            <div className="p-6 bg-background border border-border rounded-lg space-y-4">
              <h3 className="font-bold text-foreground text-lg">Cómo funciona:</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">1.</span>
                  <span>Se liquida al completarse la transacción verificada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">2.</span>
                  <span>No hay costos ocultos para vendedores ni compradores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">3.</span>
                  <span>La comisión garantiza el mantenimiento de la plataforma y seguridad</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-0.5">4.</span>
                  <span>Transparencia total en cada factura y comprobante</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
            <p className="text-foreground mb-2">
              <span className="font-bold">Ejemplo:</span> Si vendes $10,000 USD en productos
            </p>
            <p className="text-2xl font-bold text-primary">Agrilpa retiene: $1,000 USD | Tu ganancia: $9,000 USD</p>
          </div>
        </div>
      </div>
    </section>
  )
}
