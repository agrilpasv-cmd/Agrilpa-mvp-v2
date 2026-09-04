"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { ConversationProduct } from '@/types/chat'
import { usePathname } from 'next/navigation'

interface ActiveChat {
  sellerName: string;
  sellerOnline: boolean;
  product: ConversationProduct;
  vendorId: string;
}

interface ChatContextType {
  activeChat: ActiveChat | null;
  isOpen: boolean;
  setActiveChat: (chat: ActiveChat | null) => void;
  setIsOpen: (isOpen: boolean) => void;
  openChat: (chat: ActiveChat) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const openChat = (chat: ActiveChat) => {
    setActiveChat(chat)
    setIsOpen(true)
  }

  // Hide or close logic can be handled here if needed

  return (
    <ChatContext.Provider value={{ activeChat, isOpen, setActiveChat, setIsOpen, openChat }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useGlobalChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useGlobalChat must be used within a ChatProvider')
  }
  return context
}
