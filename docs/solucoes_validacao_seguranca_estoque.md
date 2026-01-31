# Soluções de Validação e Segurança para o Sistema de Estoque

> **Documento de Discussão** - Stock 720x  
> Criado em: 26/01/2026

---

## 📋 Objetivo

Implementar um sistema de avaliação/confirmação assistida para garantir que os processos de estoque sejam executados de forma segura, evitando:
- Falhas nos números do estoque
- Problemas no momento de avisar sobre novos pedidos de compra

---

## 1. Validação em Camadas (Defense in Depth)

### a) Validação na Origem (Frontend)

- Antes de confirmar uma venda no PDV, mostrar um **resumo visual** com quantidades atuais vs. pós-venda
- Alertas visuais se a quantidade resultante ficar abaixo do mínimo
- Bloqueio de vendas se estoque ≤ 0 (ou permitir com confirmação explícita para "venda sob encomenda")

### b) Validação no Backend (Transacional)

- Usar **transações atômicas** no Supabase/PostgreSQL para garantir que a leitura do estoque e a baixa aconteçam de forma isolada
- Implementar **optimistic locking** com campo `version` para evitar condições de corrida entre vendas simultâneas

```sql
-- Exemplo de update com optimistic locking
UPDATE produtos 
SET quantidade = quantidade - 1, version = version + 1
WHERE id = $1 AND version = $expected_version
```

---

## 2. Sistema de Reconciliação Automática

| Tipo | Frequência | Ação |
|------|------------|------|
| **Micro-reconciliação** | A cada transação | Validar se quantidade pós-transação = quantidade pré - vendido |
| **Reconciliação diária** | Fim do dia | Comparar estoque local vs. Nuvemshop, gerar relatório de divergências |
| **Auditoria de snapshot** | Semanal | Comparar snapshot do estoque vs. soma de todas as transações |

---

## 3. Alertas Inteligentes de Reposição

### a) Modelo Estático (Simples)

- Definir `estoque_minimo` por produto
- Disparar alerta quando `quantidade <= estoque_minimo`

### b) Modelo Dinâmico (Recomendado)

- Calcular **média de vendas** por período (ex: últimos 30 dias)
- Definir **lead time** do fornecedor (tempo de entrega)
- **Ponto de pedido** = (média diária × lead time) + estoque de segurança

```javascript
// Exemplo de cálculo
const mediaDiariaVendas = vendasUltimos30Dias / 30;
const leadTimeFornecedor = 5; // dias
const estoqueSeguranca = mediaDiariaVendas * 2; // buffer de 2 dias

const pontoPedido = (mediaDiariaVendas * leadTimeFornecedor) + estoqueSeguranca;
```

### Fluxo de Alerta

```
Venda realizada 
    → Estoque atualizado 
    → Verifica ponto de pedido 
    → Se quantidade <= pontoPedido 
        → Gera alerta/sugestão de compra
```

---

## 4. Logs de Auditoria Imutáveis

Criar uma tabela `estoque_log` que registra **toda** movimentação:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Identificador único |
| `produto_id` | UUID | Referência ao produto |
| `quantidade_antes` | INTEGER | Estoque antes da operação |
| `quantidade_depois` | INTEGER | Estoque após a operação |
| `operacao` | ENUM | VENDA_FISICA, VENDA_ONLINE, AJUSTE_INVENTARIO, ENTRADA |
| `origem` | ENUM | PDV_MOBILE, WEBHOOK_NUVEMSHOP, INVENTARIO_MANUAL |
| `usuario_id` | UUID | Quem realizou a operação |
| `created_at` | TIMESTAMP | Momento da operação (imutável) |
| `metadata` | JSONB | Dados adicionais (número do pedido, etc.) |

### Benefícios

- Permite **rastrear** qualquer divergência até sua origem
- Histórico completo para auditoria
- Base para relatórios de movimentação

---

## 5. Confirmação Assistida

### a) Double-check em Vendas Críticas

Para vendas que deixam o estoque abaixo do mínimo:

```
┌─────────────────────────────────────────────────┐
│  ⚠️ ATENÇÃO                                     │
│                                                 │
│  Este produto ficará com apenas 2 unidades.     │
│                                                 │
│  [ ] Adicionar ao pedido de compra pendente     │
│                                                 │
│  [Cancelar]              [Confirmar Venda]      │
└─────────────────────────────────────────────────┘
```

### b) Validação Cruzada com Inventário Físico

Antes de gerar pedido de compra automático, o sistema pode solicitar **confirmação visual via câmera**:

> *"O sistema indica 5 unidades de Produto X. Por favor, escaneie a prateleira para confirmar."*

Isso evita pedidos desnecessários por divergências entre estoque físico e digital.

### c) Dashboard de Saúde do Estoque

| Indicador | Cor | Significado |
|-----------|-----|-------------|
| 🟢 Verde | Estoque saudável | > 50% do estoque ideal |
| 🟡 Amarelo | Atenção | Entre ponto de pedido e 50% |
| 🔴 Vermelho | Crítico | Abaixo do ponto de pedido |

#### Alertas Proativos

- *"Baseado no ritmo de vendas, Produto Y esgotará em 3 dias"*
- *"Fornecedor X tem lead time de 5 dias - fazer pedido agora"*

---

## 6. Fluxo de Pedido de Compra Assistido

```
┌────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ Estoque baixo  │────▶│ Sistema sugere  │────▶│ Usuário aprova   │
│ detectado      │     │ qtd. e fornec.  │     │ ou ajusta        │
└────────────────┘     └─────────────────┘     └──────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │ Pedido gerado   │◀─────────────┘
                       │ e registrado    │
                       └─────────────────┘
```

### Níveis de Autonomia (Configurável)

| Nível | Comportamento |
|-------|---------------|
| **Manual** | Apenas alerta, usuário decide tudo |
| **Sugestivo** | Sugere quantidades baseado em histórico |
| **Semi-automático** | Gera pedidos pendentes para aprovação |
| **Automático** | Gera e envia pedidos automaticamente |

---

## 📊 Perguntas para Refinamento

Antes de implementar, precisamos definir:

1. **Volume de vendas diário** (físico e online) - Define granularidade das validações
2. **Quantidade de fornecedores** - Pedidos agrupados ou individuais?
3. **Frequência do inventário físico** - Define agressividade da reconciliação
4. **Vendas simultâneas são comuns?** - Define necessidade de locks mais robustos
5. **Nível de autonomia desejado** - Alertar, sugerir ou automatizar?

---

## 🗓️ Próximos Passos

- [ ] Definir respostas às perguntas acima
- [ ] Priorizar funcionalidades (MVP vs. futuro)
- [ ] Modelar tabelas de banco de dados
- [ ] Implementar camada de validação
- [ ] Criar dashboard de monitoramento

---

*Documento em evolução - atualizar conforme decisões forem tomadas.*
