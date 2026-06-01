"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
    Menu,
    X,
    LogOut,
    Settings,
    FileText,
    MessageSquare,
    Home,
    ClipboardList,
    Package,
    Truck,
    Plus,
    LayoutDashboard,
    ShoppingCart,
    Users,
    Eye,
    Star,
    Mail,
    DollarSign,
    MousePointer2,
    Crown,
    UserMinus,
    Image as ImageIcon,
    Activity,
    CreditCard,
    Newspaper,
    ListOrdered,
    Receipt,
    ShoppingBag,
    ArrowLeft,
    ArrowRight,
    Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDashboard } from "./context"
import { AuthStorage } from "@/lib/auth-storage"
import { CountryPicker, PhoneCodePicker } from "@/components/ui/country-picker"

export default function DashboardShell({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const { counts } = useDashboard()

    // Profile Setup Wizard states (for incomplete/OAuth registrations)
    const [isVerifyingSession, setIsVerifyingSession] = useState(true)  // block render until DB check completes
    const [isProfileIncomplete, setIsProfileIncomplete] = useState(false)
    const [setupStep, setSetupStep] = useState(1)
    const [isSubmittingSetup, setIsSubmittingSetup] = useState(false)
    const [setupError, setSetupError] = useState("")
    const [setupFormData, setSetupFormData] = useState({
        userType: "vendedor",
        companyName: "",
        companyWebsite: "",
        phoneNumber: "",
        countryCode: "503",
        country: "",
        state: "",
        address: "",
        product1: "",
        product2: "",
        product3: "",
        supplyCountry1: "",
        supplyCountry2: "",
        supplyCountry3: "",
        providerCountry1: "",
        providerCountry2: "",
        providerCountry3: "",
        hasExportCertificates: "",
        doesProvideInternationally: "false",
        volumeRange: "",
        howHeardAboutUs: "",
        howHeardOther: ""
    })

    useEffect(() => {
        // Fast sync from localStorage to avoid long waits for UI rendering
        const localSession = AuthStorage.getSession()
        if (localSession?.role === "admin") {
            setIsAdmin(true)
        }

        const verifySession = async () => {
            try {
                const { createBrowserClient } = await import("@/lib/supabase/client")
                const supabase = createBrowserClient()
                
                // Get the real session from Supabase
                const { data: { session } } = await supabase.auth.getSession()
                
                if (!session?.user) {
                    console.log("[Dashboard] No active session found, redirecting to auth...")
                    AuthStorage.clearSession()
                    router.push("/auth?redirectTo=" + encodeURIComponent(window.location.pathname))
                    return
                }

                // Verify profile for accurate role and completeness check
                const { data: profile } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", session.user.id)
                    .maybeSingle()
                
                let role = "user"
                const isAdminUser = session.user.email === "agrilpasv@gmail.com"
                
                if (!profile) {
                    // Create default profile for OAuth/Google users
                    const { error: insertError } = await supabase
                        .from("users")
                        .insert({
                            id: session.user.id,
                            email: session.user.email || "",
                            full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Usuario Google",
                            user_type: "vendedor", // default type
                            role: isAdminUser ? "admin" : "user",
                        })
                    if (insertError) {
                        console.error("[Dashboard] Error creating default profile for Google user:", insertError)
                    } else {
                        console.log("[Dashboard] Created default profile for Google user")
                        role = isAdminUser ? "admin" : "user"
                        setIsProfileIncomplete(true)
                    }
                } else {
                    role = profile.role || "user"

                    // Admin users skip the setup wizard
                    if (!isAdminUser && role !== "admin") {
                        // Wizard is only considered complete when fields from ALL 3 steps are present:
                        //   Step 1: company_name (required)
                        //   Step 2: phone + country (required)
                        //   Step 3: how_heard_about_us (only written on final submit)
                        const wizardComplete =
                            !!profile.company_name &&
                            !!profile.phone &&
                            !!profile.country &&
                            !!profile.how_heard_about_us

                        if (!wizardComplete) {
                            console.log("[Dashboard] Profile wizard incomplete — showing setup modal")
                            setIsProfileIncomplete(true)
                        }
                    }
                }

                setIsAdmin(isAdminUser || role === "admin")
                
                // Sync to AuthStorage
                AuthStorage.setSession(session.user.id, session.user.email || "", role)
                
            } catch (err) {
                console.error("[Dashboard] Session verification failed:", err)
            }
        }
        
        verifySession().finally(() => setIsVerifyingSession(false))
    }, [router])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        
        // Restrict state and address to letters, numbers, and spaces
        if (name === "state" || name === "address") {
            const filteredValue = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "")
            setSetupFormData(prev => ({
                ...prev,
                [name]: filteredValue
            }))
            return
        }

        setSetupFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        const numericValue = value.replace(/[^\d]/g, "")
        setSetupFormData(prev => ({
            ...prev,
            [name]: numericValue
        }))
    }

    const handleSetupSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmittingSetup(true)
        setSetupError("")

        // Comprehensive Validations
        const alphanumericRegex = /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/
        if (setupFormData.state && !alphanumericRegex.test(setupFormData.state)) {
            setSetupError("El campo Estado / Provincia debe contener letras o números")
            setIsSubmittingSetup(false)
            return
        }
        if (setupFormData.address && !alphanumericRegex.test(setupFormData.address)) {
            setSetupError("La dirección de la empresa debe contener letras o números")
            setIsSubmittingSetup(false)
            return
        }
        if (!setupFormData.product1 && !setupFormData.product2 && !setupFormData.product3) {
            setSetupError("Debe proveer al menos un producto de interés")
            setIsSubmittingSetup(false)
            return
        }
        if (!setupFormData.volumeRange) {
            setSetupError("Por favor selecciona tu volumen de movimiento")
            setIsSubmittingSetup(false)
            return
        }
        if (!setupFormData.howHeardAboutUs) {
            setSetupError("Por favor selecciona cómo te enteraste de nosotros")
            setIsSubmittingSetup(false)
            return
        }
        if (setupFormData.howHeardAboutUs === "Otro" && !setupFormData.howHeardOther) {
            setSetupError("Por favor especifica cómo te enteraste de nosotros")
            setIsSubmittingSetup(false)
            return
        }

        try {
            const { createBrowserClient } = await import("@/lib/supabase/client")
            const supabase = createBrowserClient()
            
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) {
                setSetupError("No se encontró sesión activa. Por favor inicia sesión de nuevo.")
                setIsSubmittingSetup(false)
                return
            }

            const productsOfInterest = [setupFormData.product1, setupFormData.product2, setupFormData.product3].filter(Boolean)
            const supplyCountries = [setupFormData.supplyCountry1, setupFormData.supplyCountry2, setupFormData.supplyCountry3].filter(Boolean)
            const providerCountries = setupFormData.doesProvideInternationally === "true"
                ? [setupFormData.providerCountry1, setupFormData.providerCountry2, setupFormData.providerCountry3].filter(Boolean)
                : []
            const fullPhone = setupFormData.phoneNumber ? `+${setupFormData.countryCode} ${setupFormData.phoneNumber}` : null

            const { error: updateError } = await supabase
                .from("users")
                .update({
                    company_name: setupFormData.companyName || null,
                    company_website: setupFormData.companyWebsite || null,
                    address: setupFormData.address || null,
                    state: setupFormData.state || null,
                    phone: fullPhone,
                    country: setupFormData.country || null,
                    user_type: setupFormData.userType,
                    products_of_interest: productsOfInterest,
                    supply_countries: supplyCountries,
                    provider_countries: providerCountries,
                    has_export_certificates: setupFormData.hasExportCertificates === "true",
                    annual_volume: setupFormData.volumeRange || null,
                    how_heard_about_us: setupFormData.howHeardAboutUs || null,
                    how_heard_other: setupFormData.howHeardOther || null
                })
                .eq("id", session.user.id)

            if (updateError) {
                console.error("[Dashboard] Error updating profile setup:", updateError)
                setSetupError(`Error al guardar perfil: ${updateError.message}`)
                setIsSubmittingSetup(false)
                return
            }

            console.log("[Dashboard] Profile setup completed successfully")
            setIsProfileIncomplete(false)
            
            // Reload page to ensure all components see the updated profile
            window.location.reload()
        } catch (err) {
            console.error("[Dashboard] Setup submit critical error:", err)
            setSetupError("Ocurrió un error inesperado al guardar tu perfil.")
            setIsSubmittingSetup(false)
        }
    }


    const adminMenuItems = [
        { href: "/", label: "Inicio", icon: Home, notifications: 0 },
        { href: "/dashboard", label: "Admin Dashboard", icon: LayoutDashboard, notifications: 0 },
        { href: "/admin/hero", label: "Hero (Banners)", icon: ImageIcon, notifications: 0 },
        { href: "/admin/actividad", label: "Registro de Actividad", icon: Activity, notifications: 0 },
        { href: "/admin/usuarios", label: "Gestión de Usuarios", icon: Users, notifications: 0 },
        { href: "/admin/membresias", label: "Membresías", icon: Crown, notifications: 0 },
        { href: "/admin/cotizaciones", label: "Cotizaciones", icon: ClipboardList, notifications: 0 },
        { href: "/admin/contactar", label: "Contactar", icon: MousePointer2, notifications: 0 },
        { href: "/admin/publicaciones", label: "Publicaciones", icon: Package, notifications: 0 },
        { href: "/admin/visibilidad", label: "Visibilidad", icon: Eye, notifications: 0 },
        { href: "/admin/reviews", label: "Reviews", icon: Star, notifications: 0 },
        { href: "/admin/suscripciones", label: "Suscripciones", icon: CreditCard, notifications: 0 },
        { href: "/admin/financiamiento", label: "Financiamiento", icon: DollarSign, notifications: 0 },
        { href: "/admin/logistica", label: "Logística", icon: Truck, notifications: 0 },
        { href: "/admin/compras", label: "Compras Globales", icon: ShoppingCart, notifications: 0 },
        { href: "/admin/contactanos", label: "Contáctanos", icon: MessageSquare, notifications: counts.contactanos || 0 },
        { href: "/admin/newsletter", label: "Newsletter", icon: Newspaper, notifications: 0 },
        { href: "/admin/bajas", label: "Reportes de Bajas", icon: UserMinus, notifications: 0 },
    ]

    const userMenuItems = [
        { href: "/", label: "Inicio", icon: Home, notifications: 0 },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, notifications: 0 },
        { href: "/dashboard/perfil", label: "Mi Perfil", icon: FileText, notifications: counts.perfil },
        {
            href: "/dashboard/mis-publicaciones",
            label: "Publicaciones",
            icon: Plus,
            notifications: counts.publicaciones,
        },
        {
            href: "/dashboard/mis-solicitudes",
            label: "Solicitudes",
            icon: ListOrdered,
            notifications: 0,
        },
        {
            href: "/dashboard/cotizaciones",
            label: "Cotizaciones",
            icon: ClipboardList,
            notifications: counts.cotizaciones,
        },
        { href: "/dashboard/ventas", label: "Mis Ventas", icon: ShoppingBag, notifications: counts.ventas },
        { href: "/dashboard/compras", label: "Mis Compras", icon: ShoppingCart, notifications: counts.compras },
        {
            href: "/dashboard/logistica",
            label: "Logística",
            icon: Truck,
            notifications: counts.logistica,
        },
        {
            href: "/dashboard/transacciones",
            label: "Transacciones",
            icon: Receipt,
            notifications: counts.transacciones,
        },
        { href: "/dashboard/mensajes", label: "Mensajes", icon: MessageSquare, notifications: counts.mensajes },
        { href: "/dashboard/configuracion", label: "Configuración", icon: Settings, notifications: 0 },
    ]

    const menuItems = isAdmin ? adminMenuItems : userMenuItems

    const handleLogout = async () => {
        if (isLoggingOut) return
        setIsLoggingOut(true)

        try {
            const { createBrowserClient } = await import("@/lib/supabase/client")
            const supabase = createBrowserClient()

            // Sign out from Supabase and clear server-side session in parallel
            await Promise.allSettled([
                supabase.auth.signOut(),
                fetch("/api/auth/logout", { method: "POST" })
            ])

            // Clear all local storage and session storage to ensure complete logout
            localStorage.clear()
            sessionStorage.clear()

            // Use window.location.replace to prevent back button from restoring session
            window.location.replace("/")
        } catch (error) {
            console.error("[Dashboard] Error al cerrar sesión:", error)
            // Clear storage even on error
            localStorage.clear()
            sessionStorage.clear()
            window.location.replace("/")
        } finally {
            setIsLoggingOut(false)
        }
    }

    // Block the entire UI until the DB session check is done.
    // This prevents the race condition where the wizard hadn't appeared yet
    // and the user could briefly see/interact with the dashboard.
    if (isVerifyingSession) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Image src="/agrilpa-logo.svg" alt="Agrilpa" width={140} height={50} priority />
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mt-4" />
                    <p className="text-sm text-muted-foreground">Verificando sesión...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-6 lg:px-10">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image src="/agrilpa-logo.svg" alt="Agrilpa Logo" width={130} height={130} priority />
                        </Link>

                        <div className="hidden md:flex items-center space-x-3">
                            {/* Hide profile link and show only logout when setup is pending */}
                            {!isProfileIncomplete && (
                                <Link href="/dashboard/perfil">
                                    <Button variant="ghost" className="text-base font-medium px-4 py-2">
                                        Mi Perfil
                                    </Button>
                                </Link>
                            )}
                            {isProfileIncomplete && (
                                <span className="text-sm text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                                    ⚠ Completa tu perfil para continuar
                                </span>
                            )}
                            <Button
                                variant="outline"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="text-base font-medium px-4 py-2 gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 bg-transparent disabled:opacity-70"
                            >
                                <LogOut className={`w-4 h-4 ${isLoggingOut ? "animate-spin" : ""}`} />
                                {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted"
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar - locked if profile is incomplete */}
                <aside
                    className={`${
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 fixed md:relative w-64 h-[calc(100vh-64px)] bg-card border-r border-border transition-transform duration-300 ease-in-out z-40 overflow-y-auto`}
                >
                    <div className="p-6">
                        {isProfileIncomplete ? (
                            // Blocked sidebar placeholder
                            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl">🔒</span>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Completa tu perfil para acceder al panel
                                </p>
                            </div>
                        ) : (
                            <nav className="space-y-2">
                                {menuItems.map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors hover:text-primary group"
                                            onClick={() => setIsSidebarOpen(false)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </div>

                                            {item.notifications > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs px-1.5"
                                                >
                                                    {item.notifications > 99 ? "99+" : item.notifications}
                                                </Badge>
                                            )}
                                        </Link>
                                    )
                                })}
                            </nav>
                        )}
                    </div>
                </aside>

                {/* Main Content - blurred and blocked when profile is incomplete */}
                <main className={`flex-1 overflow-auto bg-[#f5f7f5] ${isProfileIncomplete ? "pointer-events-none select-none filter blur-sm" : ""}`}>
                    {children}
                </main>
            </div>

            {/* Modal de Configuración Inicial (Para usuarios Google OAuth nuevos o perfiles incompletos) */}
            {/* Note: backdrop does NOT have onClick to prevent dismissal - modal is mandatory */}
            {isProfileIncomplete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col transition-all transform scale-100">
                        {/* Header */}
                        <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-2xl">
                            <div className="flex flex-col items-center mb-3">
                                <Image src="/agrilpa-logo.svg" alt="Agrilpa" width={140} height={50} priority />
                                <p className="text-sm text-muted-foreground mt-2 text-center">
                                    Completa tu perfil comercial en 3 sencillos pasos para empezar a utilizar tu panel.
                                </p>
                            </div>

                            {/* Step indicators */}
                            <div className="flex items-center gap-1 mt-3">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center flex-1">
                                        <div className={`flex-1 h-2 rounded-full transition-all duration-300 ${setupStep >= step ? "bg-primary" : "bg-gray-200"}`} />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs font-semibold text-primary mt-1 text-right">Paso {setupStep} de 3</p>
                        </div>

                        {setupError && (
                            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                                {setupError}
                            </div>
                        )}

                        {/* Content */}
                        <form onSubmit={handleSetupSubmit} className="p-6 flex-1 space-y-4">
                            {setupStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Tipo de Usuario *</label>
                                        <select name="userType" value={setupFormData.userType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition bg-white">
                                            <option value="vendedor">Vendedor Agrícola</option>
                                            <option value="comprador">Comprador/Distribuidor</option>
                                            <option value="empresa">Empresa Industrial</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Nombre de la Empresa *</label>
                                        <input type="text" name="companyName" value={setupFormData.companyName} onChange={handleInputChange} placeholder="Agro Exportaciones S.A." className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">¿Posee certificados para exportar? *</label>
                                        <select name="hasExportCertificates" value={setupFormData.hasExportCertificates} onChange={handleInputChange} className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white transition ${setupFormData.hasExportCertificates === "" ? "border-amber-400 bg-amber-50" : "border-gray-300"}`} required>
                                            <option value="" disabled>Selecciona una opción...</option>
                                            <option value="true">Sí, tengo certificados de exportación</option>
                                            <option value="false">No, no tengo certificados</option>
                                        </select>
                                        {setupFormData.hasExportCertificates === "" && (
                                            <p className="text-xs text-amber-600 mt-1">⚠ Este campo es obligatorio</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Página web (Opcional)</label>
                                        <input type="text" name="companyWebsite" value={setupFormData.companyWebsite} onChange={handleInputChange} placeholder="www.tuempresa.com" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition" />
                                    </div>
                                </div>
                            )}

                            {setupStep === 2 && (
                                <div className="space-y-4">
                                    <div className="w-full">
                                        <label className="block text-sm font-medium text-foreground mb-2">País *</label>
                                        <CountryPicker
                                            value={setupFormData.country}
                                            syncPhoneCode
                                            onChange={(countryName, phoneCode) => {
                                                setSetupFormData(prev => ({
                                                    ...prev,
                                                    country: countryName,
                                                    ...(phoneCode ? { countryCode: phoneCode } : {}),
                                                }))
                                            }}
                                            placeholder="Selecciona tu país"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Estado / Provincia *</label>
                                        <input type="text" name="state" value={setupFormData.state} onChange={handleInputChange} placeholder="Ej. Antioquia, Texas, San Salvador" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Dirección de la Empresa *</label>
                                        <input type="text" name="address" value={setupFormData.address} onChange={handleInputChange} placeholder="Calle Principal #123" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition" required />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Teléfono *</label>
                                        <div className="flex gap-3">
                                            <PhoneCodePicker
                                                value={setupFormData.countryCode}
                                                onChange={(phoneCode) => setSetupFormData(prev => ({ ...prev, countryCode: phoneCode }))}
                                                className="w-36 shrink-0"
                                            />
                                            <input type="text" name="phoneNumber" value={setupFormData.phoneNumber} onChange={handlePhoneInput} inputMode="numeric" placeholder="00000000" className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition" required />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {setupStep === 3 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            {setupFormData.userType === 'vendedor' 
                                                ? "Productos que Ofreces / Cultivas *" 
                                                : "Productos que Buscas Comprar *"} 
                                            <span className="text-muted-foreground font-normal"> (Ingresa al menos 1)</span>
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input
                                                type="text"
                                                name="product1"
                                                value={setupFormData.product1}
                                                onChange={handleInputChange}
                                                placeholder="ej. Algodón"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                            />
                                            <input
                                                type="text"
                                                name="product2"
                                                value={setupFormData.product2}
                                                onChange={handleInputChange}
                                                placeholder="ej. Mangos"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                            />
                                            <input
                                                type="text"
                                                name="product3"
                                                value={setupFormData.product3}
                                                onChange={handleInputChange}
                                                placeholder="ej. Fertilizantes"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Países de interés comercial (Opcional)</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input
                                                type="text"
                                                name="supplyCountry1"
                                                value={setupFormData.supplyCountry1}
                                                onChange={handleInputChange}
                                                placeholder="ej. México"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                            />
                                            <input
                                                type="text"
                                                name="supplyCountry2"
                                                value={setupFormData.supplyCountry2}
                                                onChange={handleInputChange}
                                                placeholder="ej. Colombia"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                            />
                                            <input
                                                type="text"
                                                name="supplyCountry3"
                                                value={setupFormData.supplyCountry3}
                                                onChange={handleInputChange}
                                                placeholder="ej. Guatemala"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">¿Abastecen o proveen productos de algún país? *</label>
                                        <select
                                            name="doesProvideInternationally"
                                            value={setupFormData.doesProvideInternationally}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white transition mb-3"
                                        >
                                            <option value="false">No</option>
                                            <option value="true">Sí</option>
                                        </select>

                                        {setupFormData.doesProvideInternationally === "true" && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in zoom-in duration-300">
                                                <input
                                                    type="text"
                                                    name="providerCountry1"
                                                    value={setupFormData.providerCountry1}
                                                    onChange={handleInputChange}
                                                    placeholder="Ej. México *"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                                    required={setupFormData.doesProvideInternationally === "true"}
                                                />
                                                <input
                                                    type="text"
                                                    name="providerCountry2"
                                                    value={setupFormData.providerCountry2}
                                                    onChange={handleInputChange}
                                                    placeholder="Ej. Colombia (Opcional)"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                                />
                                                <input
                                                    type="text"
                                                    name="providerCountry3"
                                                    value={setupFormData.providerCountry3}
                                                    onChange={handleInputChange}
                                                    placeholder="Ej. Guatemala (Opcional)"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            Volumen de Movimiento Anual * <span className="text-muted-foreground font-normal">(USD $)</span>
                                        </label>
                                        <select
                                            name="volumeRange"
                                            value={setupFormData.volumeRange}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white transition"
                                            required
                                        >
                                            <option value="">Selecciona un rango</option>
                                            <option value="0-5000">De $0 a $5,000</option>
                                            <option value="5001-50000">De $5,001 a $50,000</option>
                                            <option value="50001-250000">De $50,001 a $250,000</option>
                                            <option value="250001-500000">De $250,001 a $500,000</option>
                                            <option value="500001-1000000">De $500,001 a $1,000,000</option>
                                            <option value="1000000plus">Más de $1,000,000</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">
                                            ¿Cómo se enteró de nosotros? *
                                        </label>
                                        <select
                                            name="howHeardAboutUs"
                                            value={setupFormData.howHeardAboutUs}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white transition mb-3"
                                            required
                                        >
                                            <option value="" disabled>Selecciona una opción</option>
                                            <option value="TikTok">TikTok</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="Reddit">Reddit</option>
                                            <option value="Correo">Correo</option>
                                            <option value="Recomendación de un amigo/colega">Recomendación de un amigo/colega</option>
                                            <option value="Internet">Internet</option>
                                            <option value="Otro">Otro</option>
                                        </select>

                                        {setupFormData.howHeardAboutUs === "Otro" && (
                                            <div className="animate-in fade-in zoom-in duration-300 mt-2">
                                                <input
                                                    type="text"
                                                    name="howHeardOther"
                                                    value={setupFormData.howHeardOther}
                                                    onChange={handleInputChange}
                                                    placeholder="Especifique cómo se enteró"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex gap-3 pt-6 border-t border-border mt-6">
                                {setupStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => { setSetupError(""); setSetupStep(prev => prev - 1) }}
                                        className="flex-1 bg-white border border-gray-300 text-foreground font-semibold py-3.5 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 transition uppercase"
                                    >
                                        <ArrowLeft className="w-5 h-5 mr-1" /> ATRÁS
                                    </button>
                                ) : (
                                    <div className="flex-1" />
                                )}

                                {setupStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const alphanumericRegex = /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/
                                            if (setupStep === 1) {
                                                if (!setupFormData.companyName) {
                                                    setSetupError("Por favor ingresa el nombre de tu empresa")
                                                    return
                                                }
                                                if (setupFormData.hasExportCertificates === "") {
                                                    setSetupError("Por favor indica si posees certificados para exportar")
                                                    return
                                                }
                                            }
                                            if (setupStep === 2) {
                                                if (!setupFormData.country || !setupFormData.state || !setupFormData.address || !setupFormData.phoneNumber) {
                                                    setSetupError("Por favor completa todos los campos de ubicación")
                                                    return
                                                }
                                                if (setupFormData.state && !alphanumericRegex.test(setupFormData.state)) {
                                                    setSetupError("El Estado / Provincia debe contener letras o números")
                                                    return
                                                }
                                                if (setupFormData.address && !alphanumericRegex.test(setupFormData.address)) {
                                                    setSetupError("La dirección debe contener letras o números")
                                                    return
                                                }
                                            }
                                            setSetupError("")
                                            setSetupStep(prev => prev + 1)
                                        }}
                                        className="flex-[2] bg-primary text-white font-semibold py-3.5 rounded-md flex items-center justify-center gap-2 hover:bg-primary/90 transition uppercase"
                                    >
                                        SIGUIENTE PASO <ArrowRight className="w-5 h-5 ml-1" />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmittingSetup}
                                        className="flex-[2] bg-primary text-white font-semibold py-3.5 flex items-center justify-center gap-2 rounded-md hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                                    >
                                        {isSubmittingSetup ? "CREANDO..." : "COMPLETAR REGISTRO"} <ArrowRight className="w-5 h-5 ml-1" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
