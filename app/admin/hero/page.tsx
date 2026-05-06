"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { X, Plus, Loader2 } from "lucide-react"
import Image from "next/image"

interface HeroImage {
  id: string
  image_url: string
  link_url?: string
  is_active: boolean
  order_index: number
  created_at: string
}

export default function HeroAdminPage() {
  const [images, setImages] = useState<HeroImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const fetchImages = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/hero")
      const data = await res.json()
      if (data.images) {
        setImages(data.images)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes del Hero.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Archivo inválido",
        description: "Por favor, selecciona una imagen.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch("/api/admin/hero", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Error al subir imagen")
      
      toast({
        title: "Éxito",
        description: "Imagen subida correctamente.",
      })
      
      fetchImages()
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo subir la imagen.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) return

    try {
      const res = await fetch(`/api/admin/hero?id=${id}&url=${encodeURIComponent(url)}`, {
        method: "DELETE"
      })

      if (!res.ok) throw new Error("Error al eliminar")

      toast({
        title: "Éxito",
        description: "Imagen eliminada.",
      })
      
      setImages(images.filter(img => img.id !== id))
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen.",
        variant: "destructive"
      })
    }
  }

  const handleUpdateLink = async (id: string, linkUrl: string) => {
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, link_url: linkUrl })
      })
      
      if (!res.ok) throw new Error("Error al actualizar link")
      
      toast({
        title: "Actualizado",
        description: "El enlace se ha guardado correctamente.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el enlace.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="p-4 md:p-8 w-full max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hero Banners</h1>
        <p className="text-muted-foreground mt-1">Sube banners publicitarios y configura hacia dónde redirigen al hacer clic.</p>
        <p className="text-sm text-gray-500 mt-2">Puedes subir varias imágenes a la vez (Se mostrarán en el carrusel derecho de la página de inicio).</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {images.map((img) => (
            <div key={img.id} className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-4">
              {/* Delete Button */}
              <button 
                onClick={() => handleDelete(img.id, img.image_url)}
                className="absolute -top-3 -right-3 z-10 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition-colors"
                title="Eliminar"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image Preview */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                <Image 
                  src={img.image_url} 
                  alt="Hero banner" 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>

              {/* Link Input */}
              <div className="flex flex-col gap-1.5 mt-auto">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vincular a Enlace / Página</label>
                <Input 
                  placeholder="https://... o /productos"
                  defaultValue={img.link_url || ""}
                  className="bg-gray-50 border-gray-200 focus-visible:ring-primary h-10"
                  onBlur={(e) => {
                    if (e.target.value !== img.link_url) {
                      setImages(prev => prev.map(i => i.id === img.id ? { ...i, link_url: e.target.value } : i))
                      handleUpdateLink(img.id, e.target.value)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur()
                    }
                  }}
                />
              </div>
            </div>
          ))}

          {/* Upload Card */}
          <label className="relative rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary bg-gray-50/50 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center min-h-[250px] cursor-pointer group">
            {isUploading ? (
              <div className="flex flex-col items-center text-primary">
                <Loader2 className="w-10 h-10 animate-spin mb-3" />
                <span className="font-medium">Subiendo...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors">
                <div className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center mb-3">
                  <Plus className="w-7 h-7" />
                </div>
                <span className="font-medium">Añadir Imagen(es)</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>

        </div>
      )}
    </div>
  )
}
