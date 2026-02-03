"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Edit2, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    address: "",
    bio: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setFormData({
              fullName: data.user.full_name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              company: data.user.company_name || "",
              country: data.user.country || "",
              address: data.user.address || "", // Assuming address is in public table or metadata
              bio: data.user.bio || "",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // TODO: Implementar lógica para guardar cambios
    setIsEditing(false)
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y profesional</p>
        </div>

        {/* Profile Card */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder-user.jpg" alt="Foto de perfil" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-bold text-foreground">{formData.fullName}</h2>
                <p className="text-muted-foreground">{formData.company}</p>
                <div className="mt-2 flex gap-2">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✓ Verificado
                  </span>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Vendedor
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => {
                if (isEditing) {
                  handleSave()
                } else {
                  setIsEditing(true)
                }
              }}
              className="gap-2"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" /> Guardar
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" /> Editar
                </>
              )}
            </Button>
          </div>

          {isEditing && (
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                setFormData({
                  fullName: "Juan Pérez",
                  email: "juan@agrilpa.com",
                  phone: "+503 6000-0000",
                  company: "Agricultura Pérez SA",
                  country: "El Salvador",
                  address: "Calle Principal 123",
                  bio: "Vendedor de frutas y verduras frescas con más de 10 años de experiencia",
                })
              }}
              className="gap-2 mb-6"
            >
              <X className="w-4 h-4" /> Cancelar
            </Button>
          )}

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nombre Completo</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Empresa</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">País</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Biografía</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-primary mb-2">8</p>
            <p className="text-muted-foreground">Productos Listados</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-primary mb-2">24</p>
            <p className="text-muted-foreground">Clientes Activos</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-4xl font-bold text-primary mb-2">4.8</p>
            <p className="text-muted-foreground">Calificación Promedio</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
