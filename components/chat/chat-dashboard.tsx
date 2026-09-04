"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreVertical, Paperclip, Send, Check, CheckCheck, FileText, Image as ImageIcon, Box } from "lucide-react"
import { useChat } from '@/hooks/use-chat'
import { Conversation, Message } from '@/types/chat'

// Dummy data for visual representation until hooked up to actual DB
const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    product_id: "p1",
    buyer_id: "u1",
    seller_id: "u2",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    unread_count: 2,
    other_user: {
      id: "u2",
      name: "Agrícola San Juan",
      companyName: "Agrícola San Juan SA",
      isOnline: true
    },
    product: {
      id: "p1",
      title: "Manzana Starking (Exportación)",
      price: "1.20",
      currency: "USD",
      image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=200",
      quantity: "TM"
    },
    last_message: {
      id: "m1",
      conversation_id: "1",
      sender_id: "u2",
      content: "¿Tienen disponibilidad para el próximo mes?",
      created_at: new Date().toISOString()
    }
  },
  {
    id: "2",
    product_id: "p2",
    buyer_id: "u1",
    seller_id: "u3",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    unread_count: 0,
    other_user: {
      id: "u3",
      name: "Distribuidora del Norte",
      companyName: "Distribuidora del Norte",
      isOnline: false,
      lastSeen: "Hace 2 horas"
    },
    product: {
      id: "p2",
      title: "Fertilizante NPK 15-15-15",
      price: "850.00",
      currency: "USD",
      image: "https://images.unsplash.com/photo-1627916538962-d9e8b7a0d481?auto=format&fit=crop&q=80&w=200",
      quantity: "TM"
    },
    last_message: {
      id: "m2",
      conversation_id: "2",
      sender_id: "u1",
      content: "Acabo de enviar la cotización formal adjunta.",
      created_at: new Date().toISOString(),
      read_at: new Date().toISOString()
    }
  }
];

export function ChatDashboard({ currentUserId }: { currentUserId: string }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(DUMMY_CONVERSATIONS[0].id)
  const [conversations, setConversations] = useState<Conversation[]>(DUMMY_CONVERSATIONS)
  const [inputValue, setInputValue] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeConversation = conversations.find(c => c.id === activeConversationId)
  
  // Realtime hook usage (Using dummy data mostly for now, but hook is ready)
  const { messages, onlineUsers, sendMessage } = useChat(activeConversationId || undefined, currentUserId)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || !activeConversationId) return;
    
    try {
      // await sendMessage(inputValue);
      console.log("Sending message via Supabase:", inputValue);
      setInputValue("");
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      
      {/* LEFT SIDEBAR - CONVERSATIONS LIST */}
      <div className="w-full md:w-80 lg:w-96 border-r border-border/50 flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-border/50 bg-white">
          <h2 className="font-bold text-lg text-foreground mb-4">Mensajes B2B</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar empresas o productos..." className="pl-9 rounded-full bg-gray-100 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {conversations.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`p-4 border-b border-border/50 cursor-pointer transition-colors hover:bg-gray-100/50 ${activeConversationId === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                    <AvatarImage src={conv.other_user?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {conv.other_user?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {conv.other_user?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-foreground truncate pr-2">
                      {conv.other_user?.companyName}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      12:30 PM
                    </span>
                  </div>
                  <p className="text-xs text-primary font-medium truncate mb-1">
                    {conv.product?.title}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground truncate pr-2">
                      {conv.last_message?.content}
                    </p>
                    {(conv.unread_count || 0) > 0 && (
                      <Badge className="bg-primary hover:bg-primary rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* RIGHT SIDE - CHAT AREA */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-[#FDFCF8]">
          {/* Chat Header */}
          <div className="h-16 border-b border-border/50 bg-white flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {activeConversation.other_user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-foreground leading-tight">{activeConversation.other_user?.companyName}</h3>
                <p className="text-xs text-muted-foreground">
                  {activeConversation.other_user?.isOnline ? (
                    <span className="text-green-600 font-medium">En línea</span>
                  ) : (
                    `Última vez visto: ${activeConversation.other_user?.lastSeen || 'Recientemente'}`
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Contextual Sticky Product Card */}
          <div className="bg-white px-6 py-3 border-b border-border/50 shadow-sm shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-border/50">
                {activeConversation.product?.image ? (
                  <img src={activeConversation.product.image} alt="Product" className="w-full h-full object-cover" />
                ) : (
                  <Box className="w-6 h-6 m-3 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Negociando</p>
                <h4 className="font-bold text-sm text-foreground line-clamp-1">{activeConversation.product?.title}</h4>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary text-lg leading-tight">
                {activeConversation.product?.price} {activeConversation.product?.currency} <span className="text-xs font-normal text-muted-foreground">/{activeConversation.product?.quantity}</span>
              </p>
              <a href={`/productos/${activeConversation.product?.id}`} className="text-xs font-medium text-primary hover:underline">Ver publicación</a>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
             {/* Date Separator */}
             <div className="flex justify-center">
               <span className="bg-gray-100 text-muted-foreground text-xs font-medium px-3 py-1 rounded-full">Hoy</span>
             </div>

             {/* Dummy Messages */}
             <div className="flex flex-col gap-1 max-w-[80%] mr-auto">
               <div className="bg-white border border-border/50 rounded-2xl rounded-tl-sm p-4 text-sm text-foreground shadow-sm">
                 <p>Hola, estamos muy interesados en su lote de Manzana Starking. ¿Tienen disponibilidad para el próximo mes?</p>
                 <span className="text-[10px] text-muted-foreground mt-2 block text-right">10:42 AM</span>
               </div>
             </div>

             <div className="flex flex-col gap-1 max-w-[80%] ml-auto items-end">
               <div className="bg-primary text-white rounded-2xl rounded-tr-sm p-4 text-sm shadow-md">
                 <p>¡Hola! Gracias por contactarnos. Sí, tenemos disponibilidad de hasta 5 Contenedores de 20ft para envío el próximo mes.</p>
                 <div className="flex items-center justify-end gap-1 mt-2">
                   <span className="text-[10px] text-primary-foreground/80">10:45 AM</span>
                   <CheckCheck className="w-3 h-3 text-white" />
                 </div>
               </div>
             </div>
             
             {/* System/B2B Action Message */}
             <div className="flex justify-center my-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-2 max-w-md text-center">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Se ha enviado una cotización formal. El comprador debe revisarla para proceder con la negociación.</span>
                </div>
             </div>
          </div>

          {/* Quick Actions (B2B Suggestions) */}
          <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
             <Button variant="outline" size="sm" className="rounded-full bg-white h-8 text-xs font-medium border-primary/20 text-primary hover:bg-primary/5">
                Solicitar Cotización
             </Button>
             <Button variant="outline" size="sm" className="rounded-full bg-white h-8 text-xs font-medium border-primary/20 text-primary hover:bg-primary/5">
                Enviar Ficha Técnica
             </Button>
             <Button variant="outline" size="sm" className="rounded-full bg-white h-8 text-xs font-medium border-primary/20 text-primary hover:bg-primary/5">
                Discutir Incoterm
             </Button>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-border/50 shrink-0">
            <div className="flex items-end gap-2 bg-gray-50 border border-border/50 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Button variant="ghost" size="icon" className="shrink-0 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
                <Paperclip className="w-5 h-5" />
              </Button>
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe un mensaje profesional..."
                className="w-full max-h-32 min-h-[40px] bg-transparent border-0 focus:ring-0 resize-none py-2 text-sm text-foreground"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button onClick={handleSend} size="icon" className="shrink-0 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm h-10 w-10">
                <Send className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground mt-2 font-medium">
              Recuerda no compartir información bancaria o contraseñas en el chat.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-700">No hay conversación seleccionada</h3>
          <p className="text-gray-500 mt-2">Selecciona un chat del menú lateral para comenzar a negociar.</p>
        </div>
      )}
    </div>
  )
}
