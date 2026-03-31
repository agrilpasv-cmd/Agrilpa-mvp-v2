"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Menu, X, User, LogOut, Plus, AlertCircle } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"
import { AuthStorage } from "@/lib/auth-storage"
import { createBrowserClient } from "@/lib/supabase/client"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [notificationCount, setNotificationCount] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showVenderPopup, setShowVenderPopup] = useState(false)
  const venderPopupRef = useRef<HTMLDivElement>(null)
  const venderButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const session = AuthStorage.getSession()
    if (session) {
      setIsLoggedIn(true)
      setUserRole(session.role)
      fetchNotificationCount()

      // Set up interval to fetch notification count every 60 seconds
      const interval = setInterval(fetchNotificationCount, 60000)
      return () => clearInterval(interval)
    }
  }, [])

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showVenderPopup &&
        venderPopupRef.current &&
        !venderPopupRef.current.contains(event.target as Node) &&
        venderButtonRef.current &&
        !venderButtonRef.current.contains(event.target as Node)
      ) {
        setShowVenderPopup(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showVenderPopup])

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch("/api/notifications/count")
      if (response.ok) {
        const data = await response.json()
        setNotificationCount(data.count || 0)
      }
    } catch (error) {
      console.error("[Navbar] Fetch notification count error:", error)
    }
  }

  const handleLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)

    try {
      const supabase = createBrowserClient()

      // Sign out from Supabase and clear server-side session in parallel
      await Promise.allSettled([
        supabase.auth.signOut(),
        fetch("/api/auth/logout", { method: "POST" })
      ])

      // Clear auth storage and browser storage
      AuthStorage.clearSession()
      localStorage.clear()
      sessionStorage.clear()

      // Use window.location.replace to prevent back button from restoring session
      window.location.replace("/")
    } catch (error) {
      console.error("[Navbar] Logout error:", error)
      AuthStorage.clearSession()
      localStorage.clear()
      sessionStorage.clear()
      window.location.replace("/")
    } finally {
      // If redirection fails for some reason
      setIsLoggingOut(false)
    }
  }

  const getPanelUrl = () => {
    return userRole === "admin" ? "/admin" : "/dashboard"
  }

  const handleVenderClick = () => {
    if (isLoggedIn) {
      router.push("/dashboard/mis-publicaciones/nueva")
    } else {
      setShowVenderPopup(!showVenderPopup)
    }
  }

  const navLinks = [
    { href: "/como-funciona", label: "Cómo funciona" },
    { href: "/productos", label: "Productos" },
  ]

  const contactLink = { href: "/contacto", label: "Contáctenos" }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-6 lg:px-10">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/agrilpa-logo.svg" alt="Agrilpa Logo" width={130} height={130} priority />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-base font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {/* Vender Button */}
            <div className="relative">
              <button
                ref={venderButtonRef}
                onClick={handleVenderClick}
                className="px-4 py-2 text-base font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Vender
              </button>

              {/* Auth Guard Dialog for Vender */}
              <Dialog open={showVenderPopup && !isLoggedIn} onOpenChange={(open) => setShowVenderPopup(open)}>
                <DialogContent className="sm:max-w-md text-center">
                  <DialogHeader className="flex flex-col items-center gap-2">
                    <div className="bg-primary/10 p-3 rounded-full mb-2">
                      <AlertCircle className="w-8 h-8 text-primary" />
                    </div>
                    <DialogTitle className="text-xl">Inicia sesión requerida</DialogTitle>
                    <DialogDescription className="text-center text-base pt-2">
                      Para publicar tus productos, primero debes iniciar sesión o registrarte en Agrilpa.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3 py-4 mt-2">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-lg font-semibold"
                      onClick={() => {
                        setShowVenderPopup(false)
                        router.push("/auth")
                      }}
                    >
                      Iniciar sesión
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-12 text-lg font-semibold"
                      onClick={() => {
                        setShowVenderPopup(false)
                        router.push("/auth?mode=register")
                      }}
                    >
                      Registrarse
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Link
              href={contactLink.href}
              className="px-4 py-2 text-base font-medium text-foreground hover:text-primary transition-colors"
            >
              {contactLink.label}
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link href={getPanelUrl()}>
                  <Button className="text-base font-medium px-4 py-2 gap-2 bg-primary hover:bg-primary/90 text-white relative">
                    <User className="h-4 w-4" />
                    Panel
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="text-base font-medium px-4 py-2 gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 bg-transparent disabled:opacity-70"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className={`h-4 w-4 ${isLoggingOut ? "animate-spin" : ""}`} />
                  {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" size="default">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/auth?mode=register" className="relative group">
                  {pathname === "/" && (
                    <div className="absolute top-full right-0 mt-5 w-72 bg-card border border-primary/20 text-card-foreground p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hidden md:block z-50 animate-in fade-in slide-in-from-top-4 duration-1000">
                      <div className="absolute -top-2.5 right-8 w-5 h-5 bg-card border-t border-l border-primary/20 transform rotate-45"></div>
                      <div className="relative z-10">
                        <p className="font-medium text-center text-sm leading-relaxed">
                          🚀 ¡Únete ahora a <span className="font-bold text-primary">Agrilpa</span> y crea tus publicaciones <span className="font-extrabold text-primary uppercase tracking-wide">GRATIS!</span>
                        </p>
                      </div>
                    </div>
                  )}
                  <Button size="default" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
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

            {/* Vender - Mobile */}
            {isLoggedIn ? (
              <Link
                href="/dashboard/mis-publicaciones/nueva"
                className="block px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Vender
              </Link>
            ) : (
              <div className="px-3 py-3 bg-muted/50 rounded-lg mx-1">
                <p className="text-sm font-semibold text-foreground mb-1">
                  ¿Quieres vender?
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Inicia sesión o crea una cuenta gratis para publicar tus productos.
                </p>
                <div className="flex gap-2">
                  <Link href="/auth" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full bg-transparent text-xs">
                      Iniciar sesión
                    </Button>
                  </Link>
                  <Link href="/auth?mode=register" className="flex-1" onClick={() => setIsOpen(false)}>
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs">
                      Crear Cuenta
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <Link
              href={contactLink.href}
              className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {contactLink.label}
            </Link>

            <div className="space-y-2 pt-2 border-t border-border">
              {isLoggedIn ? (
                <>
                  <Link href={getPanelUrl()} className="block">
                    <Button size="sm" className="w-full gap-2 bg-primary hover:bg-primary/90 text-white relative">
                      <User className="h-4 w-4" />
                      Panel
                      {notificationCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 hover:bg-red-500 hover:text-white hover:border-red-500 active:bg-red-600 bg-transparent disabled:opacity-70"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    <LogOut className={`h-4 w-4 ${isLoggingOut ? "animate-spin" : ""}`} />
                    {isLoggingOut ? "Cerrando..." : "Cerrar Sesión"}
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
