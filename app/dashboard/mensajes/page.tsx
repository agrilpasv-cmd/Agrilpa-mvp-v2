import React from 'react'
import { ChatDashboard } from '@/components/chat/chat-dashboard'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Mensajes B2B | Agrilpa',
  description: 'Centro de negociación y mensajería en tiempo real B2B.',
}

export default async function MensajesPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Note: For demonstration/dummy data purposes, if no user is found we can pass a fake ID
  // In production, we'd uncomment this redirect:
  // if (!user) redirect('/login')

  const currentUserId = user?.id || "u1"

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Centro de Negocios</h1>
        <p className="text-muted-foreground text-sm">Gestiona tus negociaciones, envía cotizaciones y cierra tratos en tiempo real.</p>
      </div>
      
      <ChatDashboard currentUserId={currentUserId} />
    </div>
  )
}
