'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, BookOpen, ArrowLeft } from 'lucide-react';

// Hardcoded guide sections derived from the GUIA_USUARIO.md
const guideSections = [
    {
        title: '1. Instalação (PWA)',
        content: `O Stock 720x funciona como um aplicativo no seu celular.
        
1. Ao acessar o sistema pela primeira vez, um aviso de **"Adicionar à tela inicial"** aparecerá.
2. Clique no botão e siga as instruções para adicionar o ícone à sua tela de início.
3. Caso o aviso não apareça, instale manualmente:
   - **No iPhone:** Clique em "Compartilhar" (quadrado com seta) e **"Adicionar à Tela de Início"**.
   - **No Android:** Clique nos 3 pontinhos e escolha **"Adicionar à tela inicial"**.`
    },
    {
        title: '2. Realizando Vendas (PDV)',
        content: `1. Na tela inicial, clique em **"Vender / Escanear"**.
2. Aponte a câmera para o QR Code do produto.
3. Clique no ícone do **Carrinho** para ver a lista.
4. **No Carrinho você pode:**
   - Alterar a quantidade total.
   - Alterar o preço para dar descontos (clicando no lápis).
   - Remover um item zerando a quantidade.
5. Clique em **"Avançar para Checkout"**.
6. Escolha a forma de pagamento e clique em **"Confirmar Venda"**.`
    },
    {
        title: '3. Venda Pendente (Reservar Estoque)',
        content: `Se o cliente for pagar depois:
1. No Carrinho, em vez de Finalizar, clique em **"Salvar como Pendente"**.
2. O estoque será reservado (saída física), sem enviar para a Nuvemshop ainda.
3. Para finalizar depois, vá em **"Vendas Pendentes"** na tela inicial e busque o cliente.`
    },
    {
        title: '4. Entrada de Mercadoria (Reposição)',
        content: `Sempre que chegar carga nova:
1. Clique em **"Entrada de Estoque"**.
2. Escaneie o produto.
3. Digite a **quantidade que está chegando** e confirme.
4. O sistema atualizará automaticamente o saldo.`
    },
    {
        title: '5. Inventário (Ajuste de Estoque)',
        content: `Para conferir se a prateleira bate com o sistema:
1. Clique em **"Ajuste / Inventário"**.
2. Escaneie o produto.
3. Se o saldo estiver errado, digite a **quantidade real na prateleira**.
4. O sistema fará o "ajuste de perda" ou "sobra" automaticamente.`
    },
    {
        title: '6. Busca de Produtos',
        content: `Ao buscar (lupa), você pode procurar por:
- **Nome do produto** (Ex: "camisa azul").
- **ID** (O número interno do produto).
*Dica: A busca funciona mesmo sem acentos ou com ordem invertida!*`
    },
    {
        title: '7. Notificações e Alertas',
        content: `O sistema avisa se algo está acabando:
1. **Ativação:** Se aparecer "Ativar Alertas" na tela inicial, clique e aceite.
2. Você receberá um aviso no celular sempre que um item chegar no nível crítico.`
    },
    {
        title: '8. Relatórios Sugeridos',
        content: `Clique em **"Relatórios"** na tela inicial:
- **Histórico de Movimentações:** Tudo o que entrou e saiu (vendas, entradas, ajustes).
- **Relatório de Reposição:** Lista de compras sugerida baseada na falta de produtos. Você pode gerar um PDF para facilitar as compras.`
    },
    {
        title: '9. Impressão de Etiquetas',
        content: `1. Vá em **"Lista de Produtos"** > **"Imprimir QR Code"**.
2. Selecione os produtos desejados.
3. Clique em **"Gerar PDF"**.
4. O PDF gerado já vem no formato da etiquetadora.`
    },
    {
        title: '10. Modo Offline',
        content: `Se a internet cair, **não pare de trabalhar!**
- Continue registrando vendas e entradas normalmente (uma tarja exibirá que você está offline).
- Assim que o Wi-Fi ou 4G voltar, o app envia os dados pendentes para a Nuvemshop automaticamente.`
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
