
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
    User,
    Bell,
    Lock,
    Globe,
    CreditCard,
    Shield,
    HelpCircle,
    LogOut,
    Camera
} from "lucide-react"

import ConstructionOverlay from "@/components/dashboard/construction-overlay"

export default function ConfiguracionPage() {
    return (
        <ConstructionOverlay>
            <div className="space-y-6 max-w-5xl mx-auto p-6 pb-16">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight">Configuración</h2>
                    <p className="text-muted-foreground">
                        Administra la configuración de tu cuenta y preferencias.
                    </p>
                </div>
                <Separator className="my-6" />

                <Tabs defaultValue="perfil" className="flex flex-col lg:flex-row gap-8">
                    <aside className="lg:w-1/5">
                        <TabsList className="flex flex-col items-stretch h-auto bg-transparent p-0 space-y-1">
                            <TabsTrigger
                                value="perfil"
                                className="justify-start data-[state=active]:bg-muted hover:bg-muted/50"
                            >
                                <User className="mr-2 h-4 w-4" />
                                Perfil
                            </TabsTrigger>
                            <TabsTrigger
                                value="cuenta"
                                className="justify-start data-[state=active]:bg-muted hover:bg-muted/50"
                            >
                                <Lock className="mr-2 h-4 w-4" />
                                Seguridad
                            </TabsTrigger>
                            <TabsTrigger
                                value="notificaciones"
                                className="justify-start data-[state=active]:bg-muted hover:bg-muted/50"
                            >
                                <Bell className="mr-2 h-4 w-4" />
                                Notificaciones
                            </TabsTrigger>
                            <TabsTrigger
                                value="pagos"
                                className="justify-start data-[state=active]:bg-muted hover:bg-muted/50"
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Métodos de Pago
                            </TabsTrigger>
                            <TabsTrigger
                                value="idioma"
                                className="justify-start data-[state=active]:bg-muted hover:bg-muted/50"
                            >
                                <Globe className="mr-2 h-4 w-4" />
                                Idioma y Región
                            </TabsTrigger>
                        </TabsList>
                    </aside>

                    <div className="flex-1 lg:max-w-2xl">
                        {/* Perfil */}
                        <TabsContent value="perfil" className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Información Pública</h3>
                                <p className="text-sm text-muted-foreground">
                                    Esta información será visible para otros usuarios.
                                </p>
                            </div>
                            <Separator />

                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                                        <User className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                    <Button size="icon" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 shadow-md">
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-medium">Foto de Perfil</h4>
                                    <p className="text-sm text-muted-foreground">
                                        JPG, GIF o PNG. Max 1MB.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Nombre de Usuario</Label>
                                    <Input id="username" defaultValue="agrilpa_admin" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="bio">Biografía</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Cuéntanos un poco sobre ti..."
                                        className="resize-none"
                                        rows={4}
                                        defaultValue="Empresa líder en exportación de granos y semillas desde Bolivia para el mundo."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="website">Sitio Web</Label>
                                    <Input id="website" defaultValue="https://agrilpa.com" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-8">
                                <Button variant="outline">Cancelar</Button>
                                <Button>Guardar Cambios</Button>
                            </div>
                        </TabsContent>

                        {/* Cuenta / Seguridad */}
                        <TabsContent value="cuenta" className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Seguridad de la Cuenta</h3>
                                <p className="text-sm text-muted-foreground">
                                    Gestiona tu contraseña y la seguridad de tu cuenta.
                                </p>
                            </div>
                            <Separator />

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="current-password">Contraseña Actual</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button>Actualizar Contraseña</Button>
                            </div>

                            <Separator className="my-4" />

                            <div>
                                <h4 className="text-base font-medium text-destructive mb-2">Zona de Peligro</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
                                </p>
                                <Button variant="destructive">Eliminar Cuenta</Button>
                            </div>
                        </TabsContent>

                        {/* Notificaciones */}
                        <TabsContent value="notificaciones" className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Preferencias de Notificaciones</h3>
                                <p className="text-sm text-muted-foreground">
                                    Elige qué notificaciones quieres recibir.
                                </p>
                            </div>
                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Notificaciones por Email</h4>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Nuevas Cotizaciones</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Recibe un email cuando un comprador solicite una cotización.
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Actualizaciones de Pedidos</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Recibe notificaciones sobre el estado de tus envíos.
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Newsletter</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Novedades y consejos para mejorar tus ventas.
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </div>

                            <div className="space-y-4 mt-6">
                                <h4 className="text-sm font-medium">Notificaciones Push</h4>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Mensajes Directos</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Notificaciones cuando recibas un mensaje nuevo.
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </ConstructionOverlay>
    )
}
