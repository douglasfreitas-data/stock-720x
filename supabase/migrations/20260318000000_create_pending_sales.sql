-- Tabela de Vendas Pendentes (Reservas de Estoque)
CREATE TABLE IF NOT EXISTS pending_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    payment_method TEXT,
    payment_term TEXT,
    operation_type TEXT NOT NULL DEFAULT 'venda_pendente',
    items JSONB NOT NULL, -- Array contendo array de produtos com { productId, quantity, customPrice }
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'canceled'
    observations TEXT,
    user_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE pending_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service Role Full Access Pending Sales" ON pending_sales FOR ALL TO service_role USING (true) WITH CHECK (true);
