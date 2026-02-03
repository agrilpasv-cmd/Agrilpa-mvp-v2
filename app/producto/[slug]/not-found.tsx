import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md mx-auto">
                <div className="bg-destructive/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                </div>

                <h1 className="text-3xl font-bold text-foreground">Producto no encontrado</h1>

                <p className="text-muted-foreground text-lg">
                    Lo sentimos, el producto que estás buscando no existe o ha sido eliminado por el vendedor.
                </p>

                <div className="pt-4">
                    <Link href="/productos">
                        <Button size="lg" className="gap-2">
                            Volver al Catálogo
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
