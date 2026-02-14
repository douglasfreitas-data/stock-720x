# Changelog

Todas as mudanças notáveis do projeto são documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [0.2.3] - 2026-02-14

### Adicionado
- **SearchModal**: Componente de busca fullscreen para mobile (Scan, Entrada, Inventário).
- **Módulo Inventário**: Nova página `/stock/inventory` estática com scanner e ajuste de estoque.
- **Layout Entrada**: Lista de itens compacta e botões de operação reposicionados.

### Corrigido
- **Race Condition Checkout**: Refatoração com `useRef` e limpeza antecipada de carrinho (parcialmente resolvido).

---

## [0.2.2] - 2026-02-10

### Adicionado
- **Modal de Quantidade**: Scan na Entrada de Estoque agora abre modal para escolher quantidade antes de adicionar.
- **Busca Autocomplete**: Campo "busque por nome" com debounce 300ms e dropdown de resultados.
- **Backend Search**: API `GET /api/products?search=` para busca por nome.

---

## [0.2.1] - 2026-02-10

### Adicionado
- **Organização**: Novo `ROADMAP.md` centralizado e guia prático `ai_team_roles`.
- **UX/UI Round 1 & 2**: 11 correções visuais e funcionais.
- **Header**: Ícone de carrinho 🛒 persistente no cabeçalho global.
- **Scanner**: Novo design de overlay para ativação da câmera.
- **Busca por Nome**: Suporte inicial para campo de busca por nome no Scanner.

### Corrigido
- **Next.js 16 Compatibility**: Fix 404 no inventário aguardando `params` (Promise).
- **Scanner Stability**: Proteção contra crashes client-side na entrada de estoque.
- **Visual**: Remoção de sublinhados globais e correção de cores de botões para branco.
- **Acessibilidade**: Botão de ativação de câmera aumentado e centralizado.

---

## [0.2.0] - 2026-02-10

### Adicionado
- **Módulo de Movimentação**: Registro de entradas e saídas via sessões.
- **Tela de Entrada**: Novo fluxo para registro de compras e devoluções.
- **Tela de Ajuste**: Correção de estoque (balanço) com registro de perda/roubo/consumo.
- **Relatórios**: Dashboard de histórico de movimentações detalhado.
- **Dual-Write**: Sincronização em tempo real entre Nuvemshop e Supabase.
- **Busca por Barcode**: API server-side segura para consulta de produtos.

### Corrigido
- Paginação na sincronização Nuvemshop → Supabase (fix 404).
- Inconsistência de estoque entre plataformas.

---

## [Unreleased]

### Adicionado
- Estrutura Next.js 16 com TypeScript para backend (`/app`)
- Integração OAuth2 com Nuvemshop
- API de produtos com busca por código de barras
- API de estoque para baixa automática
- Estrutura de documentação profissional

---

## [0.1.0] - 2026-02-01

### Adicionado
- Mockup PWA completo com 11 telas
- Design system customizado
- Scanner de QR code simulado
- Deploy no Vercel
