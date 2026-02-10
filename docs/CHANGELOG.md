# Changelog

Todas as mudanças notáveis do projeto são documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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
