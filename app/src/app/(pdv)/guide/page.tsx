'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, BookOpen, ArrowLeft } from 'lucide-react';

// Hardcoded guide sections derived from the GUIA_USUARIO.md
const guideSections = [
    {
        title: '1. Instalação',
        content: `O Stock 720x funciona como um aplicativo no seu celular.
        
- Ao acessar o sistema pela primeira vez, um aviso de **"Adicionar à tela inicial"** aparecerá na parte inferior da tela inicial.
- Clique no botão e siga as instruções para adicionar o ícone à sua tela de início.
- Caso o aviso não apareça, instale manualmente:
  - **No iPhone:** Clique no ícone de "Compartilhar" (quadrado com seta) e escolha **"Adicionar à Tela de Início"**.
  - **No Android:** Clique nos três pontinhos e escolha **"Adicionar à tela inicial"**.`
    },
    {
        title: '2. Realizando Vendas',
        content: `Como registrar a saída de um produto entregue ao cliente:
- Na tela inicial, clique em **"Vender"**.
- Aponte a câmera para o QR Code do produto. O item será adicionado automaticamente.
- Se não tiver a etiqueta, você também pode usar o campo de busca no topo para digitar o nome ou ID do produto.
- Para gerenciar os itens, clique no ícone do **Carrinho**. No carrinho você pode:
   - Aumentar ou diminuir a **quantidade** de cada item.
   - Clicar no **ícone de lápis** para conceder um desconto manual negociado com o cliente.
   - **Remover um item** clicando no ícone de lixeira.
- Após conferir os itens, clique em **"Avançar para Checkout"**. Selecione como o cliente pagou e clique em **"Confirmar Venda"**.`
    },
    {
        title: '3. Venda Pendente',
        content: `Utilizado quando o cliente ainda não confirmou totalmente a compra.
- Adicione os produtos ao Carrinho normalmente.
- Em vez de ir para o checkout, clique em **"Salvar como Pendente"**.
- Insira o nome do cliente. O sistema irá **reservar** o estoque.
- Quando o cliente voltar para pagar e retirar a mercadoria, acesse o ícone de relógio no topo da tela inicial ("Vendas Pendentes"), encontre o nome do cliente e finalize a venda.`
    },
    {
        title: '4. Entrada',
        content: `- Na tela inicial, clique em **"Entrada"**.
- Escaneie o QR Code do produto.
- Digite a quantidade que está entrando na loja.
- Adicione uma observação se desejar e confirme. (Ex: Só registra no estoque depois que a mercadoria já foi comprada e chegou).`
    },
    {
        title: '5. Inventário',
        content: `Utilizado para contagem de prateleira e corrigir divergências entre o celular e a realidade, e **também para gerenciar alertas de estoque mínimo**.
- Na tela inicial, clique em **"Inventário"**.
- Escaneie ou busque o produto. 
- **Ajuste de Saldo:** Se a quantidade na prateleira for diferente do sistema, digite a quantidade real e confirme para corrigir.
- **Estoque Mínimo Ideal:** Abaixo do saldo, você verá o campo de Estoque Mínimo. Ele serve para o sistema saber quando deve alertá-lo que o produto está acabando. **Atenção:** O sistema iniciou o padrão com 5 unidades para todos os itens. Você deve alterar esse número adequadamente para cada produto para que as notificações funcionem de verdade em sua loja.`
    },
    {
        title: '6. Busca de Produtos',
        content: `A pesquisa inteligente agiliza a localização de itens sem precisar do QR Code.
- Em qualquer tela com "Lupa", busque pelo **Nome exato ou ID numérico**.
- A busca ignora acentos e a ordem das palavras. Por exemplo, se o produto se chama "Camisa Polo Azul", você pode pesquisar "azul camisa".`
    },
    {
        title: '7. Notificações',
        content: `Mantenha o controle de forma automática quando os produtos estão ameaçando acabar.
- Clique em **"Ativar Alertas"** que aparece na tela principal e autorize seu navegador quando ele perguntar.
- Sempre que for registrada uma venda e o saldo do produto atingir seu nível de segurança ("Estoque Mínimo" do tópico 5), seu celular apitará alertando reposição.`
    },
    {
        title: '8. Relatórios',
        content: `Para controle rápido da operação da loja:
- **Detalhes da Operação:** Ao clicar em qualquer linha do lançamento (venda, entrada, ajuste), o sistema abre os detalhes, incluindo número do pedido do site, status da sincronização com a Nuvemshop e observações inseridas.
- **Uso dos Filtros:** O relatório possui filtros poderosos. No campo de **Cliente/Fornecedor**, se você deixar "Todos", o relatório listará as movimentações dividindo os totais e somando cada pessoa separadamente de forma consolidada. Caso preferir, pesquise por um nome específico para ver as movimentações apenas da pessoa informada.`
    },
    {
        title: '9. Reposição',
        content: `Acompanhe os produtos que estão com estoque crítico (abaixo do mínimo que você configurou no Inventário).
- **Ação Imediata:** Produtos que já esgotaram ou estão muito abaixo do limite e precisam ser comprados urgentemente.
- **Em Observação:** Produtos que estão chegando perto do limite ou bateram exatamente na margem de segurança.
- **PDF de Compras:** Clique em "Gerar PDF" nesta tela para criar uma lista limpa, facilitando pedidos com o seu fornecedor.`
    },
    {
        title: '10. Impressão de Etiquetas',
        content: `Gere os QR Codes para colar nas mercadorias ou prateleiras.
- Acesse **"Produtos"** na tela inicial.
- Marque as caixinhas ao lado e clique em **"Imprimir QR Code"**. O sistema gerará um PDF pronto para a máquina de etiquetas.`
    }
];

export default function UserGuidePage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Helper to format basic markdown-like content (bold and line breaks)
    const formatContent = (text: string) => {
        return text.split('\n').map((line, i) => {
            const parsedLine = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={j} style={{ color: 'var(--accent)' }}>{part.slice(2, -2)}</strong>;
                }
                return part;
            });
            return <p key={i} style={{ marginBottom: '8px' }}>{parsedLine}</p>;
        });
    };

    return (
        <div style={{ padding: 'var(--space-lg) var(--space-md)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                <Link href="/" style={{ color: 'var(--text-secondary)' }}>
                    <ArrowLeft size={24} />
                </Link>
                <BookOpen size={28} color="var(--accent)" />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Guia de Uso</h1>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', fontSize: '0.9rem' }}>
                Clique nos tópicos abaixo para visualizar instruções rápidas de utilização do Stock 720x no dia a dia.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {guideSections.map((section, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div key={index} style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden'
                        }}>
                            <button 
                                onClick={() => toggleAccordion(index)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-md)',
                                    background: 'none',
                                    border: 'none',
                                    color: isOpen ? 'var(--accent)' : 'var(--text-primary)',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                {section.title}
                                {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            
                            {isOpen && (
                                <div style={{
                                    padding: '0 var(--space-md) var(--space-md) var(--space-md)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5'
                                }}>
                                    <div style={{ paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--border-color)' }}>
                                        {formatContent(section.content)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
