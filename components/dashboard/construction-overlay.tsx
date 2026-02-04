import React from "react"
import { Construction, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ConstructionOverlayProps {
    children: React.ReactNode
}

export default function ConstructionOverlay({ children }: ConstructionOverlayProps) {
    return (
        <div className="relative min-h-[calc(100vh-4rem)]">
            {/* Background Content - Blurred and Disabled */}
            <div className="filter blur-sm opacity-60 pointer-events-none select-none">
                {children}
            </div>

            {/* Overlay Content */}
            <div className="absolute inset-0 z-50">
                <div className="sticky top-0 h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                    <Card className="max-w-md w-full shadow-2xl border-primary/20 bg-background/95 backdrop-blur">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                            </div>

                            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Próximamente
                            </h3>

                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Sabemos que estás interesado en esta función, y estamos trabajando para que esté lista muy pronto.
                            </p>

                            <div className="pt-2 text-sm text-muted-foreground/60 italic">
                                Agrilpa
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
