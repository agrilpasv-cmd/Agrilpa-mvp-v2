"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface DashboardContextType {
    counts: {
        publicaciones: number
        cotizaciones: number
        pedidos: number
        logistica: number
        transacciones: number
        mensajes: number
        perfil: number
        rastrear: number
    }
    refreshCounts: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [counts, setCounts] = useState({
        publicaciones: 0,
        cotizaciones: 0,
        pedidos: 0,
        logistica: 0,
        transacciones: 0,
        mensajes: 0,
        perfil: 0,
        rastrear: 0
    })

    const refreshCounts = useCallback(async () => {
        try {
            const res = await fetch("/api/dashboard/sidebar-counts", { cache: "no-store" })
            if (res.ok) {
                const data = await res.json()
                setCounts((prev) => ({ ...prev, ...data }))
            }
        } catch (e) {
            console.error("Error fetching sidebar counts", e)
        }
    }, [])

    useEffect(() => {
        refreshCounts()
        // Keep the polling as a backup, but maybe slower (e.g. 30s) or same 10s
        const interval = setInterval(refreshCounts, 10000)
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
