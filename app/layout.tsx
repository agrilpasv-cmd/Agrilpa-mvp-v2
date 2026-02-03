import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Footer } from "@/components/footer"
import { FooterWrapper } from "@/components/footer-wrapper"
import { NavbarWrapper } from "@/components/navbar-wrapper"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agrilpa - Plataforma Digital de Comercio Agrícola",
  description:
    "Conecta vendedores agrícolas con compradores mayoristas y empresas industriales en todo el mundo. Elimina intermediarios y accede a mercados globales.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
    generator: 'v0.app'
}

function ConditionalFooter({ pathname }: { pathname: string }) {
  const shouldHideFooter =
    pathname.startsWith("/dashboard") || pathname === "/auth" || pathname.startsWith("/productor/registro")

  if (shouldHideFooter) {
    return null
  }

  return <Footer />
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <NavbarWrapper />
        {children}
        <FooterWrapper />
        <Analytics />
      </body>
    </html>
  )
}
