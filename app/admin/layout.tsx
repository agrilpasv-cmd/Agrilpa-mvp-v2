"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Menu,
  X,
  LogOut,
  Users,
  Shield,
  Home,
  Star,
  Mail,
  DollarSign,
  Truck,
  ShoppingCart,
  MessageSquare,
  Package,
  Eye,
  LayoutDashboard,
  ClipboardList,
  MousePointer2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const menuItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/usuarios", label: "Gestión de Usuarios", icon: Users },
    { href: "/admin/cotizaciones", label: "Cotizaciones", icon: ClipboardList },
    { href: "/admin/contactar", label: "Contactar", icon: MousePointer2 },
    { href: "/admin/publicaciones", label: "Publicaciones", icon: Package },
    { href: "/admin/visibilidad", label: "Visibilidad", icon: Eye },
    { href: "/admin/reviews", label: "Reviews", icon: Star },
    { href: "/admin/suscripciones", label: "Suscripciones", icon: Mail },
    { href: "/admin/financiamiento", label: "Financiamiento", icon: DollarSign },
    { href: "/admin/logistica", label: "Logística", icon: Truck },
    { href: "/admin/compras", label: "Compras", icon: ShoppingCart },
    { href: "/admin/contactanos", label: "Contáctanos", icon: MessageSquare },
  ]

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
      window.location.replace("/")
    } catch (error) {
      console.error("[v0] Error al cerrar sesión:", error)
      // Clear storage even on error
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace("/")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/agrilpa-logo.svg" alt="Agrilpa Logo" width={100} height={100} priority />
              <span className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary">
                <Shield className="w-4 h-4" />
                Admin
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-3">
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
          className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative w-64 h-[calc(100vh-64px)] bg-card border-r border-border transition-transform duration-300 ease-in-out z-40 overflow-y-auto`}
        >
          <div className="p-6">
            <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Panel de Admin</span>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors hover:text-primary group"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-start hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 bg-transparent"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
