"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trackActivity } from "@/lib/track"

export function RouteTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      // Evitamos registrar rutas de la API o assets internos
      if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
        trackActivity("page_view", `Visita a la página: ${pathname}`, { pathname })
      }
    }
  }, [pathname])

  return null
}
