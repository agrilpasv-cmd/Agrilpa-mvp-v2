"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  User, Mail, Phone, Building2, Globe, MapPin, FileText,
  Edit2, Save, X, Loader, CheckCircle2, AlertCircle,
  Package, ShoppingCart, Star, TrendingUp, Calendar, Link as LinkIcon, Camera
} from "lucide-react"

type Status = { type: "success" | "error"; message: string } | null

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<Status>(null)
  const [originalData, setOriginalData] = useState<any>(null)
  const [stats, setStats] = useState({ products: 0, purchases: 0, quotations: 0 })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    companyLink: "",
    country: "",
    address: "",
    bio: "",
  })
  const [memberSince, setMemberSince] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            const userData = {
              fullName: data.user.full_name || "",
              email: data.user.email || "",
              phone: data.user.phone || "",
              company: data.user.company_name || "",
              companyLink: data.user.company_website || "",
              country: data.user.country || "",
              address: data.user.address || "",
              bio: data.user.bio || "",
            }
            setFormData(userData)
            setOriginalData(userData)
            if (data.user.avatar_url) setAvatarUrl(data.user.avatar_url)

            if (data.user.created_at) {
              const date = new Date(data.user.created_at)
              setMemberSince(
                date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
              )
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (res.ok) {
          const data = await res.json()
          setStats({
            products: data.activeProducts || 0,
            purchases: data.totalTransactions || 0,
            quotations: data.quotationsCount || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchProfile()
    fetchStats()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setSaveStatus(null)
  }

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData)
    }
    setIsEditing(false)
    setSaveStatus(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveStatus(null)
    try {
      const res = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSaveStatus({ type: "success", message: "¡Perfil actualizado correctamente!" })
        setOriginalData({ ...formData })
        setIsEditing(false)
      } else {
        setSaveStatus({ type: "error", message: data.details || data.error || "Error al guardar los cambios." })
      }
    } catch {
      setSaveStatus({ type: "error", message: "Error de conexión. Intenta nuevamente." })
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleAvatarClick = () => {
    document.getElementById("avatar-upload-input")?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append("avatar", file)
      const res = await fetch("/api/user/upload-avatar", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok && data.avatarUrl) {
        setAvatarUrl(data.avatarUrl)
        if (data.dbWarning) {
          setSaveStatus({ type: "error", message: "⚠️ Foto visible solo en esta sesión. Para guardarla permanentemente, ejecuta en Supabase SQL Editor: ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;" })
        } else {
          setSaveStatus({ type: "success", message: "¡Foto de perfil actualizada!" })
        }
      } else {
        setSaveStatus({ type: "error", message: data.error || "Error al subir la imagen" })
      }
    } catch {
      setSaveStatus({ type: "error", message: "Error de conexión al subir la imagen" })
    } finally {
      setUploadingAvatar(false)
      e.target.value = ""
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">

      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y profesional</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="gap-2"
              >
                <X className="w-4 h-4" /> Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2"
              >
                {saving ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Guardando...</>
                ) : (
                  <><Save className="w-4 h-4" /> Guardar Cambios</>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 className="w-4 h-4" /> Editar Perfil
            </Button>
          )}
        </div>
      </div>

      {/* ── Status message ───────────────────────────────────── */}
      {saveStatus && (
        <div
          className={`flex items-center gap-2 text-sm p-3 rounded-lg border ${saveStatus.type === "success"
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
            }`}
        >
          {saveStatus.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          {saveStatus.message}
        </div>
      )}

      {/* ── Profile Header Card ──────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick} title="Cambiar foto de perfil">
              <Avatar className="w-24 h-24 border-4 border-primary/20">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Foto de perfil" className="object-cover" />
                ) : null}
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {getInitials(formData.fullName || "U")}
                </AvatarFallback>
              </Avatar>
              {/* Hover overlay */}
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <Loader className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
              {/* Green dot */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 border-2 border-background rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              {/* Hidden file input */}
              <input
                id="avatar-upload-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-foreground">{formData.fullName || "Sin nombre"}</h2>
              <p className="text-muted-foreground mt-0.5">{formData.company || "Sin empresa"}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Verificado
                </span>
                {formData.country && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    <Globe className="w-3 h-3" /> {formData.country}
                  </span>
                )}
                {memberSince && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                    <Calendar className="w-3 h-3" /> Miembro desde {memberSince}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Quick Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.products}</p>
              <p className="text-sm text-muted-foreground">Publicaciones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <ShoppingCart className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.purchases}</p>
              <p className="text-sm text-muted-foreground">Compras</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-lg bg-amber-500/10">
              <TrendingUp className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.quotations}</p>
              <p className="text-sm text-muted-foreground">Cotizaciones</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Personal Information Card ────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Tu nombre y datos de contacto principales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Nombre Completo
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                Correo Electrónico
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">El correo no se puede cambiar desde aquí</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                Teléfono
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="+503 0000 0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                País
              </Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Tu país"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Business Information Card ────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Información Empresarial
          </CardTitle>
          <CardDescription>
            Datos de tu empresa o negocio agrícola
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                Nombre de la Empresa
              </Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Nombre de tu empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyLink" className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                Sitio Web
              </Label>
              <Input
                id="companyLink"
                name="companyLink"
                value={formData.companyLink}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="www.tuempresa.com"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="address" className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                Dirección
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Dirección de tu empresa o finca"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Bio / About Card ─────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Acerca de Ti
          </CardTitle>
          <CardDescription>
            Cuéntale a tus clientes y socios sobre ti y tu experiencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
              rows={4}
              placeholder="Describe tu experiencia, los productos que ofreces y lo que te diferencia..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none bg-background disabled:opacity-60 disabled:cursor-not-allowed"
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/500 caracteres
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
