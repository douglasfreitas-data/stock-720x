-- Migration para adicionar valores das variantes (cor, tamanho, etc)
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS values JSONB;
