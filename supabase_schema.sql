-- Tabela para armazenar as credenciais das lojas Nuvemshop
CREATE TABLE IF NOT EXISTS nuvemshop_stores (
    store_id TEXT PRIMARY KEY,          -- ID da loja na Nuvemshop
    user_id TEXT,                       -- ID do usuário (geralmente igual store_id)
    access_token TEXT NOT NULL,         -- Token de acesso OAuth2
    token_type TEXT DEFAULT 'bearer',
    scope TEXT,                         -- Escopos autorizados
    store_name TEXT,                    -- Nome da loja
    store_url TEXT,                     -- URL pública da loja
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos (cache local)
CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY,              -- ID do produto na Nuvemshop
    store_id TEXT REFERENCES nuvemshop_stores(store_id),
    name JSONB,                         -- Nome em vários idiomas
    handle TEXT,
    images JSONB,                       -- Array de imagens
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Variantes (onde fica o estoque real)
CREATE TABLE IF NOT EXISTS product_variants (
    id BIGINT PRIMARY KEY,              -- ID da variante na Nuvemshop
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    store_id TEXT REFERENCES nuvemshop_stores(store_id),
    sku TEXT,
    barcode TEXT,
    price DECIMAL(10,2),
    stock INTEGER,
    stock_management BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_barcode ON product_variants(barcode);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);

-- RLS para Produtos e Variantes
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service Role Full Access Products" ON products FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Variants" ON product_variants FOR ALL TO service_role USING (true) WITH CHECK (true);


-- Tabela de Logs de Sincronização (opcional, útil para debug)
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id TEXT REFERENCES nuvemshop_stores(store_id),
    entity TEXT, -- 'product', 'order', etc.
    action TEXT, -- 'create', 'update', 'delete'
    status TEXT, -- 'success', 'error'
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_nuvemshop_stores_store_id ON nuvemshop_stores(store_id);
