"use client"

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ChatWidget } from './chat-widget'
import { useGlobalChat } from './chat-context'
import { createClient } from '@/lib/supabase/client'

export function GlobalChatWrapper() {
  const { activeChat, isOpen, setIsOpen } = useGlobalChat()
  const pathname = usePathname()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUserId(data.user.id)
      }
    })
  }, [])

  if (!activeChat) return null;

  // Don't show the floating widget if the user is in the full chat dashboard
  if (pathname?.startsWith('/dashboard/mensajes')) {
    return null;
  }

  return (
    <ChatWidget 
      sellerName={activeChat.sellerName}
      sellerOnline={activeChat.sellerOnline}
      product={activeChat.product}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      buyerId={currentUserId}
      vendorId={activeChat.vendorId}
    />
  )
}
