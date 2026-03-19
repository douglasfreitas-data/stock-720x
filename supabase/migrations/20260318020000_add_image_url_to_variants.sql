-- Migration para adicionar image_url às variantes (fotos de cores específicas)
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS image_url TEXT;
