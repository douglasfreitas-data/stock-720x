# Planejamento: Refatoração de Responsividade (Desktop)

O aplicativo foi inicialmente estruturado no padrão **Mobile-First**, focando em uma única coluna na interface e botões largos ideais para manuseio touch (PDV na loja física via celular/tablet). Contudo, ao ser acessado via monitores e web browsers desktop, a interface espalha e estica excessivamente os elementos (Listas e Cards full-width), impactando tanto a estética quanto a legibilidade e ergonomia visual.

O objetivo da próxima etapa será refatorar o CSS (adotando media queries padronizadas) e injetar layouts baseados em CSS Grid e Max-Widths, mantendo o App idêntico no Mobile, porém muito mais agradável, produtivo e profissional no computador.

---

## 1. Princípios Básicos e Regras de CSS a serem Adotados
1. **Container Centralizado (`max-width: 1200px`)**: Ao invés de as páginas "esticarem" de ponta a ponta em monitores ultrawide, os modais e painéis do aplicativo terão um tamanho limite (ex: `max-width: 900px` para relatórios, `1200px` para catálogo) sempre centralizados na tela ou exibidos de uma forma natural (como no PDV onde pode ter carrinho lateral fixo).
2. **Media Queries (Desktop >= 768px)**: Mapeamento da classe pai (geralmente `.modal-overlay` e `.modal-body`) para se comportar como uma div flutuante estilo macOS window / painel de controle nos desktops, com sombras (box-shadow) sobrepostas a um fundo fosco neutro em telas grandes.
3. **Conversão Flex para Grid (`display: grid`)**: Tudo que eram listas verticais de `100% width` passarão a ser `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` facilitando múltiplos cards lado a lado automaticamente dependendo da resolução (desde 1 até 5 colunas dinamicamente).

---

## 2. Análise Tela por Tela (Problemas Atuais e Solução Proposta)

### A. Página de Catálogo / Lista de Produtos (`/products`)
* **Problema Atual:** Os cards de produtos ficam enormes (`height` e `width` absurdos em wide). 
* **Solução:** Aplicaremos CSS Grid! No mobile haverá apenas uma coluna (como hoje). No Desktop, a partir de 768px de largura de tela, as colunas vão se preencher lateralmente (`grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`). A barra de pesquisa pode ficar em um Header fixo ou lado-a-lado com opções de filtro.

### B. Tela de PDV - Leitura (Scanner) + Carrinho (`/scan` e `cart`)
* **Problema Atual:** No celular, você lê o QR Code na "tela principal" e depois clica para ir ao carrinho finalizar numa segunda tela. No desktop há sobra de tela inútil em ambas as fases.
* **Solução (Modo PDV / Caixa Fixo):** Transformar em uma tela dividida (Split Screen Left/Right layout) quando detectado um PC. 
  * Canto esquerdo: Leitor contínuo de código de barras físico + barra de pesquisa manual por SKU ou Produto.
  * Canto direito: O Resumo atual do `Carrinho`/Check-out sempre fixo ali (resumo total, observação, botões de pagamento e finalizar). Maior velocidade pro operador de balcão utilizando o teclado e mouse se não for celular/tablet.

### C. Relatórios de Movimentação (`/reports`)
* **Problema Atual:** Linhas muito compridas, dificultando ligar a visão de "Quantidade" ou "Saldo" lá do lado direito da tela ao NOME do item no lado esquerdo.
* **Solução:** Adicionar limite de largura máxima (`max-width: 1024px; margin: 0 auto;`). O próprio cabeçalho contendo filtros de datas, botões HTML, "Entrada" e "Saída" deve transacionar para uma layout Grid Multi-coluna em vez de ficar um em baixo do outro (Flex direction row em telas grandes).

### D. Formulários de Manutenção (Ajuste / Entrada manual de Estoque)
* **Problema Atual:** Telas que tem um simples input ou menu esmagando o tamanho maximo vertical e horizontal. Form input labels e botões ficam tão distantes que afetam a usabilidade.
* **Solução:** A classe `.modal-body` das páginas como `/stock/entry` deverá ganhar um container restrito central de por exemplo `max-width: 500px`. O Botão central de gravar não será da extensão total da tela do computador, mas sim limitado ao escopo do card. Em telas de Desktop ele parecerá um pequeno "Pop-up de diálogo" central.

### E. Vendas Pendentes (`/pending-sales`)
* **Problema Atual:** Se tiver 6 vendas pendentes (reservadas), elas aparecem uma debaixo da outra como blocos horizontais monstruosos de largura cheia.
* **Solução:** Transformar em layout "Cards estilo Trello" e Kanban. Cada pedido vira um Card compacto em Grid (colunas dinâmicas dependendo da resolução), onde botões *Cancelar* e *Finalizar* dividem o card pela base para fácil gerenciamento das filas.

---

## 3. Próximos Passos (Para a Sessão de Design)
Quando você abrir essa próxima sessão, eu focarei nos seguintes arquivos gradativamente nesta ordem:
1. `app/src/app/globals.css` - Inserção universal de regras `@media (min-width: 768px) { ... }` ou `/* Desktop Reset */`. Para transformar elementos flex parent em limits `max-w` globalmente.
2. `app/src/app/(pdv)/products/page.tsx` - O principal teste com os grids de catálogo.
3. `app/src/app/(pdv)/cart/page.tsx` e `/scan/page.tsx` - Estudo para fusão das telas no desktop como um Side-Cart visível e contínuo.
4. Ajuste dos demais `page.tsx` iterativamente (Pending-sales, Entry-form, Reports).
