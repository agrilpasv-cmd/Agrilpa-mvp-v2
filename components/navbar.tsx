"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { AuthStorage } from "@/lib/auth-storage"
import { createBrowserClient } from "@/lib/supabase/client"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const session = AuthStorage.getSession()
    if (session) {
      setIsLoggedIn(true)
      setUserRole(session.role)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createBrowserClient()

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("[v0] Supabase signOut error:", error)
      }

      // Also call the API logout for server-side cleanup
      await fetch("/api/auth/logout", { method: "POST" })

      // Clear auth storage and browser storage
      AuthStorage.clearSession()
      localStorage.clear()
      sessionStorage.clear()

      // Wait for cleanup to complete
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Use window.location.replace to prevent back button from restoring session
      window.location.replace("/inicio")
    } catch (error) {
      console.error("[v0] Logout error:", error)
      AuthStorage.clearSession()
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace("/inicio")
    }
  }

  const getPanelUrl = () => {
    return userRole === "admin" ? "/admin" : "/dashboard"
  }

  const navLinks = [
    { href: "/como-funciona", label: "Cómo funciona" },
    { href: "/productos", label: "Productos" },
    { href: "/para-vendedores", label: "Vendedores" },
    { href: "/compradores", label: "Compradores" },
    { href: "/sobre-nosotros", label: "Sobre nosotros" },
    { href: "/contacto", label: "Contáctenos" },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/inicio" className="flex items-center space-x-2">
            <Image src="/agrilpa-logo.svg" alt="Agrilpa Logo" width={100} height={100} priority />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link href={getPanelUrl()}>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-white">
                    <User className="h-4 w-4" />
                    Panel
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 bg-transparent"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" size="sm">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/auth?mode=register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Crear Cuenta
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-muted"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="space-y-2 pt-2 border-t border-border">
              {isLoggedIn ? (
                <>
                  <Link href={getPanelUrl()} className="block">
                    <Button size="sm" className="w-full gap-2 bg-primary hover:bg-primary/90 text-white">
                      <User className="h-4 w-4" />
                      Panel
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 bg-transparent"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth" className="block">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link href="/auth?mode=register" className="block">
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                      Crear Cuenta
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
