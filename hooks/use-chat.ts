import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Message, Conversation, ChatUser } from '@/types/chat';

export function useChat(conversationId?: string, currentUserId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const supabase = createClient();

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (data && !error) {
      setMessages(data as Message[]);
    }
  }, [conversationId, supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to Realtime Messages & Presence
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    // 1. Message Subscription
    const messageChannel = supabase.channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    // 2. Presence Subscription
    const presenceChannel = supabase.channel(`presence:${conversationId}`);

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineStatus: Record<string, boolean> = {};
        
        Object.keys(state).forEach((key) => {
          // Assume the state contains { user_id: string }
          const presences = state[key] as any[];
          presences.forEach((p) => {
            if (p.user_id) onlineStatus[p.user_id] = true;
          });
        });
        setOnlineUsers(onlineStatus);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [conversationId, currentUserId, supabase]);

  const sendMessage = async (content: string, attachmentUrl?: string, attachmentType?: string) => {
    if (!conversationId || !currentUserId || (!content && !attachmentUrl)) return;
    
    try {
      const response = await fetch('/api/chat/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content,
          senderId: currentUserId,
          attachmentUrl,
          attachmentType
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
    } catch (error) {
      console.error("Error sending message via API:", error);
      throw error;
    }
  };

  const markAsRead = async (messageIds: string[]) => {
    if (!messageIds.length) return;
    
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', messageIds);
  };

  return {
    messages,
    onlineUsers,
    isTyping,
    sendMessage,
    markAsRead
  };
}
