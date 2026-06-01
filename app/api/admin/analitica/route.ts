import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // 1. Obtener Cotizaciones y Pedidos Atendidos
    const { data: contactClicks, error: clicksError } = await supabase
      .from('product_contact_clicks')
      .select('id, is_read')

    if (clicksError) throw clicksError

    const totalCotizaciones = contactClicks?.length || 0
    const pedidosLeidos = contactClicks?.filter(c => c.is_read)?.length || 0
    const pedidosAtendidosRatio = totalCotizaciones > 0 
      ? Math.round((pedidosLeidos / totalCotizaciones) * 100) 
      : 0

    // 2. Obtener Usuarios para Top Países e Intereses
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('country, user_type, products_of_interest')

    if (usersError) throw usersError

    // Procesar países e intereses
    const countryMap: Record<string, { compradores: number, vendedores: number }> = {}
    const interestsMap: Record<string, { demanda: number, oferta: number }> = {}
    
    users?.forEach(user => {
      const isComprador = user.user_type === 'comprador'

      // Acumular países
      if (user.country) {
        const country = user.country
        if (!countryMap[country]) {
          countryMap[country] = { compradores: 0, vendedores: 0 }
        }
        if (isComprador) {
          countryMap[country].compradores++
        } else {
          countryMap[country].vendedores++
        }
      }

      // Acumular intereses
      if (user.products_of_interest && Array.isArray(user.products_of_interest)) {
        user.products_of_interest.forEach(product => {
          if (!product) return
          // Normalizar el nombre (minúsculas y sin espacios extra) para agrupar mejor
          const normalized = product.toString().trim().toLowerCase()
          if (!interestsMap[normalized]) {
            interestsMap[normalized] = { demanda: 0, oferta: 0, original: product.toString().trim() }
          }
          if (isComprador) {
            interestsMap[normalized].demanda++
          } else {
            interestsMap[normalized].oferta++
          }
        })
      }
    })

    // Ordenar intereses por los más demandados primero
    const topInterests = Object.values(interestsMap)
      .map(item => {
        let nivelEscasez = 'Moderada'
        if (item.oferta === 0 && item.demanda > 0) nivelEscasez = 'Crítica'
        else if (item.demanda > item.oferta * 3) nivelEscasez = 'Alta'
        else if (item.demanda <= item.oferta) nivelEscasez = 'Baja'

        return {
          categoria: (item as any).original,
          demandaBuscada: item.demanda,
          ofertaActual: item.oferta,
          nivelEscasez
        }
      })
      .sort((a, b) => b.demandaBuscada - a.demandaBuscada)
      .slice(0, 10)

    // Ordenar países por actividad total
    const topCountries = Object.keys(countryMap)
      .map(pais => ({
        pais,
        bandera: "🌎", // Fallback, idealmente usaríamos una librería de banderas
        compradores: countryMap[pais].compradores,
        vendedores: countryMap[pais].vendedores
      }))
      .sort((a, b) => (b.compradores + b.vendedores) - (a.compradores + a.vendedores))
      .slice(0, 5)

    // Si no hay datos, ponemos unos por defecto para que no se vea vacío el MVP
    if (topCountries.length === 0) {
      topCountries.push(
        { pais: "México", bandera: "🇲🇽", compradores: 0, vendedores: 0 },
        { pais: "Colombia", bandera: "🇨🇴", compradores: 0, vendedores: 0 }
      )
    }

    // 3. Mock Data para Toneladas y Escasez (hasta que se implemente la tabla)
    const volumenTotal = 12500 // 12.5k Toneladas (Mock)
    const totalUsuarios = users?.length || 0 // Total de usuarios reales registrados

    return NextResponse.json({
      success: true,
      metrics: {
        totalCotizaciones,
        pedidosAtendidosRatio,
        volumenTotal,
        totalUsuarios
      },
      topCountries,
      // Los datos reales de intereses generados por lo que escriben al registrarse
      shortageData: topInterests.length > 0 ? topInterests : [
        { categoria: "Aún no hay datos reales", demandaBuscada: 0, ofertaActual: 0, nivelEscasez: 'Baja' }
      ],
      // Funnel y retención siguen en mock por ahora 
      funnelData: [
        { name: "1. Landing Page", usuarios: 1000, fill: "#3b82f6" },
        { name: "2. Ver Categorías", usuarios: 750, fill: "#60a5fa" },
        { name: "3. Ver Producto", usuarios: 400, fill: "#93c5fd" },
        { name: "4. Click Contactar", usuarios: totalCotizaciones > 0 ? totalCotizaciones : 120, fill: "#22c55e" },
      ],
      retentionData: [
        { name: "Semana 1", usuarios: 400, retenidos: 240 },
        { name: "Semana 2", usuarios: 450, retenidos: 280 },
        { name: "Semana 3", usuarios: 520, retenidos: 350 },
        { name: "Semana Actual", usuarios: users?.length || 600, retenidos: 450 },
      ]
    })

  } catch (error: any) {
    console.error("[Analitica API Error]:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
