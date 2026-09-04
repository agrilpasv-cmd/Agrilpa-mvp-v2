"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search, MessageCircle, RefreshCw, User, Mail, Phone,
  Building, Package, ExternalLink, ArrowRight,
  FileText, Download, Eye, EyeOff, HelpCircle, Layers,
  Headphones, Check, CheckCheck, Copy, Hash
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { downloadAttachment } from "@/lib/download"
import { MediaLightbox } from "@/components/chat/media-lightbox"

interface PlatformConversation {
  id: string;
  code?: string;
  product_id: string | null;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  is_support: boolean;
  is_seen?: boolean;
  messages_count: number;
  last_message: any;
  messages: any[];
  buyer: {
    id: string;
    code?: string;
    name: string;
    fullName: string;
    companyName: string;
    email: string;
    phone: string;
    role: string;
  };
  seller: {
    id: string;
    code?: string;
    name: string;
    fullName: string;
    companyName: string;
    email: string;
    phone: string;
    role: string;
  };
  product: {
    id: string;
    title: string;
    price: string;
    currency: string;
    image: string;
    unit?: string;
    packaging?: string;
    minOrder?: string;
  } | null;
}

export default function AdminMensajesPage() {
  const [conversations, setConversations] = useState<PlatformConversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Status filter: Todos | No vistos | Vistos
  const [statusFilter, setStatusFilter] = useState<"all" | "unseen" | "seen">("all")
  // Type filter: Todos | Productos | Soporte
  const [typeFilter, setTypeFilter] = useState<"all" | "products" | "support">("all")
  
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const selectedIdRef = useRef(selectedId)

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // 1. Fetch all conversations across the platform
  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true)
    try {
      const res = await fetch(`/api/admin/conversations?t=${Date.now()}`, { cache: "no-store" })
      if (!res.ok) throw new Error("Error al consultar conversaciones")
      const data = await res.json()
      if (data.conversations) {
        setConversations(data.conversations)
        if (!selectedIdRef.current && data.conversations.length > 0) {
          setSelectedId(data.conversations[0].id)
        }
      }
    } catch (err) {
      console.error("[Admin Mensajes] Error loading conversations:", err)
    } finally {
      setLoading(false)
      if (!silent) setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(() => fetchConversations(true), 6000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  // 2. Realtime listener for live updates across all messages
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("admin-platform-messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as any
          if (!newMsg) return

          setConversations((prev) => {
            const exists = prev.some((c) => c.id === newMsg.conversation_id)
            if (!exists) {
              fetchConversations(true)
              return prev
            }
            return prev.map((c) => {
              if (c.id === newMsg.conversation_id) {
                const updatedMsgs = [...c.messages.filter((m) => m.id !== newMsg.id), newMsg]
                const isCurrentActive = c.id === selectedIdRef.current
                return {
                  ...c,
                  messages: updatedMsgs,
                  messages_count: updatedMsgs.length,
                  last_message: newMsg,
                  is_seen: isCurrentActive ? true : false,
                  updated_at: newMsg.created_at || new Date().toISOString(),
                }
              }
              return c
            })
          })

          // Update sidebar badge
          window.dispatchEvent(new Event("update-mensajes-unread-count"))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConversations])

  // Active conversation object
  const activeConv = useMemo(() => {
    return conversations.find((c) => c.id === selectedId) || null
  }, [conversations, selectedId])

  // Scroll to bottom of message thread smoothly when selected chat changes or gets new messages
  useEffect(() => {
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight
    }
  }, [selectedId, activeConv?.messages.length])

  // Mark conversation as seen / unseen
  const handleToggleSeen = async (convId: string, currentSeenState: boolean) => {
    const nextSeenState = !currentSeenState
    try {
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, is_seen: nextSeenState } : c))
      )

      await fetch("/api/admin/conversations/mark-seen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, seen: nextSeenState }),
      })

      // Notify layout sidebar to decrement/increment unread badge
      window.dispatchEvent(new Event("update-mensajes-unread-count"))
    } catch (err) {
      console.error("Error toggling seen status:", err)
    }
  }

  // Handle selecting a conversation
  const handleSelectConversation = async (conv: PlatformConversation) => {
    setSelectedId(conv.id)

    // If unseen, automatically mark as seen upon opening
    if (!conv.is_seen) {
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, is_seen: true } : c))
      )
      try {
        await fetch("/api/admin/conversations/mark-seen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: conv.id, seen: true }),
        })
        window.dispatchEvent(new Event("update-mensajes-unread-count"))
      } catch (err) {
        console.error("Error marking seen on select:", err)
      }
    }
  }

  // Metrics
  const totalConvs = conversations.length
  const totalUnseen = conversations.filter((c) => !c.is_seen).length
  const totalSeen = conversations.filter((c) => c.is_seen).length
  const totalProductChats = conversations.filter((c) => !c.is_support).length
  const totalSupportChats = conversations.filter((c) => c.is_support).length
  const totalMessagesCount = conversations.reduce((sum, c) => sum + (c.messages_count || 0), 0)

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Status filter
      if (statusFilter === "unseen" && conv.is_seen) return false
      if (statusFilter === "seen" && !conv.is_seen) return false

      // Type filter
      if (typeFilter === "products" && conv.is_support) return false
      if (typeFilter === "support" && !conv.is_support) return false

      // Search query (Supports Searching by ID, Code, Names, Emails, Products, Message contents)
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase().trim()
      const qClean = q.replace(/^#/, "").trim()

      const idMatch =
        conv.id?.toLowerCase().includes(q) ||
        conv.id?.toLowerCase().includes(qClean) ||
        conv.code?.toLowerCase().includes(q) ||
        conv.code?.toLowerCase().includes(qClean) ||
        `#${conv.code?.toLowerCase()}`.includes(q) ||
        conv.buyer?.id?.toLowerCase().includes(q) ||
        conv.buyer?.id?.toLowerCase().includes(qClean) ||
        conv.buyer?.code?.toLowerCase().includes(q) ||
        conv.buyer?.code?.toLowerCase().includes(qClean) ||
        conv.seller?.id?.toLowerCase().includes(q) ||
        conv.seller?.id?.toLowerCase().includes(qClean) ||
        conv.seller?.code?.toLowerCase().includes(q) ||
        conv.seller?.code?.toLowerCase().includes(qClean)

      const buyerMatch =
        conv.buyer?.name?.toLowerCase().includes(q) ||
        conv.buyer?.fullName?.toLowerCase().includes(q) ||
        conv.buyer?.email?.toLowerCase().includes(q) ||
        conv.buyer?.companyName?.toLowerCase().includes(q)

      const sellerMatch =
        conv.seller?.name?.toLowerCase().includes(q) ||
        conv.seller?.fullName?.toLowerCase().includes(q) ||
        conv.seller?.email?.toLowerCase().includes(q) ||
        conv.seller?.companyName?.toLowerCase().includes(q)

      const productMatch = conv.product?.title?.toLowerCase().includes(q)

      const msgMatch = conv.messages?.some((m) =>
        m.content?.toLowerCase().includes(q)
      )

      return idMatch || buyerMatch || sellerMatch || productMatch || msgMatch
    })
  }, [conversations, statusFilter, typeFilter, searchQuery])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground font-medium">Cargando Centro de Mensajes de la Plataforma...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Mensajería Global de la Plataforma
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Monitoreo en vivo de todas las negociaciones entre compradores, vendedores y consultas de asistencia con ID único.
          </p>
        </div>

        <Button
          onClick={() => fetchConversations(false)}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="gap-2 bg-white hover:bg-gray-50 border-border self-start sm:self-auto rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-primary" : ""}`} />
          {isRefreshing ? "Sincronizando..." : "Actualizar chats"}
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Chats</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalConvs}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">En toda la plataforma</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Card: No Vistos (con badge y alerta visual) */}
        <Card
          onClick={() => setStatusFilter(statusFilter === "unseen" ? "all" : "unseen")}
          className={`border shadow-xs bg-white cursor-pointer transition-all hover:border-red-300 ${
            statusFilter === "unseen" ? "ring-2 ring-red-500/80 border-red-500" : "border-border/80"
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">No Vistos</p>
                {totalUnseen > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-foreground mt-1 flex items-center gap-2">
                {totalUnseen}
                {totalUnseen > 0 && (
                  <Badge className="bg-red-500 text-white text-[10px] h-5 px-1.5 font-bold">
                    Pendientes
                  </Badge>
                )}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Requieren revisión</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <EyeOff className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chats por Producto</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalProductChats}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Negociaciones B2B</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/80 shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Consultas Soporte</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalSupportChats}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Asistencia directa</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Console: Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Conversations List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[750px] bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
          
          {/* Top Bar: Search, Status Tabs & Type Filter */}
          <div className="p-3.5 border-b border-border/80 bg-gray-50/70 space-y-2.5 shrink-0">
            
            {/* Search Input (Supports ID, Code, Users, Products) */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar por ID (ej. CHAT-..., USR-...), usuario, empresa o producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white text-xs h-9 rounded-xl border-border font-medium"
              />
            </div>

            {/* Row 1: Status Filter Tabs (Todos / No Vistos / Vistos) */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-200/60 rounded-xl">
              <button
                onClick={() => setStatusFilter("all")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === "all"
                    ? "bg-white text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Todos ({totalConvs})
              </button>
              
              <button
                onClick={() => setStatusFilter("unseen")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  statusFilter === "unseen"
                    ? "bg-white text-red-700 shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-red-600"
                }`}
              >
                {totalUnseen > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
                No vistos ({totalUnseen})
              </button>

              <button
                onClick={() => setStatusFilter("seen")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === "seen"
                    ? "bg-white text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Vistos ({totalSeen})
              </button>
            </div>

            {/* Row 2: Secondary Type Filter (Todos / Productos / Soporte) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("all")}
                className="h-6 px-2.5 text-[11px] rounded-lg font-medium whitespace-nowrap shrink-0"
              >
                Todos los tipos
              </Button>
              <Button
                variant={typeFilter === "products" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("products")}
                className="h-6 px-2.5 text-[11px] rounded-lg font-medium whitespace-nowrap shrink-0"
              >
                Productos B2B ({totalProductChats})
              </Button>
              <Button
                variant={typeFilter === "support" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("support")}
                className="h-6 px-2.5 text-[11px] rounded-lg font-medium whitespace-nowrap shrink-0"
              >
                Soporte ({totalSupportChats})
              </Button>
            </div>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground text-xs gap-2">
                <MessageCircle className="w-8 h-8 opacity-30 text-primary" />
                <p>No se encontraron conversaciones con los filtros o ID especificados.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredConversations.map((conv) => {
                  const isSelected = conv.id === selectedId
                  const lastMsg = conv.last_message
                  const isUnseen = !conv.is_seen
                  const convCode = conv.code || `CHAT-${conv.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`

                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full text-left p-3.5 transition-all flex items-start gap-3 hover:bg-gray-50/80 ${
                        isSelected ? "bg-emerald-50/70 border-l-4 border-l-primary" : ""
                      } ${isUnseen ? "bg-red-50/30" : ""}`}
                    >
                      {/* Product or Support Thumbnail */}
                      <div className="relative w-11 h-11 rounded-xl border border-border/70 overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                        {conv.is_support ? (
                          <div className="w-full h-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold">
                            <Headphones className="w-5 h-5" />
                          </div>
                        ) : (
                          <img
                            src={conv.product?.image || "/placeholder.svg"}
                            alt={conv.product?.title || "Producto"}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Unseen indicator dot on thumbnail */}
                        {isUnseen && (
                          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Top: Chat ID Tag & Time */}
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200">
                            #{convCode}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>

                        {/* Users: Buyer -> Seller with respective User IDs */}
                        <div className="flex items-center gap-1 text-xs font-semibold text-foreground truncate mb-1">
                          <span className="truncate text-emerald-950 font-bold" title={`${conv.buyer.name} (${conv.buyer.code || conv.buyer.id})`}>
                            {conv.buyer.name}
                          </span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="truncate text-foreground font-semibold" title={`${conv.seller.name} (${conv.seller.code || conv.seller.id})`}>
                            {conv.seller.name}
                          </span>
                        </div>

                        {/* Product Title or Support Tag */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {conv.is_support ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">
                              Soporte Agrilpa
                            </Badge>
                          ) : (
                            <span className="text-[11px] font-medium text-muted-foreground truncate flex items-center gap-1">
                              <Package className="w-3 h-3 text-primary shrink-0" />
                              <strong className="text-foreground truncate">{conv.product?.title || "Producto"}</strong>
                              {conv.product?.price && <span>• {conv.product.currency}{conv.product.price}</span>}
                            </span>
                          )}
                        </div>

                        {/* Last Message Snippet */}
                        <p className="text-[11px] text-muted-foreground truncate font-normal mb-1.5">
                          {lastMsg?.content || (lastMsg?.attachment_type === "image" ? "📷 Foto adjunta" : "Sin mensajes")}
                        </p>

                        {/* Bottom Tags: Messages Count & Seen Status Badge */}
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium text-foreground">
                              {conv.messages_count} msgs
                            </span>
                            {isUnseen ? (
                              <span className="bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                No visto
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-medium">
                                Visto
                              </span>
                            )}
                          </div>
                          <span>
                            {new Date(conv.updated_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Column: Full Chat Inspection Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[750px] bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
          {activeConv ? (
            <>
              {/* Header: Parties, Product Overview & IDs */}
              <div className="p-4 border-b border-border/80 bg-gray-50/70 space-y-3 shrink-0">
                
                {/* Top Action Bar: Chat Code, Copy Button & Seen Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-white border border-border px-2.5 py-1 rounded-xl shadow-2xs">
                      <Hash className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-mono font-bold text-foreground">
                        {activeConv.code || `CHAT-${activeConv.id.replace(/-/g, '').slice(0, 8).toUpperCase()}`}
                      </span>
                      <button
                        onClick={() => handleCopy(activeConv.code || activeConv.id, "conv-code")}
                        className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                        title="Copiar ID de conversación"
                      >
                        {copiedKey === "conv-code" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {activeConv.is_seen ? (
                      <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-300 font-semibold gap-1 text-xs">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Revisado
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white font-bold gap-1 text-xs animate-pulse">
                        <EyeOff className="w-3.5 h-3.5" />
                        No visto
                      </Badge>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={activeConv.is_seen ? "outline" : "default"}
                    onClick={() => handleToggleSeen(activeConv.id, Boolean(activeConv.is_seen))}
                    className="h-8 text-xs gap-1.5 rounded-xl shadow-2xs font-semibold"
                  >
                    {activeConv.is_seen ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                        Marcar como no visto
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Marcar como visto
                      </>
                    )}
                  </Button>
                </div>

                {/* Product Banner (if product chat) */}
                {!activeConv.is_support && activeConv.product && (
                  <div className="p-3 bg-white rounded-xl border border-border/80 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg border border-border/60 overflow-hidden shrink-0 bg-gray-50">
                        <img
                          src={activeConv.product.image || "/placeholder.svg"}
                          alt={activeConv.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            Producto de Interés
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-foreground truncate mt-0.5">
                          {activeConv.product.title}
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium">
                          Precio: <strong className="text-foreground">{activeConv.product.currency}{activeConv.product.price}</strong> {activeConv.product.unit && `/ ${activeConv.product.unit}`}
                        </p>
                      </div>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 rounded-lg gap-1.5 shrink-0 bg-white hover:bg-emerald-50 hover:text-primary hover:border-primary/40"
                    >
                      <Link href={`/producto/${activeConv.product.id}`} target="_blank">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ver Producto</span>
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Parties Involved: Comprador & Vendedor Cards with Unique User IDs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  
                  {/* Comprador (Iniciador) */}
                  <div className="p-2.5 rounded-xl bg-white border border-border/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        Comprador (Iniciador)
                      </span>
                      
                      {/* Buyer User ID Tag with Copy */}
                      <div className="flex items-center gap-1 bg-gray-50 border border-border/60 px-1.5 py-0.5 rounded text-[10px] font-mono">
                        <span className="font-bold text-foreground">
                          {activeConv.buyer.code || `USR-${activeConv.buyer.id.slice(0, 8)}`}
                        </span>
                        <button
                          onClick={() => handleCopy(activeConv.buyer.code || activeConv.buyer.id, "buyer-code")}
                          className="text-muted-foreground hover:text-foreground"
                          title="Copiar ID de usuario"
                        >
                          {copiedKey === "buyer-code" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <p className="font-bold text-foreground truncate">{activeConv.buyer.name}</p>
                    <div className="text-[11px] text-muted-foreground space-y-0.5">
                      {activeConv.buyer.email && (
                        <p className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">{activeConv.buyer.email}</span>
                        </p>
                      )}
                      {activeConv.buyer.phone && (
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0 text-muted-foreground" />
                          <span>{activeConv.buyer.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vendedor (Receptor) */}
                  <div className="p-2.5 rounded-xl bg-white border border-border/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {activeConv.is_support ? "Soporte Agrilpa" : "Vendedor (Receptor)"}
                      </span>
                      
                      {/* Seller User ID Tag with Copy */}
                      <div className="flex items-center gap-1 bg-gray-50 border border-border/60 px-1.5 py-0.5 rounded text-[10px] font-mono">
                        <span className="font-bold text-foreground">
                          {activeConv.seller.code || `USR-${activeConv.seller.id.slice(0, 8)}`}
                        </span>
                        <button
                          onClick={() => handleCopy(activeConv.seller.code || activeConv.seller.id, "seller-code")}
                          className="text-muted-foreground hover:text-foreground"
                          title="Copiar ID de usuario"
                        >
                          {copiedKey === "seller-code" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <p className="font-bold text-foreground truncate">{activeConv.seller.name}</p>
                    <div className="text-[11px] text-muted-foreground space-y-0.5">
                      {activeConv.seller.email && (
                        <p className="flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 shrink-0 text-muted-foreground" />
                          <span className="truncate">{activeConv.seller.email}</span>
                        </p>
                      )}
                      {activeConv.seller.phone && (
                        <p className="flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0 text-muted-foreground" />
                          <span>{activeConv.seller.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Message Thread (Chronological full view) */}
              <div ref={messagesScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FBFBF9]">
                {activeConv.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-xs py-12 gap-2">
                    <HelpCircle className="w-8 h-8 opacity-30 text-primary" />
                    <p>Esta conversación no registra mensajes intercambiados aún.</p>
                  </div>
                ) : (
                  activeConv.messages.map((msg: any) => {
                    const isFromBuyer = msg.sender_id === activeConv.buyer_id
                    const senderName = isFromBuyer ? activeConv.buyer.name : activeConv.seller.name
                    const senderTag = isFromBuyer
                      ? "COMPRADOR"
                      : (activeConv.is_support ? "SOPORTE" : "VENDEDOR")

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isFromBuyer ? "items-start" : "items-end"}`}
                      >
                        {/* Header: Sender tag, User code and timestamp */}
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-muted-foreground">
                          <span
                            className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                              isFromBuyer
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {senderTag}: {senderName}
                          </span>
                          <span>•</span>
                          <span>
                            {msg.created_at
                              ? new Date(msg.created_at).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Ahora"}
                          </span>
                        </div>

                        {/* Bubble */}
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs space-y-2 ${
                            isFromBuyer
                              ? "bg-white text-foreground border border-border/80 rounded-tl-xs"
                              : "bg-emerald-900 text-white rounded-tr-xs"
                          }`}
                        >
                          {/* Attachment Display */}
                          {msg.attachment_url && (
                            <div className="rounded-xl overflow-hidden mb-1.5">
                              {msg.attachment_type === "image" ? (
                                <div
                                  onClick={() => setPreviewImage(msg.attachment_url)}
                                  className="cursor-pointer group relative rounded-lg overflow-hidden border border-black/10 bg-black/5 max-h-56 flex items-center justify-center"
                                >
                                  <img
                                    src={msg.attachment_url}
                                    alt="Adjunto"
                                    className="object-contain max-h-56 w-full rounded-lg group-hover:scale-105 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-[11px] font-medium">Ver imagen</span>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border ${
                                    isFromBuyer
                                      ? "bg-gray-50 border-border text-foreground"
                                      : "bg-white/15 border-white/25 text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-4 h-4 shrink-0 text-primary" />
                                    <span className="text-xs font-medium truncate">Documento adjunto</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => downloadAttachment(msg.attachment_url, "documento-chat")}
                                    className={`h-7 px-2 text-xs rounded-lg ${
                                      isFromBuyer ? "hover:bg-gray-200" : "hover:bg-white/20 text-white"
                                    }`}
                                  >
                                    <Download className="w-3.5 h-3.5 mr-1" />
                                    Descargar
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Content */}
                          {msg.content && (
                            <p className="whitespace-pre-wrap break-words leading-relaxed">
                              {msg.content}
                            </p>
                          )}

                          {/* Status */}
                          <div className={`flex items-center justify-end gap-1 text-[10px] pt-0.5 ${
                            isFromBuyer ? "text-muted-foreground" : "text-white/80"
                          }`}>
                            {msg.read_at ? (
                              <span className="flex items-center gap-0.5 text-emerald-400 font-medium">
                                <CheckCheck className="w-3 h-3" /> Leído
                              </span>
                            ) : (
                              <span className="flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Entregado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Bottom Footer Info Bar with Full UUIDs */}
              <div className="p-3 bg-gray-50 border-t border-border/80 flex items-center justify-between text-xs text-muted-foreground shrink-0">
                <span className="font-medium">
                  Modo Auditoría y Monitoreo en Tiempo Real
                </span>
                <span className="text-[11px] font-mono">
                  UUID: <code className="bg-white px-1.5 py-0.5 rounded border border-border">{activeConv.id}</code>
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground text-sm gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Ninguna conversación seleccionada</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Selecciona una conversación del listado izquierdo para inspeccionar a los usuarios y el historial completo de mensajes.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Image Lightbox */}
      {previewImage && (
        <MediaLightbox
          isOpen={Boolean(previewImage)}
          onClose={() => setPreviewImage(null)}
          src={previewImage}
          alt="Foto adjunta"
        />
      )}
    </div>
  )
}
