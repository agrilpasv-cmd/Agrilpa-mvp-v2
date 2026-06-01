"use client"

// import posthog from 'posthog-js'
// import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // DESCOMENTAR PARA ACTIVAR POSTHOG:
    // Asegúrate de instalar: npm install posthog-js
    
    /*
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        capture_pageview: false, // Lo haremos manualmente con Next.js
        persistence: 'localStorage'
      })
    }
    */
  }, [])

  // Rastreo manual de vistas de página (Pageviews) para Next.js App Router
  useEffect(() => {
    /*
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + "?" + searchParams.toString()
      }
      posthog.capture('$pageview', { $current_url: url })
    }
    */
  }, [pathname, searchParams])

  // Retornar PostHogProvider cuando se active:
  // return <PostHogProvider client={posthog}>{children}</PostHogProvider>
  
  return <>{children}</>
}
