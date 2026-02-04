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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDashboard } from "./context"

export default function DashboardShell({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [isAdmin, setIsAdmin] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { counts } = useDashboard()

    useEffect(() => {
        const checkUser = async () => {
            const { createBrowserClient } = await import("@/lib/supabase/client")
            const supabase = createBrowserClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user && user.email === "agrilpasv@gmail.com") {
                setIsAdmin(true)
            }
        }
        checkUser()
    }, [])

    const adminMenuItems = [
        { href: "/inicio", label: "Inicio", icon: Home, notifications: 0 },
        { href: "/dashboard", label: "Admin Dashboard", icon: LayoutDashboard, notifications: 0 },
        { href: "/admin/usuarios", label: "Gestión de Usuarios", icon: Users, notifications: 0 },
        { href: "/admin/publicaciones", label: "Publicaciones", icon: Package, notifications: 0 },
        { href: "/admin/visibilidad", label: "Visibilidad", icon: Eye, notifications: 0 },
        { href: "/admin/reviews", label: "Reviews", icon: Star, notifications: 0 },
        { href: "/admin/suscripciones", label: "Suscripciones", icon: Mail, notifications: 0 },
        { href: "/admin/financiamiento", label: "Financiamiento", icon: DollarSign, notifications: 0 },
        { href: "/admin/logistica", label: "Logística", icon: Truck, notifications: 0 },
        { href: "/admin/compras", label: "Compras Globales", icon: ShoppingCart, notifications: 0 },
        { href: "/admin/contactanos", label: "Contáctanos", icon: MessageSquare, notifications: 0 },
    ]

    const userMenuItems = [
        { href: "/inicio", label: "Inicio", icon: Home, notifications: 0 },
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, notifications: 0 },
        { href: "/dashboard/perfil", label: "Mi Perfil", icon: FileText, notifications: counts.perfil },
        {
            href: "/dashboard/mis-publicaciones",
            label: "Publicaciones",
            icon: Plus,
            notifications: counts.publicaciones,
        },
        {
            href: "/dashboard/cotizaciones",
            label: "Cotizaciones",
            icon: ClipboardList,
            notifications: counts.cotizaciones,
        },
        { href: "/dashboard/ventas", label: "Mis Ventas", icon: Package, notifications: counts.ventas },
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
            icon: FileText,
            notifications: counts.transacciones,
        },
        { href: "/dashboard/mensajes", label: "Mensajes", icon: MessageSquare, notifications: counts.mensajes },
        { href: "/dashboard/configuracion", label: "Configuración", icon: Settings, notifications: 0 },
    ]

    const menuItems = isAdmin ? adminMenuItems : userMenuItems

    const handleLogout = async () => {
        try {
            const { createBrowserClient } = await import("@/lib/supabase/client")
            const supabase = createBrowserClient()

            // Sign out from Supabase
            const { error } = await supabase.auth.signOut()

            if (error) {
                console.error("[v0] Supabase signOut error:", error)
            }

            // Also call the API logout for server-side cleanup
            await fetch("/api/auth/logout", { method: "POST" })

            // Clear all local storage and session storage to ensure complete logout
            localStorage.clear()
            sessionStorage.clear()

            // Wait for cleanup to complete
            await new Promise((resolve) => setTimeout(resolve, 500))

            // Use window.location.replace to prevent back button from restoring session
            window.location.replace("/inicio")
        } catch (error) {
            console.error("[v0] Error al cerrar sesión:", error)
            // Clear storage even on error
            localStorage.clear()
            sessionStorage.clear()
            window.location.replace("/inicio")
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/inicio" className="flex items-center space-x-2">
                            <Image src="/agrilpa-logo.svg" alt="Agrilpa Logo" width={100} height={100} priority />
                        </Link>

                        <div className="hidden md:flex items-center space-x-3">
                            <Link href="/dashboard/perfil">
                                <Button variant="ghost" size="sm">
                                    Mi Perfil
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 bg-transparent"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Cerrar Sesión
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
                {/* Sidebar */}
                <aside
                    className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } md:translate-x-0 fixed md:relative w-64 h-[calc(100vh-64px)] bg-card border-r border-border transition-transform duration-300 ease-in-out z-40 overflow-y-auto`}
                >
                    <div className="p-6">
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
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-hidden">{children}</main>
            </div>
        </div>
    )
}
