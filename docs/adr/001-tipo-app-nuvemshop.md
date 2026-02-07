# ADR 001: Tipo de Aplicativo Nuvemshop

**Data**: 2026-02-07  
**Status**: ✅ Aceito

## Contexto

A Nuvemshop oferece dois tipos de aplicativos para integração:

| Tipo | Onde Roda | Requisitos |
|------|-----------|------------|
| **Incorporado** | Iframe no Admin | Nimbus + Nexo + React |
| **Externo** | App independente | Apenas OAuth2 + API |

O Stock 720x precisa:
- Rodar como PWA no celular do vendedor
- Usar câmera para scanner de códigos
- Design customizado (mockup já existe)

## Decisão

**Usaremos Aplicativo Externo**.

## Consequências

### Positivas
- ✅ PWA instalável no celular
- ✅ Acesso à câmera para scanner
- ✅ Liberdade de design (mantemos o mockup)
- ✅ Menor complexidade (sem Nimbus/Nexo)

### Negativas
- ❌ Não aparece no menu do Admin Nuvemshop
- ❌ Usuário precisa acessar URL separada
- ❌ Autenticação manual via OAuth2

## Alternativas Consideradas

1. **App Incorporado**: Descartado pois não suporta PWA mobile nem acesso à câmera.
2. **Híbrido**: Criar app incorporado + PWA separado. Descartado por duplicação de esforço.

## Referências

- [DevHub - Aplicativos Externos](https://dev.nuvemshop.com.br/docs/applications/standalone)
- [DevHub - Aplicativos Incorporados](https://dev.nuvemshop.com.br/docs/applications/native)
