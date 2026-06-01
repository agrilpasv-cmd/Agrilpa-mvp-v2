"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"

export function NavbarWrapper() {
  const pathname = usePathname()

  const shouldHideNavbar =
    pathname === "/" ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname === "/auth" ||
    pathname?.startsWith("/productor/registro")

  if (shouldHideNavbar) {
    return null
  }

  return <Navbar />
}

export default NavbarWrapper
