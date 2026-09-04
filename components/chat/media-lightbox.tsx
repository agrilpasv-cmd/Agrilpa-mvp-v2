"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  X, ZoomIn, ZoomOut, RotateCcw, Download, Loader2, Maximize2
} from 'lucide-react'
import { downloadAttachment } from '@/lib/download'

interface MediaLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
  title?: string;
}

export function MediaLightbox({ imageUrl, onClose, title }: MediaLightboxProps) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isDownloading, setIsDownloading] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Reset zoom and pan when image changes or closes
  useEffect(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [imageUrl])

  // Keyboard navigation: Escape to close, +/- to zoom, 0 to reset
  useEffect(() => {
    if (!imageUrl) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        handleZoomOut()
      } else if (e.key === '0') {
        e.preventDefault()
        handleReset()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [imageUrl, onClose])

  const handleZoomIn = () => {
    setScale((prev) => Math.min(4, +(prev + 0.5).toFixed(2)))
  }

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(2))
      if (next === 1) setPosition({ x: 0, y: 0 })
      return next
    })
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleDoubleClick = () => {
    if (scale > 1) {
      handleReset()
    } else {
      setScale(2)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(4, +(prev + 0.25).toFixed(2)))
    } else {
      setScale((prev) => {
        const next = Math.max(1, +(prev - 0.25).toFixed(2))
        if (next === 1) setPosition({ x: 0, y: 0 })
        return next
      })
    }
  }

  // Dragging logic when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return
    e.preventDefault()
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDownload = async () => {
    if (!imageUrl || isDownloading) return
    setIsDownloading(true)
    try {
      await downloadAttachment(imageUrl, 'imagen-chat.jpg')
    } finally {
      setIsDownloading(false)
    }
  }

  if (!imageUrl) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        // If clicking directly on backdrop
        if (e.target === containerRef.current) {
          onClose()
        }
      }}
      ref={containerRef}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 z-20 flex items-center justify-between gap-3 text-white">
        
        {/* Title or badge */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 text-xs font-medium truncate max-w-[200px] sm:max-w-xs">
          <Maximize2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{title || "Vista previa de imagen"}</span>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/15 shadow-2xl">
          
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="p-2 rounded-full hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-white"
            title="Reducir zoom (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom percentage pill */}
          <button
            onClick={handleReset}
            className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-full transition-colors min-w-[50px] text-center"
            title="Hacer clic para reiniciar zoom"
          >
            {Math.round(scale * 100)}%
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="p-2 rounded-full hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-white"
            title="Aumentar zoom (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Reset button (visible when zoomed) */}
          {scale > 1 && (
            <button
              onClick={handleReset}
              className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
              title="Reiniciar tamaño (0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <div className="w-[1px] h-5 bg-white/20 my-auto mx-0.5" />

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold shadow-md transition-all"
            title="Descargar imagen a tu dispositivo"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Descargar</span>
          </button>

          <div className="w-[1px] h-5 bg-white/20 my-auto mx-0.5" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-500/80 active:scale-95 transition-colors text-white"
            title="Cerrar (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div 
        className={`relative w-full h-full flex items-center justify-center p-4 sm:p-12 overflow-hidden ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt={title || "Imagen ampliada"}
          draggable={false}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-transform ease-out duration-100 will-change-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          }}
        />
      </div>

      {/* Bottom Hint on desktop */}
      <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none">
        <p className="text-[11px] text-white/50 bg-black/30 backdrop-blur-xs inline-block px-3 py-1 rounded-full border border-white/5">
          Doble clic para zoom {scale > 1 ? '100%' : '200%'} • Rueda del ratón para acercar/alejar • Arrastra para mover
        </p>
      </div>
    </div>
  )
}
