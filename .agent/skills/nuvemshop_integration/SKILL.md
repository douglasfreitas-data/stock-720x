---
name: "nuvemshop_integration"
description: "Nuvemshop API integration patterns for Stock-720x"
---

# Nuvemshop Integration Standards

## Goal
Provide consistent patterns for integrating with Nuvemshop API in the Stock-720x project.

## Project Context
Stock-720x is a QR-code-based self-checkout system that integrates with Nuvemshop e-commerce platform for:
- Product synchronization
- Inventory management
- Order processing

## API Endpoints

### Authentication
- OAuth flow via `/api/auth/nuvemshop`
- Callback handling at `/api/auth/nuvemshop/callback`
- Token storage: Supabase `stores` table

### Products
- **Sync endpoint:** `/api/stock`
- **Fetch products:** GET to `https://api.nuvemshop.com.br/v1/{store_id}/products`
- **Update stock:** PUT to `https://api.nuvemshop.com.br/v1/{store_id}/products/{id}/variants/{variant_id}`

### Webhooks
- **Orders webhook:** `/api/webhooks/orders`
- Events: `order/created`, `order/paid`, `order/cancelled`

## Code Patterns

### API Request Template
```typescript
const response = await fetch(
  `https://api.nuvemshop.com.br/v1/${storeId}/endpoint`,
  {
    headers: {
      'Authentication': `bearer ${accessToken}`,
      'User-Agent': 'Stock-720x (contato@example.com)',
      'Content-Type': 'application/json'
    }
  }
);
```

### Error Handling
- Always check for rate limits (429 status)
- Implement retry with exponential backoff
- Log errors to console with context

## File Locations
- Auth logic: `app/src/lib/nuvemshop/auth.ts`
- API routes: `app/src/app/api/`
- Types: `app/src/types/nuvemshop.ts`

## Environment Variables
- `NUVEMSHOP_CLIENT_ID`
- `NUVEMSHOP_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Triggers
- "Sync products"
- "Nuvemshop API"
- "Update inventory"
- "Process order"
