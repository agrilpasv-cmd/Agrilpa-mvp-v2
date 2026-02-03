"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Bell, Lock, User, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [newOffers, setNewOffers] = useState(true)

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Configuración</h1>
          <p className="text-muted-foreground">Gestiona tus preferencias y seguridad</p>
        </div>

        {/* Notifications */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Notificaciones</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
              <div>
                <p className="font-medium text-foreground">Notificaciones por Email</p>
                <p className="text-sm text-muted-foreground">Recibe alertas de nuevas cotizaciones y mensajes</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-6 h-6 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
              <div>
                <p className="font-medium text-foreground">Notificaciones por SMS</p>
                <p className="text-sm text-muted-foreground">Recibe alertas importantes en tu celular</p>
              </div>
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => setSmsNotifications(e.target.checked)}
                className="w-6 h-6 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-border last:border-b-0">
              <div>
                <p className="font-medium text-foreground">Ofertas y Promociones</p>
                <p className="text-sm text-muted-foreground">Recibe información sobre nuevas oportunidades</p>
              </div>
              <input
                type="checkbox"
                checked={newOffers}
                onChange={(e) => setNewOffers(e.target.checked)}
                className="w-6 h-6 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Seguridad</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Cambiar Contraseña</p>
                <p className="text-sm text-muted-foreground">Actualiza tu contraseña regularmente</p>
              </div>
              <Button variant="outline">Cambiar</Button>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Verificación de Dos Factores</p>
                <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad</p>
              </div>
              <Button variant="outline">Configurar</Button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-foreground">Sesiones Activas</p>
                <p className="text-sm text-muted-foreground">Cierra sesiones en otros dispositivos</p>
              </div>
              <Button variant="outline">Ver Sesiones</Button>
            </div>
          </div>
        </Card>

        {/* Account */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Cuenta</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Descargar mis Datos</p>
                <p className="text-sm text-muted-foreground">Obtén una copia de tu información</p>
              </div>
              <Button variant="outline">Descargar</Button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium text-foreground">Eliminar Cuenta</p>
                <p className="text-sm text-muted-foreground">Esta acción es irreversible</p>
              </div>
              <Button variant="outline" className="text-destructive hover:text-destructive bg-transparent">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
