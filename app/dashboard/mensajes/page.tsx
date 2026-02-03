"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Send, Calendar } from 'lucide-react'
import { useState } from "react"

const conversations = [
  {
    id: 1,
    name: "Juan López",
    empresa: "Distribuidora Nacional",
    mensaje: "Hola, necesito más información sobre el envío...",
    fecha: "Hace 2 horas",
    noLeidos: 2,
    avatar: "JL",
  },
  {
    id: 2,
    name: "María García",
    empresa: "Industria de Alimentos",
    mensaje: "¿Cuál es el precio por mayor para 500kg?",
    fecha: "Hace 5 horas",
    noLeidos: 0,
    avatar: "MG",
  },
  {
    id: 3,
    name: "Carlos Mendez",
    empresa: "Cadena de Supermercados",
    mensaje: "Los productos llegaron perfectos, gracias",
    fecha: "Hace 1 día",
    noLeidos: 0,
    avatar: "CM",
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [message, setMessage] = useState("")
  
  const [searchTerm, setSearchTerm] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.mensaje.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Mensajes</h1>
          <p className="text-muted-foreground">Comunícate con tus clientes</p>
        </div>

        <Card className="mb-6 p-6">
          <h3 className="font-semibold mb-4">Filtros de Búsqueda</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, empresa..."
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

        {/* Messages Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="p-4 overflow-y-auto">
            <div className="space-y-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron conversaciones
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation.id === conv.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold">{conv.name}</p>
                      {conv.noLeidos > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">{conv.noLeidos}</span>
                      )}
                    </div>
                    <p className="text-sm opacity-75 line-clamp-1">{conv.empresa}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 p-6 flex flex-col">
            <div className="border-b border-border pb-4 mb-4">
              <h3 className="text-lg font-semibold text-foreground">{selectedConversation.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedConversation.empresa}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 max-w-xs">
                  <p className="text-foreground">{selectedConversation.mensaje}</p>
                  <p className="text-xs text-muted-foreground mt-1">{selectedConversation.fecha}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-xs">
                  <p>{"..."}</p>
                  <p className="text-xs opacity-75 mt-1">Hace 1 hora</p>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
              />
              <Button size="sm" className="gap-2">
                <Send className="w-4 h-4" />
                Enviar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
