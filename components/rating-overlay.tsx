"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Star, CheckCircle2 } from "lucide-react"

interface RatingOverlayProps {
  onClose: () => void
}

export function RatingOverlay({ onClose }: RatingOverlayProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (rating > 0) {
      try {
        const response = await fetch("/api/purchase/submit-rating", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, comment }),
        })

        if (response.ok) {
          console.log("[v0] Rating submitted successfully")
          setSubmitted(true)
          setTimeout(() => {
            onClose()
          }, 2000)
        } else {
          const errorData = await response.json()
          console.error("[v0] Rating submission error:", errorData.error)
          alert("Error al guardar tu calificación. Por favor intenta de nuevo.")
        }
      } catch (error) {
        console.error("[v0] Error submitting rating:", error)
        alert("Error al enviar la calificación")
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-background border border-border shadow-2xl animate-in zoom-in-95 duration-300">
        {submitted ? (
          <div className="px-8 py-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">¡Gracias por tu calificación!</h3>
            <p className="text-muted-foreground">Tu opinión nos ayuda a mejorar la plataforma</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-primary text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Califica tu experiencia</h3>
                <p className="text-sm text-white/80 mt-1">¿Cómo fue tu experiencia en Agrilpa?</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-9 w-9">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Star Rating */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">Selecciona tu calificación</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-12 h-12 transition-colors ${
                          star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm font-semibold text-primary mt-2">
                    {rating === 1 && "Muy malo"}
                    {rating === 2 && "Malo"}
                    {rating === 3 && "Regular"}
                    {rating === 4 && "Bueno"}
                    {rating === 5 && "Excelente"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  {"Tu opinión nos ayudará a mejorar"}
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comparte tu experiencia con nosotros..."
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-base font-semibold"
              >
                Enviar calificación
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
