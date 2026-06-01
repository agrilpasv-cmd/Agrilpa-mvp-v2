-- Crear tabla de reseñas
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES public.user_products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    purchase_id UUID NOT NULL UNIQUE, -- Una reseña por compra o cotización aceptada
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Permitir a cualquiera ver las reseñas (para mostrarlas en la página del producto)
CREATE POLICY "Las reseñas son visibles para todos" ON public.product_reviews
    FOR SELECT USING (true);

-- Permitir a un usuario autenticado crear una reseña (la API verificará si de verdad es el comprador)
CREATE POLICY "Los usuarios pueden crear reseñas" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Permitir a los usuarios editar sus propias reseñas (opcional)
CREATE POLICY "Los usuarios pueden editar sus propias reseñas" ON public.product_reviews
    FOR UPDATE USING (auth.uid() = buyer_id);

-- Permitir a los usuarios borrar sus propias reseñas
CREATE POLICY "Los usuarios pueden borrar sus propias reseñas" ON public.product_reviews
    FOR DELETE USING (auth.uid() = buyer_id);
