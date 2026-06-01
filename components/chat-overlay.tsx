"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { X, Send, Paperclip } from 'lucide-react'

interface ChatOverlayProps {
  vendorName: string
  vendorId: string
  productName: string
  onClose: () => void
}

interface Message {
  id: string
  text: string
  sender: "user" | "vendor"
  timestamp: string
}

export function ChatOverlay({ vendorName, vendorId, productName, onClose }: ChatOverlayProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hola! Vi tu publicación de ${productName}. ¿Está disponible?`,
      sender: "user",
      timestamp: "10:30 AM",
    },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: "user",
        timestamp: new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setMessages([...messages, message])
      setNewMessage("")

      // Simulate vendor response
      setTimeout(() => {
        const vendorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "¡Hola! Sí, tenemos disponibilidad. ¿Qué cantidad necesitas?",
          sender: "vendor",
          timestamp: new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
        setMessages((prev) => [...prev, vendorMessage])
      }, 1500)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-end p-4 sm:p-6 animate-in fade-in duration-200">
      <Card className="w-full sm:w-[450px] h-[600px] bg-background border border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-primary text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 bg-white/20 flex items-center justify-center">
              <span className="text-sm font-bold">{vendorName.charAt(0)}</span>
            </Avatar>
            <div>
              <h3 className="font-bold">{vendorName}</h3>
              <p className="text-xs text-white/80">En línea</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-9 w-9"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Product context */}
        <div className="bg-primary/5 border-b border-border p-3">
          <p className="text-xs text-muted-foreground">Consultando sobre:</p>
          <p className="text-sm font-semibold text-foreground">{productName}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  message.sender === "user"
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user" ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage()
                }
              }}
              placeholder="Escribe un mensaje..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-primary hover:bg-primary/90 text-white"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
