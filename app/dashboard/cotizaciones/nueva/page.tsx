"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

interface Publication {
  id: string
  title: string
  price: string
  quantity: string
}

export default function NuevaCotizacionPage() {
  const router = useRouter()

  // TODO: Obtener publicaciones reales del usuario desde la base de datos
  const [publications] = useState<Publication[]>([
    { id: "1", title: "Tomates Frescos Orgánicos", price: "$2.50/kg", quantity: "500 kg" },
    { id: "2", title: "Café Premium", price: "$8.00/kg", quantity: "1000 kg" },
    { id: "3", title: "Aguacate Hass", price: "$3.00/kg", quantity: "300 kg" },
  ])

  const [formData, setFormData] = useState({
    publicacionId: "",
    usuarioId: "",
    cantidad: "",
    precioUnitario: "",
    notas: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.publicacionId || !formData.usuarioId || !formData.cantidad || !formData.precioUnitario) {
      alert("Por favor completa todos los campos requeridos")
      return
    }

    // Find selected publication
    const selectedPublication = publications.find((pub) => pub.id === formData.publicacionId)
    if (!selectedPublication) {
      alert("Publicación no encontrada")
      return
    }

    // Calculate total amount
    const cantidadNum = Number.parseFloat(formData.cantidad)
    const precioNum = Number.parseFloat(formData.precioUnitario.replace("$", ""))
    
    if (isNaN(cantidadNum) || isNaN(precioNum)) {
      alert("Por favor ingresa valores numéricos válidos")
      return
    }

    // TODO: Guardar cotización en la base de datos
    console.log("Nueva cotización:", {
      publicacionId: formData.publicacionId,
      producto: selectedPublication.title,
      usuarioId: formData.usuarioId,
      cantidad: cantidadNum,
      precioUnitario: precioNum,
      montoTotal: cantidadNum * precioNum,
      notas: formData.notas,
      fecha: new Date().toISOString(),
    })

    alert("¡Cotización creada exitosamente!")
    router.push("/dashboard/cotizaciones")
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div>
        <Link href="/dashboard/cotizaciones">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a Cotizaciones
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Crear Nueva Cotización</h1>
        <p className="text-muted-foreground">Genera una cotización personalizada para tus clientes</p>
      </div>

      {publications.length === 0 ? (
        <Card className="border-yellow-500/50 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800 text-center font-medium mb-2">
              No tienes publicaciones activas
            </p>
            <p className="text-yellow-700 text-center text-sm">
              Primero debes crear una publicación para poder generar cotizaciones.
            </p>
            <div className="flex justify-center mt-4">
              <Link href="/dashboard/mis-publicaciones">
                <Button>Ir a Mis Publicaciones</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Cotización</CardTitle>
            <CardDescription>Completa la información para crear una cotización personalizada</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Selecciona tu Publicación <span className="text-red-500">*</span>
                </label>
                <select
                  name="publicacionId"
                  value={formData.publicacionId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  required
                >
                  <option value="">Selecciona una publicación</option>
                  {publications.map((pub) => (
                    <option key={pub.id} value={pub.id}>
                      {pub.title} - {pub.price} (Stock: {pub.quantity})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Solo puedes crear cotizaciones de productos que tienes publicados
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  ID del Usuario Comprador <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="usuarioId"
                  value={formData.usuarioId}
                  onChange={handleInputChange}
                  placeholder="Ej: USER-123456"
                  className="w-full"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ingresa el ID único del usuario al que deseas enviar esta cotización
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cantidad (kg) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleInputChange}
                    placeholder="Ej: 500"
                    min="0.01"
                    step="0.01"
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Precio Unitario ($) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="precioUnitario"
                    value={formData.precioUnitario}
                    onChange={handleInputChange}
                    placeholder="Ej: $2.50"
                    className="w-full"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Incluye el símbolo $ si lo deseas
                  </p>
                </div>
              </div>

              {formData.cantidad && formData.precioUnitario && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Monto Total Estimado:</p>
                  <p className="text-3xl font-bold text-primary">
                    $
                    {(
                      Number.parseFloat(formData.cantidad) * Number.parseFloat(formData.precioUnitario.replace("$", ""))
                    ).toFixed(2)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Notas o Condiciones Especiales</label>
                <Textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  placeholder="Agrega información adicional, términos de entrega, métodos de pago, descuentos especiales, etc."
                  rows={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Opcional: Agrega detalles que el comprador debe conocer
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" size="lg">
                  Crear Cotización
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/cotizaciones")}
                  className="flex-1"
                  size="lg"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
