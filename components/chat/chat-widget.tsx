"use client"

import React, { useState, useEffect } from 'react'
import { MessageCircle, X, Send, Paperclip, Box, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConversationProduct } from '@/types/chat'
import { createClient } from '@/lib/supabase/client'

interface ChatWidgetProps {
  sellerName: string;
  sellerOnline?: boolean;
  product: ConversationProduct;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  buyerId?: string | null;
  vendorId?: string;
}

export function ChatWidget({ sellerName, sellerOnline = true, product, isOpen, setIsOpen, buyerId, vendorId }: ChatWidgetProps) {
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<{content: string, sender: string}[]>([])
  const [isSending, setIsSending] = useState(false)
  const unreadCount = 0 // Future: integrate with Supabase Realtime for unread messages

  useEffect(() => {
    if (!isOpen || !buyerId || !vendorId) return;

    const fetchMessages = async () => {
      try {
        const supabase = createClient();
        
        // Find existing conversation
        const { data: conv } = await supabase
          .from('conversations')
          .select('id')
          .eq('product_id', product.id)
          .eq('buyer_id', buyerId)
          .eq('seller_id', vendorId)
          .maybeSingle();
          
        if (conv) {
          // Fetch messages for this conversation
          const { data: msgs } = await supabase
            .from('messages')
            .select('content, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });
            
          if (msgs && msgs.length > 0) {
            setMessages(msgs.map(m => ({
              content: m.content,
              sender: m.sender_id === buyerId ? 'me' : 'them'
            })));
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [isOpen, buyerId, vendorId, product.id]);

  const PRESET_MESSAGES = [
    "Hola, ¿está disponible?",
    "Me gustaría una cotización.",
    "¿Cuál es el pedido mínimo?"
  ];

  const handleSend = async (presetMessage?: string) => {
    const textToSend = presetMessage || inputValue;
    if (!textToSend.trim() || isSending) return;
    
    if (!buyerId) {
      alert("Por favor inicia sesión para contactar al vendedor.");
      return;
    }

    if (!vendorId) {
      alert("Error: No se pudo identificar al vendedor.");
      return;
    }

    const content = textToSend.trim();
    setIsSending(true);
    
    // Add locally immediately for good UX
    setMessages(prev => [...prev, { content, sender: 'me' }]);
    if (!presetMessage) setInputValue("");

    try {
      const response = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          buyerId,
          sellerId: vendorId,
          senderId: buyerId,
          content
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error al enviar el mensaje. Intenta de nuevo.");
      // Rollback optimistic update
      setMessages(prev => prev.slice(0, -1));
      if (!presetMessage) setInputValue(content);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Widget Content */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-border/50 overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-primary p-4 text-white flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm leading-none mb-1">Negociar con {sellerName}</h3>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${sellerOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                <span className="text-xs text-white/80">{sellerOnline ? 'En línea' : 'Desconectado'}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Sticky Product Context */}
          <div className="bg-gray-50 p-3 border-b border-border/50 flex items-center gap-3">
             <div className="w-10 h-10 rounded bg-white overflow-hidden border border-border/50 shrink-0">
               {product.image ? (
                 <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
               ) : (
                 <Box className="w-5 h-5 m-2.5 text-muted-foreground" />
               )}
             </div>
             <div className="min-w-0 flex-1">
               <h4 className="text-xs font-bold text-foreground truncate">{product.title}</h4>
               <p className="text-xs text-primary font-medium">{product.price} {product.currency} <span className="text-muted-foreground font-normal">/{product.quantity}</span></p>
             </div>
          </div>

          {/* Messages Area */}
          <div className="h-64 p-4 overflow-y-auto flex flex-col gap-3 bg-[#FDFCF8]">
             <div className="flex justify-center">
               <span className="bg-gray-100 text-muted-foreground text-[10px] font-medium px-2 py-1 rounded-full uppercase tracking-wider">Hoy</span>
             </div>
             
             <div className="flex flex-col gap-1 max-w-[85%]">
               <div className="bg-gray-100 rounded-2xl rounded-tl-sm p-3 text-xs text-foreground">
                 <p>¡Hola! Soy el vendedor de <strong>{product.title}</strong>. ¿En qué te puedo ayudar?</p>
               </div>
             </div>

             {messages.length === 0 && (
               <div className="flex flex-col gap-2 mt-4 max-w-[85%] self-end">
                 {PRESET_MESSAGES.map((preset, idx) => (
                   <button 
                     key={idx}
                     onClick={() => handleSend(preset)}
                     className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full px-3 py-1.5 text-xs font-medium text-left transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                   >
                     {preset}
                   </button>
                 ))}
               </div>
             )}

             {messages.map((msg, idx) => (
                <div key={idx} className="flex flex-col gap-1 max-w-[85%] self-end items-end">
                    <div className="bg-primary rounded-2xl rounded-tr-sm p-3 text-xs text-white">
                        <p>{msg.content}</p>
                    </div>
                </div>
             ))}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-border/50">
            <div className="flex items-end gap-2 bg-gray-50 border border-border/50 rounded-xl p-1.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
              <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 rounded-full text-muted-foreground">
                <Paperclip className="w-4 h-4" />
              </Button>
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribe tu consulta..."
                className="w-full max-h-24 min-h-[32px] bg-transparent border-0 focus:ring-0 resize-none py-1.5 text-xs text-foreground"
                rows={1}
                disabled={isSending}
              />
              <Button 
                size="icon" 
                className="shrink-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => handleSend()}
                disabled={isSending}
              >
                {isSending ? <Loader className="w-3 h-3 animate-spin ml-0.5" /> : <Send className="w-3 h-3 ml-0.5" />}
              </Button>
            </div>
          </div>

        </div>
      )}

      {/* Floating Button */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/30 flex items-center justify-center relative transition-transform hover:scale-105"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        
        {/* Unread badge logic can go here */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold">
            {unreadCount}
          </span>
        )}
      </Button>
    </div>
  )
}
