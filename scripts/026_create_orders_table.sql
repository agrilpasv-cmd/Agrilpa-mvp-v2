-- Drop table if it exists to ensure fresh schema application
DROP TABLE IF EXISTS orders CASCADE;

-- Create a unified orders table for all types of transactions
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID, -- Optional, for registered buyers
    seller_id UUID NOT NULL, -- The vendor who receives the sale
    product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT,
    quantity DECIMAL NOT NULL,
    unit_price DECIMAL DEFAULT 0, -- 0 for negotiated quotes until updated
    total_price DECIMAL DEFAULT 0,
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    buyer_phone TEXT,
    shipping_address TEXT,
    status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    origin TEXT DEFAULT 'direct', -- direct, quotation
    quotation_id UUID REFERENCES quotations(id),
    is_read_seller BOOLEAN DEFAULT false,
    is_read_buyer BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Sellers can see orders for their products
CREATE POLICY "Sellers can view their own orders"
    ON orders FOR SELECT
    USING (auth.uid() = seller_id);

-- Policy: Service role can do anything (for our API routes)
CREATE POLICY "Service role has full access to orders"
    ON orders FOR ALL
    USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_seller_id ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_quotation_id ON orders(quotation_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
