'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/providers/CartProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { useOnlineStatus } from '@/components/providers/OnlineStatusProvider';
import { ArrowLeft, ShoppingCart, Camera, Trash2, Plus, Minus, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { processSessionAction } from '@/app/actions/session';
import { createPendingSaleAction } from '@/app/actions/pendingSales';

const paymentMethods = [
    { id: 'pix', label: 'PIX' },
    { id: 'credit', label: 'Crédito' },
    { id: 'debit', label: 'Débito' },
    { id: 'cash', label: 'Dinheiro' },
];

const operations = [
    { id: 'venda', label: 'Venda' },
    { id: 'consumo', label: 'Consumo' },
    { id: 'doacao', label: 'Doação' },
    { id: 'pregao', label: 'Pregão' }
];

export default function CartPage() {
    const router = useRouter();
    const { cart, removeFromCart, updateCartQuantity, updateItemPrice, clearCart, cartTotal, cartCount, isInitialized } = useCart();
    const { showToast } = useToast();
    const { isOnline } = useOnlineStatus();

    const [customer, setCustomer] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('pix');
    const [selectedOperation, setSelectedOperation] = useState('venda');
    const [paymentTerm, setPaymentTerm] = useState('');
    const [checkoutState, setCheckoutState] = useState<'idle' | 'processing' | 'completed'>('idle');
    const [sectionOpen, setSectionOpen] = useState(false);

    const isProcessing = checkoutState === 'processing';

    if (!isInitialized) return null;

    if (cart.length === 0) {
        return (
            <div className="modal-overlay">
                <div className="modal-header">
                    <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                    <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingCart size={20} />
                    </h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="modal-close" onClick={() => router.push('/pending-sales')} title="Vendas Pendentes">
                            <Clock size={24} />
                        </button>
                    </div>
                </div>
                <div className="modal-body">
                    <div className="cart-empty">
                        <div className="cart-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}><ShoppingCart size={48} /></div>
                        <p className="cart-empty-text">Carrinho vazio</p>
                        <button className="btn-scan-more" onClick={() => router.push('/scan?mode=sale')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Camera size={20} /> Escanear Produto
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handlePriceChange = (productId: number, val: string) => {
        // Remove tudo que não seja dígito
        const digits = val.replace(/\D/g, '');
        // Converte para centavos e depois para reais
        const cents = parseInt(digits || '0', 10);
        const price = cents / 100;
        updateItemPrice(productId, price);
    };

    const formatPrice = (value: number): string => {
        return value.toFixed(2).replace('.', ',');
    };

    const handleTermChange = (val: string) => {
        // Apenas dígitos, máximo 2 caracteres
        const cleaned = val.replace(/\D/g, '').slice(0, 2);
        setPaymentTerm(cleaned);
    };

    const handleConfirmSale = async (saveAsPending: boolean) => {
        if (isProcessing) return;

        if (!isOnline) {
            showToast('Sem conexão com a internet. Verifique seu Wi-Fi ou 4G.', 'error');
            return;
        }

        // Validar preço obrigatório apenas ao Finalizar Venda
        if (!saveAsPending) {
            const itemSemPreco = cart.find(item => !item.customPrice || item.customPrice <= 0);
            if (itemSemPreco) {
                showToast('Preencha o valor (R$) de todos os produtos antes de continuar.', 'error');
                return;
            }
        }

        if (!saveAsPending && !customer.trim()) {
            showToast('Preencha o Nome do Cliente antes de finalizar.', 'error');
            return;
        }

        setCheckoutState('processing');

        try {
            if (saveAsPending) {
                const result = await createPendingSaleAction({
                    client_name: customer,
                    payment_method: selectedPayment,
                    payment_term: paymentTerm,
                    operation_type: selectedOperation,
                    items: cart,
                    observations: paymentTerm ? `Prazo: ${paymentTerm} dias` : undefined
                });

                if (result.success) {
                    setCheckoutState('completed');
                    showToast('Venda salva como pendente!', 'success');
                    clearCart();
                    router.push('/pending-sales');
                } else {
                    setCheckoutState('idle');
                    showToast(result.message || 'Erro ao processar reserva', 'error');
                }
            } else {
                const result = await processSessionAction({
                    items: cart,
                    type: 'saida',
                    operation: selectedOperation,
                    notes: `Cliente: ${customer} | Pagto: ${selectedPayment} | Total: R$ ${cartTotal.toFixed(2)}`
                });

                if (result.success) {
                    setCheckoutState('completed');
                    showToast('Operação realizada com sucesso!', 'success');
                    clearCart();
                    router.replace('/success');
                } else {
                    setCheckoutState('idle');
                    showToast(result.message || 'Erro ao processar operação', 'error');
                }
            }
        } catch (error) {
            setCheckoutState('idle');
            showToast('Erro ao processar a requisição. Tente novamente.', 'error');
        }
    };

    const miniButtonStyle = (isSelected: boolean): React.CSSProperties => ({
        flex: 1,
        padding: '8px 4px',
        fontSize: '0.75rem',
        fontWeight: isSelected ? 600 : 400,
        borderRadius: '8px',
        border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
        backgroundColor: isSelected ? 'rgba(255, 152, 0, 0.12)' : 'var(--bg-primary)',
        color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
    });

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <Link href="/" className="modal-close"><ArrowLeft size={24} /></Link>
                <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingCart size={20} />
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => router.push('/pending-sales')} className="modal-close" style={{ color: '#fff' }} title="Vendas Pendentes">
                        <Clock size={24} />
                    </button>
                    <button onClick={clearCart} className="modal-close" style={{ color: '#fff' }} title="Limpar Carrinho">
                        <Trash2 size={24} />
                    </button>
                </div>
            </div>

            <div className="modal-body" style={{ paddingBottom: '140px' }}>
                {/* Cart Items */}
                <div className="cart-list">
                    {cart.map(item => {
                        const productName = item.product?.name || `Produto #${item.productId}`;
                        const priceValue = item.customPrice !== undefined ? item.customPrice : 0;
                        const mainImage = item.product?.image || 'https://via.placeholder.com/100';

                        return (
                            <div key={item.productId} className="cart-item" style={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                <img src={mainImage} alt={productName} className="cart-item-image" />
                                <div className="cart-item-info" style={{ flex: 1, minWidth: '150px' }}>
                                    <h4 className="cart-item-name">{productName}</h4>
                                    
                                    {/* Preço, Quantidade e Excluir na mesma linha */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                                        {/* Preço Editável */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>R$</span>
                                            <input 
                                                type="text"
                                                inputMode="numeric"
                                                className="form-input" 
                                                style={{ padding: '4px 6px', height: '30px', fontSize: '0.85rem', width: '80px' }}
                                                value={formatPrice(priceValue)}
                                                onChange={(e) => handlePriceChange(item.productId, e.target.value)}
                                            />
                                        </div>

                                        {/* Quantidade */}
                                        <div className="cart-qty-controls" style={{ margin: '0 2px' }}>
                                            <button
                                                className="cart-qty-btn"
                                                onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="cart-qty-value" style={{ fontSize: '0.85rem', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <button
                                                className="cart-qty-btn"
                                                onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                                disabled={item.quantity >= (item.product?.stock ?? 9999)}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        {/* Excluir */}
                                        <button
                                            className="cart-item-remove"
                                            onClick={() => removeFromCart(item.productId)}
                                            style={{ marginLeft: 'auto' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    className="btn-scan-more"
                    onClick={() => router.push('/scan?mode=sale')}
                    style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <Plus size={20} /> Adicionar Produto
                </button>

                {/* Collapsible Section: Dados da Operação */}
                <div style={{ borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '16px', overflow: 'hidden' }}>
                    <button
                        onClick={() => setSectionOpen(!sectionOpen)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px 16px',
                            backgroundColor: 'var(--bg-secondary)',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            fontWeight: 600,
                        }}
                    >
                        <span>Dados da Operação</span>
                        {sectionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {sectionOpen && (
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Nome do Cliente */}
                            <div className="form-section" style={{ marginBottom: 0 }}>
                                <label className="form-label">Nome do Cliente</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ex: Maria Silva"
                                    value={customer}
                                    onChange={(e) => setCustomer(e.target.value)}
                                />
                            </div>

                            {/* Prazo */}
                            <div className="form-section" style={{ marginBottom: 0 }}>
                                <label className="form-label">Prazo (dias)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="form-input"
                                    placeholder="Ex: 30"
                                    value={paymentTerm}
                                    onChange={(e) => handleTermChange(e.target.value)}
                                    maxLength={2}
                                    style={{ width: '80px' }}
                                />
                            </div>

                            {/* Tipo de Operação - 4 botões em linha */}
                            <div className="form-section" style={{ marginBottom: 0 }}>
                                <label className="form-label">Tipo de Operação</label>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {operations.map(op => (
                                        <button
                                            key={op.id}
                                            style={miniButtonStyle(selectedOperation === op.id)}
                                            onClick={() => setSelectedOperation(op.id)}
                                        >
                                            {op.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Forma de Pagamento - 4 botões em linha */}
                            {selectedOperation === 'venda' && (
                                <div className="form-section" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Forma de Pagamento</label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {paymentMethods.map(p => (
                                            <button
                                                key={p.id}
                                                style={miniButtonStyle(selectedPayment === p.id)}
                                                onClick={() => setSelectedPayment(p.id)}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'var(--bg-secondary)',
                borderTop: '1px solid var(--border-color)',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total ({cartCount} {cartCount === 1 ? 'item' : 'itens'}):</span>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                        R$ {cartTotal.toFixed(2).replace('.', ',')}
                    </span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        style={{ flex: 1, padding: '12px 8px', fontSize: '0.9rem', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}
                        onClick={() => handleConfirmSale(true)}
                        disabled={isProcessing || !isOnline}
                    >
                        {isProcessing ? 'Aguarde...' : 'Salvar Pendente'}
                    </button>
                    <button
                        className="btn-confirm"
                        style={{ flex: 1, padding: '12px 8px', fontSize: '0.9rem', margin: 0 }}
                        onClick={() => handleConfirmSale(false)}
                        disabled={isProcessing || !isOnline}
                    >
                        {isProcessing ? 'Aguarde...' : 'Finalizar Venda'}
                    </button>
                </div>
            </div>
        </div>
    );
}
