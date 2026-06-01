"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Star, MessageSquare, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface PurchaseRating {
  id: string
  rating: number
  comment: string | null
  created_at: string
  user_id: string
}

interface RatingStats {
  average: number
  total: number
  distribution: { rating: number; count: number }[]
}

export default function ReviewsPage() {
  const [ratings, setRatings] = useState<PurchaseRating[]>([])
  const [stats, setStats] = useState<RatingStats>({
    average: 0,
    total: 0,
    distribution: [
      { rating: 1, count: 0 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 0 },
      { rating: 5, count: 0 },
    ],
  })
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from("purchase_ratings")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const ratingsList = data || []
      setRatings(ratingsList)

      if (ratingsList.length > 0) {
        const average = (ratingsList.reduce((sum, r) => sum + r.rating, 0) / ratingsList.length).toFixed(1)
        const distribution = [1, 2, 3, 4, 5].map((rating) => ({
          rating,
          count: ratingsList.filter((r) => r.rating === rating).length,
        }))

        setStats({
          average: Number.parseFloat(average),
          total: ratingsList.length,
          distribution,
        })
      }
    } catch (error) {
      console.error("Error fetching ratings:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRatings()
    const interval = setInterval(fetchRatings, 5000)
    return () => clearInterval(interval)
  }, [supabase])

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} size={20} className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Calificaciones de Compras</h1>
        <p className="text-muted-foreground">Dashboard de reseñas y calificaciones en tiempo real</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando calificaciones...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Promedio de Calificación</p>
                  <p className="text-4xl font-bold text-foreground">{stats.average}</p>
                  <p className="text-xs text-muted-foreground mt-1">de 5 estrellas</p>
                </div>
                <TrendingUp className="w-12 h-12 text-primary/50" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Total de Reseñas</p>
                  <p className="text-4xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">calificaciones registradas</p>
                </div>
                <MessageSquare className="w-12 h-12 text-primary/50" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div>
                <p className="text-muted-foreground text-sm mb-3">Distribución de Estrellas</p>
                <div className="space-y-2">
                  {stats.distribution.map((item) => (
                    <div key={item.rating} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{item.rating}★</span>
                      </div>
                      <span className="font-semibold text-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {stats.total > 0 && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Distribución de Calificaciones</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="rating" label={{ value: "Estrellas", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Cantidad", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Todas las Calificaciones</h2>
            {ratings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay calificaciones aún</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {ratings.map((rating) => (
                  <div
                    key={rating.id}
                    className="p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        {renderStars(rating.rating)}
                        <p className="text-sm text-muted-foreground mt-2">
                          {new Date(rating.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {rating.rating}/5
                      </div>
                    </div>

                    {rating.comment && (
                      <div className="flex gap-3 items-start">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <p className="text-foreground text-sm leading-relaxed">{rating.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
