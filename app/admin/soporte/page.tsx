"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Search, Send, Paperclip, Check, CheckCheck, RefreshCw, Headphones,
  User, Mail, Phone, Building, Calendar, MessageSquare, AlertCircle,
  FileText, Download, Eye, X, CheckCircle2, Clock, HelpCircle, ShieldCheck
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { compressImage } from "@/lib/compress-image"
import { downloadAttachment } from "@/lib/download"
import { MediaLightbox } from "@/components/chat/media-lightbox"

interface SupportTicket {
  id: string;
  conversation_id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    fullName: string;
    companyName: string;
    email: string;
    phone: string;
    role: string;
    registeredAt?: string;
  };
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  adminNotes: string;
  unreadCount: number;
  lastMessage: any;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminSoportePage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [adminId, setAdminId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all")

  // Chat message input & attachments
  const [replyText, setReplyText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [attachment, setAttachment] = useState<{
    url: string;
    type: 'image' | 'pdf' | 'docx' | 'file';
    name: string;
    size?: string;
  } | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const chatScrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedTicketIdRef = useRef(selectedTicketId)
  const prevMsgCountRef = useRef<number>(0)
  const prevTicketIdRef = useRef<string | null>(null)

  useEffect(() => {
    selectedTicketIdRef.current = selectedTicketId
  }, [selectedTicketId])

  // Scroll to bottom of message thread (inside chat container ONLY, never scrolling the browser window)
  useEffect(() => {
    const currentTicket = tickets.find((t) => t.id === selectedTicketId)
    const currentCount = currentTicket?.messages?.length || 0
    const ticketChanged = prevTicketIdRef.current !== selectedTicketId
    const messageCountIncreased = currentCount > prevMsgCountRef.current

    if (ticketChanged || messageCountIncreased || attachment) {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
      }
    }

    prevMsgCountRef.current = currentCount
    prevTicketIdRef.current = selectedTicketId
  }, [selectedTicketId, tickets, attachment])

  // 1. Fetch all support tickets
  const fetchTickets = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true)
    try {
      const res = await fetch(`/api/admin/support/conversations?t=${Date.now()}`, {
        cache: 'no-store'
      })
      if (!res.ok) throw new Error("Error fetching support tickets")
      const data = await res.json()
      if (data.tickets) {
        setTickets(data.tickets)
        if (data.adminId) setAdminId(data.adminId)

        // Select first ticket if none selected
        if (!selectedTicketIdRef.current && data.tickets.length > 0) {
          setSelectedTicketId(data.tickets[0].id)
        }
      }
    } catch (err) {
      console.error("[Admin Support] Error loading tickets:", err)
    } finally {
      setLoading(false)
      if (!silent) setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
    // Periodic sync every 4 seconds
    const interval = setInterval(() => fetchTickets(true), 4000)
    return () => clearInterval(interval)
  }, [fetchTickets])

  // 2. Realtime listener for incoming messages
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("admin-support-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const newMsg = payload.new as any
          if (!newMsg) return

          // Update ticket list state
          setTickets((prev) =>
            prev.map((t) => {
              if (t.conversation_id === newMsg.conversation_id) {
                const isFromAdmin = newMsg.sender_id === adminId
                const updatedMessages = [...t.messages.filter((m) => m.id !== newMsg.id), newMsg]
                return {
                  ...t,
                  messages: updatedMessages,
                  lastMessage: newMsg,
                  unreadCount: isFromAdmin ? t.unreadCount : t.unreadCount + 1,
                  updatedAt: newMsg.created_at,
                }
              }
              return t
            })
          )

          // If current conversation is active, mark read
          if (selectedTicketIdRef.current && newMsg.conversation_id === selectedTicketIdRef.current) {
            if (adminId && newMsg.sender_id !== adminId) {
              fetch("/api/chat/mark-as-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  conversationId: selectedTicketIdRef.current,
                  userId: adminId,
                }),
              }).catch(() => {})
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [adminId])

  // 3. Mark ticket as read when selected
  const handleSelectTicket = async (ticket: SupportTicket) => {
    setSelectedTicketId(ticket.id)
    if (ticket.unreadCount > 0 && adminId) {
      try {
        await fetch("/api/chat/mark-as-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: ticket.id,
            userId: adminId,
          }),
        })
        setTickets((prev) =>
          prev.map((t) => (t.id === ticket.id ? { ...t, unreadCount: 0 } : t))
        )
        window.dispatchEvent(new Event("update-unread-count"))
      } catch (e) {}
    }
  }

  // 4. Update status
  const handleStatusChange = async (newStatus: 'open' | 'in_progress' | 'resolved') => {
    if (!selectedTicketId) return
    try {
      await fetch("/api/admin/support/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedTicketId,
          status: newStatus,
        }),
      })
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicketId ? { ...t, status: newStatus } : t))
      )
    } catch (err) {
      console.error("[Admin Support] Error updating status:", err)
    }
  }

  // 5. Send message as support admin
  const handleSendReply = async (presetText?: string) => {
    const textToSend = presetText || replyText
    if ((!textToSend.trim() && !attachment) || isSending || !selectedTicketId || !adminId) return

    const activeTicket = tickets.find((t) => t.id === selectedTicketId)
    if (!activeTicket) return

    setIsSending(true)
    const currentAttachment = attachment
    const content = textToSend.trim()

    // Optimistic message
    const tempId = `temp-${Date.now()}`
    const optimisticMsg = {
      id: tempId,
      conversation_id: selectedTicketId,
      sender_id: adminId,
      content: content || (currentAttachment?.type === 'image' ? "📷 Foto adjunta" : "📎 Documento adjunto"),
      attachment_url: currentAttachment?.url || null,
      attachment_type: currentAttachment?.type || null,
      read_at: null,
      created_at: new Date().toISOString(),
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? {
              ...t,
              messages: [...t.messages, optimisticMsg],
              lastMessage: optimisticMsg,
              status: t.status === 'open' ? 'in_progress' : t.status,
            }
          : t
      )
    )

    if (!presetText) setReplyText("")
    setAttachment(null)

    try {
      const res = await fetch("/api/chat/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedTicketId,
          productId: null,
          buyerId: activeTicket.userId,
          sellerId: adminId,
          senderId: adminId,
          content,
          attachmentUrl: currentAttachment?.url,
          attachmentType: currentAttachment?.type,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      if (data.message) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === selectedTicketId
              ? {
                  ...t,
                  messages: t.messages.map((m) => (m.id === tempId ? data.message : m)),
                }
              : t
          )
        )
      }
    } catch (error) {
      console.error("[Admin Support] Error sending reply:", error)
      alert("Error al enviar la respuesta. Intenta de nuevo.")
      // Revert optimistic message
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicketId
            ? {
                ...t,
                messages: t.messages.filter((m) => m.id !== tempId),
              }
            : t
        )
      )
      if (!presetText) setReplyText(content)
      setAttachment(currentAttachment)
    } finally {
      setIsSending(false)
    }
  }

  // Handle file select
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert("El archivo no debe exceder los 10 MB.")
      return
    }

    try {
      if (file.type.startsWith("image/")) {
        const compressedBase64 = await compressImage(file, { maxWidth: 1200, quality: 0.85 })
        setAttachment({
          url: compressedBase64,
          type: "image",
          name: file.name,
          size: `${(file.size / 1024).toFixed(0)} KB`,
        })
      } else {
        const reader = new FileReader()
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string
          let fileType: "pdf" | "docx" | "file" = "file"
          if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            fileType = "pdf"
          } else if (file.name.match(/\.(doc|docx)$/i)) {
            fileType = "docx"
          }
          setAttachment({
            url: dataUrl,
            type: fileType,
            name: file.name,
            size: `${(file.size / 1024).toFixed(0)} KB`,
          })
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      console.error("Error loading attachment:", err)
      alert("Error al cargar el archivo adjunto.")
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase().trim()
    const qClean = q.replace(/^#/, "").trim()
    const ticketCode = `chat-${t.id.replace(/-/g, '').slice(0, 8).toLowerCase()}`

    const matchesSearch =
      searchQuery === "" ||
      t.id.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(qClean) ||
      ticketCode.includes(q) ||
      ticketCode.includes(qClean) ||
      `#${ticketCode}`.includes(q) ||
      t.user.name.toLowerCase().includes(q) ||
      t.user.email.toLowerCase().includes(q) ||
      t.user.companyName.toLowerCase().includes(q) ||
      t.messages.some((m) => m.content?.toLowerCase().includes(q))

    const matchesStatus =
      statusFilter === "all" || t.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const activeTicket = tickets.find((t) => t.id === selectedTicketId)

  // Stats
  const totalTickets = tickets.length
  const openCount = tickets.filter((t) => t.status === "open").length
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length
  const unreadTotal = tickets.reduce((acc, t) => acc + (t.unreadCount || 0), 0)

  const PRESET_REPLIES = [
    "¡Hola! Gracias por comunicarte con soporte Agrilpa. ¿En qué podemos apoyarte hoy?",
    "Hemos recibido tu solicitud y estamos revisando los detalles. En breve te damos respuesta.",
    "Tu caso ha sido verificado con éxito. Por favor confirma si todo funciona correctamente.",
    "Hemos dado por resuelta tu consulta. Quedamos a tu completa disposición.",
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Cargando Centro de Soporte...</p>
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
              <Headphones className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Centro de Soporte Agrilpa
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Gestiona y responde las solicitudes de ayuda y asistencia técnica de los usuarios en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTickets(false)}
            disabled={isRefreshing}
            className="rounded-xl gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold text-foreground mt-0.5">{totalTickets}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-amber-200/80 bg-amber-50/40 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-800">Abiertos / Nuevos</p>
              <p className="text-2xl font-bold text-amber-900 mt-0.5">{openCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-blue-200/80 bg-blue-50/40 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-800">En Atención</p>
              <p className="text-2xl font-bold text-blue-900 mt-0.5">{inProgressCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-800">Resueltos</p>
              <p className="text-2xl font-bold text-emerald-900 mt-0.5">{resolvedCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Support Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px] items-start">
        
        {/* Left Column: Tickets List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-[680px] bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          
          {/* Search and Filters */}
          <div className="p-3.5 border-b border-border/80 space-y-2.5 bg-gray-50/60">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuario, correo o texto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-white border-border"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  statusFilter === "all"
                    ? "bg-primary text-white shadow-xs"
                    : "bg-white text-muted-foreground hover:bg-gray-100 border border-border/60"
                }`}
              >
                Todos ({tickets.length})
              </button>
              <button
                onClick={() => setStatusFilter("open")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  statusFilter === "open"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-muted-foreground hover:bg-gray-100 border border-border/60"
                }`}
              >
                Abiertos ({openCount})
              </button>
              <button
                onClick={() => setStatusFilter("in_progress")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  statusFilter === "in_progress"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-muted-foreground hover:bg-gray-100 border border-border/60"
                }`}
              >
                En atención ({inProgressCount})
              </button>
              <button
                onClick={() => setStatusFilter("resolved")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                  statusFilter === "resolved"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-muted-foreground hover:bg-gray-100 border border-border/60"
                }`}
              >
                Resueltos ({resolvedCount})
              </button>
            </div>
          </div>

          {/* Ticket List */}
          <ScrollArea className="flex-1">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs flex flex-col items-center justify-center h-48 gap-2">
                <Headphones className="w-8 h-8 opacity-30" />
                <p>No se encontraron conversaciones de soporte con los filtros aplicados.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredTickets.map((ticket) => {
                  const isSelected = ticket.id === selectedTicketId
                  const lastMsg = ticket.lastMessage
                  const statusColors = {
                    open: "bg-amber-100 text-amber-800 border-amber-200",
                    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
                    resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  }
                  const statusLabels = {
                    open: "Abierto",
                    in_progress: "En atención",
                    resolved: "Resuelto",
                  }

                  return (
                    <button
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`w-full text-left p-3.5 transition-all flex items-start gap-3 hover:bg-gray-50/80 ${
                        isSelected ? "bg-emerald-50/70 border-l-4 border-l-primary" : ""
                      }`}
                    >
                      <Avatar className="w-10 h-10 border border-border/60 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {ticket.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="font-semibold text-xs text-foreground truncate">
                            {ticket.user.name}
                          </h4>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                        </div>

                        <p className="text-[11px] text-muted-foreground truncate mb-1.5 font-normal">
                          {lastMsg?.content || (lastMsg?.attachment_type === 'image' ? "📷 Foto adjunta" : "Nueva consulta")}
                        </p>

                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                                statusColors[ticket.status] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {statusLabels[ticket.status] || "Abierto"}
                            </Badge>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40 font-semibold">
                              #CHAT-{ticket.id.replace(/-/g, '').slice(0, 8).toUpperCase()}
                            </span>
                          </div>

                          {ticket.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-xs animate-pulse">
                              {ticket.unreadCount} nuevo{ticket.unreadCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Column: Chat Console & User Details (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-[680px] bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
          {activeTicket ? (
            <>
              {/* Header: User Info & Status Selector */}
              <div className="p-4 border-b border-border/80 bg-gray-50/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-10 h-10 border border-border shrink-0">
                    <AvatarFallback className="bg-primary/15 text-primary font-bold text-sm">
                      {activeTicket.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground truncate">
                        {activeTicket.user.name}
                      </h3>
                      <Badge variant="outline" className="text-[10px] bg-white border-border text-muted-foreground">
                        {activeTicket.user.companyName}
                      </Badge>
                      <span className="text-[10px] font-mono font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                        #CHAT-{activeTicket.id.replace(/-/g, '').slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-primary/70" />
                        {activeTicket.user.email}
                      </span>
                      {activeTicket.user.phone && activeTicket.user.phone !== "No especificado" && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-primary/70" />
                          {activeTicket.user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Estado:</span>
                  <Select
                    value={activeTicket.status}
                    onValueChange={(val: any) => handleStatusChange(val)}
                  >
                    <SelectTrigger className="h-8 w-36 text-xs rounded-xl bg-white border-border font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open" className="text-xs text-amber-700 font-medium">
                        🟡 Abierto / Pendiente
                      </SelectItem>
                      <SelectItem value="in_progress" className="text-xs text-blue-700 font-medium">
                        🔵 En Atención
                      </SelectItem>
                      <SelectItem value="resolved" className="text-xs text-emerald-700 font-medium">
                        🟢 Resuelto
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message Thread */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FBFBF9]">
                {activeTicket.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-xs py-12 gap-2">
                    <HelpCircle className="w-8 h-8 opacity-30 text-primary" />
                    <p>No hay mensajes registrados aún en este ticket de soporte.</p>
                  </div>
                ) : (
                  activeTicket.messages.map((msg: any) => {
                    const isAdmin = msg.sender_id === adminId
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-muted-foreground">
                          {isAdmin ? (
                            <span className="font-semibold text-primary flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Soporte Agrilpa
                            </span>
                          ) : (
                            <span className="font-semibold text-foreground">
                              {activeTicket.user.name}
                            </span>
                          )}
                          <span>•</span>
                          <span>
                            {msg.created_at
                              ? new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Ahora"}
                          </span>
                        </div>

                        <div
                          className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs space-y-2 ${
                            isAdmin
                              ? "bg-primary text-white rounded-tr-xs"
                              : "bg-white text-foreground border border-border/80 rounded-tl-xs"
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
                                    isAdmin
                                      ? "bg-white/15 border-white/25 text-white"
                                      : "bg-gray-50 border-border text-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <FileText className="w-4 h-4 shrink-0 text-primary" />
                                    <span className="text-xs font-medium truncate">Documento adjunto</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => downloadAttachment(msg.attachment_url, "documento-soporte")}
                                    className={`h-7 px-2 text-xs rounded-lg ${
                                      isAdmin ? "hover:bg-white/20 text-white" : "hover:bg-gray-200"
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

                          {/* Read status */}
                          {isAdmin && (
                            <div className="flex items-center justify-end gap-1 text-[10px] text-white/80 pt-0.5">
                              {msg.read_at ? (
                                <span className="flex items-center gap-0.5 text-emerald-200">
                                  <CheckCheck className="w-3 h-3" /> Leído por usuario
                                </span>
                              ) : (
                                <span className="flex items-center gap-0.5 text-white/70">
                                  <Check className="w-3 h-3" /> Enviado
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
 
               {/* Quick Response Shortcuts */}
               <div className="px-4 py-2.5 bg-gray-50 border-t border-border/70 flex items-center gap-2 overflow-x-auto text-xs shrink-0 no-scrollbar">
                 <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
                   Plantillas:
                 </span>
                 <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                   {PRESET_REPLIES.map((preset, idx) => (
                     <button
                       key={idx}
                       onClick={() => handleSendReply(preset)}
                       disabled={isSending}
                       className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-foreground hover:text-emerald-900 border border-border/80 text-[11px] font-medium transition-all shrink-0 whitespace-nowrap shadow-2xs hover:shadow-xs hover:border-primary/40 active:scale-95"
                       title={preset}
                     >
                       {preset}
                     </button>
                   ))}
                 </div>
               </div>

              {/* Attachment Preview Box */}
              {attachment && (
                <div className="p-2.5 bg-gray-50 border-t border-border flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    {attachment.type === "image" ? (
                      <img
                        src={attachment.url}
                        alt="Preview"
                        className="w-8 h-8 rounded object-cover border"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-primary" />
                    )}
                    <div className="text-xs">
                      <p className="font-semibold text-foreground truncate max-w-xs">
                        {attachment.name}
                      </p>
                      <p className="text-muted-foreground text-[10px]">{attachment.size}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAttachment(null)}
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Reply Input Bar */}
              <div className="p-3 bg-white border-t border-border/80 flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  title="Adjuntar imagen o archivo"
                  className="h-10 w-10 rounded-xl shrink-0 border-border text-muted-foreground hover:text-foreground hover:bg-gray-100"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                <Input
                  placeholder="Escribe una respuesta oficial como Soporte Agrilpa..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendReply()
                    }
                  }}
                  disabled={isSending}
                  className="flex-1 h-10 rounded-xl text-xs bg-gray-50/80 border-border focus:bg-white"
                />

                <Button
                  onClick={() => handleSendReply()}
                  disabled={isSending || (!replyText.trim() && !attachment)}
                  className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-xs shadow-xs gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Responder</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground text-xs p-12 gap-3">
              <div className="p-4 rounded-full bg-gray-100 text-muted-foreground">
                <Headphones className="w-10 h-10 opacity-40" />
              </div>
              <h3 className="font-semibold text-sm text-foreground">Selecciona una conversación de soporte</h3>
              <p className="max-w-sm">
                Haz clic en cualquier ticket de la lista izquierda para ver el historial y responder directamente al usuario.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Lightbox for zooming photos */}
      <MediaLightbox
        imageUrl={previewImage}
        isOpen={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  )
}
