"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowUpRight, ArrowDownLeft, Search, Calendar } from 'lucide-react'

const transactions = [
  {
    id: 1,
    type: "venta",
    producto: "Tomates Frescos (100kg)",
    cliente: "Distribuidora Nacional",
    cantidad: "$1,200",
    fecha: "2024-11-13",
    estado: "Completada",
  },
  {
    id: 2,
    type: "compra",
    producto: "Insumos Agrícolas",
    cliente: "Proveedor Agrícola S.A.",
    cantidad: "$450",
    fecha: "2024-11-12",
    estado: "Completada",
  },
  {
    id: 3,
    type: "venta",
    producto: "Maíz Premium (250kg)",
    cliente: "Industria de Alimentos",
    cantidad: "$2,800",
    fecha: "2024-11-11",
    estado: "Pendiente de Pago",
  },
  {
    id: 4,
    type: "venta",
    producto: "Papas Selectas (150kg)",
    cliente: "Cadena de Supermercados",
    cantidad: "$800",
    fecha: "2024-11-10",
    estado: "Completada",
  },
]

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchTerm.toLowerCase())

    const txDate = new Date(tx.fecha)
    const matchesDateRange = 
      (!startDate || txDate >= new Date(startDate)) &&
      (!endDate || txDate <= new Date(endDate))

    return matchesSearch && matchesDateRange
  })

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mis Transacciones</h1>
          <p className="text-muted-foreground">Historial de compras y ventas</p>
        </div>

        <Card className="mb-6 p-6">
          <h3 className="font-semibold mb-4">Filtros de Búsqueda</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por producto, cliente, tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Fecha inicial"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Fecha final"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Tipo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Producto/Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Monto</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No se encontraron transacciones
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {tx.type === "venta" ? (
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5 text-red-600" />
                          )}
                          <span className="text-sm font-medium text-foreground capitalize">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{tx.producto}</p>
                          <p className="text-sm text-muted-foreground">{tx.cliente}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">{tx.cantidad}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{tx.fecha}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={tx.estado === "Completada" ? "default" : "secondary"}
                          className={
                            tx.estado === "Completada"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          }
                        >
                          {tx.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
