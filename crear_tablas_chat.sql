-- SQL Script para crear las tablas del Chat (B2B)
-- Ejecutar en el Editor SQL de Supabase (SQL Editor)

-- 1. Tabla de conversaciones
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.user_products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, buyer_id, seller_id)
);

-- Habilitar RLS para conversaciones
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Políticas para conversaciones
CREATE POLICY "Usuarios pueden ver sus conversaciones" 
ON public.conversations FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Usuarios pueden insertar conversaciones" 
ON public.conversations FOR INSERT 
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);


-- 2. Tabla de mensajes
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    attachment_type TEXT,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para mensajes
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para mensajes
CREATE POLICY "Usuarios pueden ver mensajes de sus conversaciones" 
ON public.messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

CREATE POLICY "Usuarios pueden insertar mensajes en sus conversaciones" 
ON public.messages FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
  AND auth.uid() = sender_id
);

CREATE POLICY "Usuarios pueden actualizar lectura de mensajes recibidos" 
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
  AND auth.uid() != sender_id
);

-- Trigger para actualizar updated_at en conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET updated_at = now() 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();
