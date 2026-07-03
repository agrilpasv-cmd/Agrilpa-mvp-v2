"use client"

import { useState } from "react"

interface ProductImageProps {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  priority?: boolean
}

/**
 * ProductImage — wraps a regular <img> with:
 *  - animated skeleton while loading
 *  - smooth fade-in when loaded
 *  - graceful fallback on error
 *
 * We use native <img> (not next/image) because the project has
 * `images: { unoptimized: true }` in next.config, which disables
 * Next.js image optimisation anyway.
 */
export function ProductImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  priority = false,
}: ProductImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <div className={`relative w-full h-full ${containerClassName}`}>
      {/* Skeleton shimmer — shown until image loads */}
      {!loaded && !errored && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-zinc-800 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent skeleton-shimmer" />
        </div>
      )}

      <img
        src={errored ? "/placeholder.svg" : src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setErrored(true); setLoaded(true) }}
        className={`w-full h-full transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </div>
  )
}
