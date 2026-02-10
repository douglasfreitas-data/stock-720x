-- Create inventory_logs table
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id SERIAL PRIMARY KEY, -- or UUID DEFAULT gen_random_uuid()
    variant_id BIGINT NOT NULL REFERENCES public.product_variants(id),
    old_stock INTEGER,
    new_stock INTEGER NOT NULL,
    delta INTEGER NOT NULL, -- Calculated (new - old)
    reason TEXT NOT NULL,
    observation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) -- Optional connection to Auth user
);

-- Enable RLS
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert (store employees)
CREATE POLICY "Enable insert for authenticated users only"
ON public.inventory_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to read logs
CREATE POLICY "Enable read for authenticated users only"
ON public.inventory_logs
FOR SELECT
TO authenticated
USING (true);
