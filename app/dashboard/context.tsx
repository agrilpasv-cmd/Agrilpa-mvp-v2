"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface DashboardContextType {
    counts: {
        publicaciones: number
        cotizaciones: number
        pedidos: number // Keeping for now for backward compatibility if needed temporarily
        compras: number
        ventas: number
        logistica: number
        transacciones: number
        mensajes: number
        perfil: number
        rastrear: number
        contactanos: number
    }
    refreshCounts: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [counts, setCounts] = useState({
        publicaciones: 0,
        cotizaciones: 0,
        pedidos: 0,
        compras: 0,
        ventas: 0,
        logistica: 0,
        transacciones: 0,
        mensajes: 0,
        perfil: 0,
        rastrear: 0,
        contactanos: 0
    })

    const refreshCounts = useCallback(async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        try {
            const res = await fetch("/api/dashboard/sidebar-counts", {
                cache: "no-cache",
                signal: controller.signal
            })
            clearTimeout(timeoutId)
            if (res.ok) {
                const data = await res.json()
                setCounts((prev) => ({ ...prev, ...data }))
            }
        } catch (e: any) {
            if (e.name === 'AbortError') {
                console.warn("[Agrilpa] Sidebar counts fetch timed out")
            } else {
                console.error("Error fetching sidebar counts", e)
            }
        }
    }, [])

    useEffect(() => {
        refreshCounts()
        
        // Detect mobile to adjust polling
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        const intervalTime = isMobile ? 120000 : 60000 // 2min on mobile, 1min on desktop
        
        const interval = setInterval(refreshCounts, intervalTime)
        return () => clearInterval(interval)
    }, [refreshCounts])

    return (
        <DashboardContext.Provider value={{ counts, refreshCounts }}>
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider")
    }
    return context
}
