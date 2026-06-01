"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, ChevronLeft, User } from 'lucide-react'
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { getProductById } from "@/lib/products-data"

export default function ChatPage({ params }: { params: { vendorId: string } }) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hola, estoy interesado en tu producto. ¿Tienes disponibilidad?",
      sender: "buyer",
      timestamp: "Hace 5 minutos",
    },
    {
      id: 2,
      text: "¡Hola! Sí, tenemos disponibilidad. ¿Qué cantidad necesitas?",
      sender: "vendor",
      timestamp: "Hace 2 minutos",
    },
  ])

  // Get vendor info from the vendorId
  // In a real app, you would fetch this from your database
  const vendorName = `Vendedor ${params.vendorId}`
  const vendorCompany = "Empresa Agrícola"

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: message,
        sender: "buyer",
        timestamp: "Justo ahora",
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push("/dashboard/mensajes")}
          className="flex items-center gap-2 text-primary hover:underline mb-6 font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a mensajes
        </button>

        {/* Chat Card */}
        <Card className="p-6 flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="border-b border-border pb-4 mb-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{vendorName}</h3>
              <p className="text-sm text-muted-foreground">{vendorCompany}</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "buyer" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-lg p-3 max-w-xs ${
                    msg.sender === "buyer"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "buyer" ? "opacity-75" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Button onClick={handleSendMessage} size="sm" className="gap-2">
              <Send className="w-4 h-4" />
              Enviar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
