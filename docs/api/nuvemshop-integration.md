# Documentação de API

## Integração Nuvemshop

### Autenticação OAuth2

#### Iniciar Login
```http
GET /api/auth/login
```
Redireciona para página de autorização da Nuvemshop.

#### Callback
```http
GET /api/auth/callback?code={code}&state={state}
```
Recebe código de autorização e troca por access_token.

---

### Produtos

#### Listar Produtos
```http
GET /api/products?page=1
```

**Response:**
```json
{
  "products": [...],
  "page": 1
}
```

#### Buscar por Código de Barras
```http
GET /api/products?barcode=7891234567890
```

**Response:**
```json
{
  "product": { "id": 123, "name": { "pt": "Camiseta" } },
  "variant": { "id": 456, "barcode": "7891234567890", "stock": 10 }
}
```

---

### Estoque

#### Baixa de Estoque (Venda)
```http
POST /api/stock
Content-Type: application/json

{
  "barcode": "7891234567890",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "product": "Camiseta",
  "previous_stock": 10,
  "sold": 1,
  "new_stock": 9
}
```

#### Atualizar Estoque Direto
```http
PUT /api/stock
Content-Type: application/json

{
  "product_id": 123,
  "variant_id": 456,
  "stock": 50
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 401 | Não autenticado com Nuvemshop |
| 404 | Produto não encontrado |
| 500 | Erro interno |
