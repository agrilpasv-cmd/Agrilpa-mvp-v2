import { Card } from "@/components/ui/card"

export function Products() {
  const products = [
    { icon: "🍌", name: "Frutas", description: "Plátano, piña, papaya, mango y más" },
    { icon: "🥕", name: "Verduras", description: "Brócoli, tomate, chile, cebolla" },
    { icon: "🌾", name: "Cereales", description: "Maíz, arroz, sorgo y granos" },
    { icon: "🌱", name: "Semillas", description: "Semillas de cultivos diversificados" },
    { icon: "☕", name: "Café", description: "Café de altura de calidad premium" },
    { icon: "🍫", name: "Cacao", description: "Cacao fino de aroma" },
    { icon: "🌿", name: "Caña de azúcar", description: "Materia prima para azúcar y biocombustibles" },
    { icon: "👕", name: "Algodón", description: "Fibra natural de alta calidad" },
  ]

  return (
    <section id="productos" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Productos disponibles</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una amplia variedad de productos agrícolas y materias primas de calidad mundial.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <Card
              key={product.name}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer text-center"
            >
              <p className="text-4xl mb-3">{product.icon}</p>
              <h3 className="font-bold text-foreground mb-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </Card>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <a href="/productos">
            <button className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors">
              Ver más
            </button>
          </a>
        </div>
      </div>
    </section>
  )
}
