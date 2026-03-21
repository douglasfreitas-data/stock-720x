# 📝 Regras de Negócio e Funcionamento do Sistema

Este documento centraliza as regras lógicas e o funcionamento técnico do ecossistema **Stock 720x**, servindo como guia para desenvolvedores e administradores.

---

## 1. Arquitetura de Sincronia (Dual-Write)

O sistema opera em um modelo híbrido para garantir que o PDV seja ultra-rápido sem perder a fidelidade com o ERP (Nuvemshop).

- **Supabase (Cache Local)**: Atua como a "memória de curto prazo". Todas as buscas por código de barras e listagens do PDV batem aqui primeiro para resposta instantânea (< 50ms).
- **Nuvemshop (ERP/Master)**: É a "fonte da verdade". Todos os produtos, preços e o estoque mestre residem aqui.
- **Dual-Write**: Sempre que uma venda ou entrada é feita no App, o sistema tenta atualizar a Nuvemshop e o Supabase simultaneamente. 

---

## 2. Máquina de Estados de Pedidos (Webhooks)

A integração com a loja online segue um processo de **"Reserva Física"** para evitar furos de estoque.

### Fluxo de Pedidos Online:
1.  **Pedido Aberto (`open`)**: 
    - O sistema cria uma **"Venda Aberta"** no App.
    - O estoque é **debitado imediatamente** no App como uma **Reserva**, mas a operação fica oculta do caixa físico para não confundir.
2.  **Pedido Pago (`paid` / `closed`)**:
    - A "Venda Aberta" é marcada como **Concluída**.
    - O tipo de movimento muda de `reserva` para `venda_online`. O estoque já foi baixado no passo anterior.
3.  **Pedido Cancelado (`canceled`)**:
    - A "Venda Aberta" é cancelada.
    - O sistema gera um **Estorno de Reserva**, devolvendo automaticamente as unidades ao estoque físico.

---

## 3. Resiliência Offline (Sync Queue)

Para lidar com quedas de internet ou da API da Nuvemshop, o App utiliza o padrão **Local-First**.

- **sync_queue**: Se a atualização na Nuvemshop falhar, a alteração de estoque é gravada em uma "Fila de Sincronização" no Supabase e confirmada localmente.
- **Processamento de Fila**: O Job diário (Cron) processa essa fila (empurrando dados locais para a nuvem) **antes** de qualquer sincronização descendente, evitando que dados novos sejam sobrescritos por estados antigos da API.

---

## 4. Inteligência de Estoque e Alertas

### Limites e Margens:
- **Estoque Crítico**: Quantidade ≤ `min_stock` (definido por variante).
- **Estoque em Atenção**: Quantidade entre `min_stock` e `min_stock + 20%`.
- **Notificações**: Alertas via Web Push nativo são disparados apenas para produtos com controle de estoque ativo.

### Estoque Infinito (∞):
- Produtos marcados na Nuvemshop com `stock_management: false` são tratados como infinitos.
- O sistema **ignora** bloqueios de venda, não gera alertas de reposição e exibe o símbolo **"∞"** nas listas.

---

## 5. Auditoria de Integridade

O sistema possui uma ferramenta administrativa em `/admin/audit` que realiza o cruzamento de dados:
- Varre todas as variantes da Nuvemshop.
- Compara com o estoque refletido no App.
- Aponta divergências e permite o **Ajuste Top-Down** (forçar o App a seguir o ERP) com um clique, registrando o motivo como `auditoria_admin`.

---

## 6. Fluxos do PDV (Frente de Caixa)

- **Vendas Físicas**: Baixa imediata de estoque em ambos os sistemas.
- **Vendas Pendentes (Fiado/Reserva)**: Permite separar produtos para um cliente sem fechar a venda financeira, segurando o estoque físico até a conclusão definitiva.

---

## 7. Relatórios PDF

### Relatório de Movimentação (Entradas/Saídas):
- Geração via **jsPDF** em formato paisagem (A4).
- Agrupamento por dia ou por cliente/fornecedor, com totais parciais e total geral.
- Campos: Data, Cliente/Fornecedor, Operação, **Produto** (até 49-59 caracteres), Qtd, Valor, **Saldo** e Usuário.
- Produtos com `stock_management: false` exibem **∞** no campo "Saldo" ao invés de `0`.

### Relatório de Reposição:
- Duas seções: **Ação Imediata (Crítico)** e **Em Observação (Atenção)**.
- Campo de produto ampliado (até 84 caracteres).
- Apenas produtos com `stock_management: true` e `min_stock > 0` são incluídos.

---

## 8. Etiquetas QR Code (Impressão A4)

- Layout: 2 colunas × 9 linhas = **18 etiquetas por página A4**.
- Cada etiqueta contém: Imagem do produto, Nome (até 3 linhas com fonte dinâmica), Código de barras e QR Code.
- **Coluna da direita rotacionada 180°** via Matriz de Transformação PDF (CTM), garantindo que ao cortar a folha ao meio, ambas as metades possuam a margem para furo do lado correto.
- Linhas guia tracejadas para corte preciso.

---

> **Última Atualização:** 20/03/2026 22:50
