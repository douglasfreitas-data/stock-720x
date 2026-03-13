'use client';

import React, { useState, useEffect } from 'react';

interface Step {
    target: string;
    title: string;
    content: string;
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: Step[] = [
    {
        target: 'body',
        title: 'Bem-vindo ao Stock 720x! 👋',
        content: 'Este é o seu novo sistema de PDV e Controle de Estoque. Vamos fazer um tour rápido de 1 minuto para você conhecer os recursos.',
        placement: 'center'
    },
    {
        target: 'a[href="/checkout"]',
        title: '🛒 Nova Venda',
        content: 'Aqui você inicia uma venda rápida, adiciona itens ao carrinho e escolhe a forma de pagamento (Dinheiro, PIX, Cartão).',
        placement: 'bottom'
    },
    {
        target: 'a[href="/stock/entry"]',
        title: '📦 Entrada de Estoque',
        content: 'Registre a chegada de novas mercadorias. Você pode usar a câmera do celular para escanear os códigos de barras direto na tela!',
        placement: 'bottom'
    },
    {
        target: 'a[href="/cart"]',
        title: '🛍️ Carrinho Ativo',
        content: 'Seus itens em andamento ficam salvos aqui. Você pode revisar quantidades e valores antes de finalizar a operação.',
        placement: 'bottom'
    },
    {
        target: 'a[href="/products/print-qr"]',
        title: '🖨️ Etiquetas e Catálogo',
        content: 'Nesta seção você pode gerar PDFs prontos para impressão com os QR Codes de todos os seus produtos para facilitar a venda.',
        placement: 'top'
    },
    {
        target: 'body',
        title: 'Tudo pronto! 🚀',
        content: 'Você já pode começar a operar sua loja. Dica: Se ficar sem internet, o sistema avisa ali em cima, mas você não perde o carrinho!',
        placement: 'center'
    }
];

export default function OnboardingTour() {
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Initial check to see if we should run the tour
    useEffect(() => {
        const hasCompletedTour = localStorage.getItem('stock720x_tour_completed');
        // Para debug forçar: localStorage.removeItem('stock720x_tour_completed');
        if (!hasCompletedTour) {
            setRun(true);
        }
        
        // Expose a global method to restart tour deliberately
        (window as any).startStock720xTour = () => {
            setStepIndex(0);
            setRun(true);
        };
    }, []);

    // Effect to update target rect when step changes or window resizes
    useEffect(() => {
        if (!run) return;

        const updateRect = () => {
            const currentStep = steps[stepIndex];
            if (currentStep.target === 'body') {
                setTargetRect(null); // Center modal
                return;
            }

            const el = document.querySelector(currentStep.target);
            if (el) {
                // Ensure element is visible
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add highlight class
                el.classList.add('tour-highlight');
                setTargetRect(el.getBoundingClientRect());
            } else {
                setTargetRect(null);
            }
        };

        // Pequeno timeout para dar tempo do target renderizar/animar na home
        const timer = setTimeout(updateRect, 300);
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, { passive: true });

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
            document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        };
    }, [stepIndex, run]);

    if (!run) return null;

    const handleNext = () => {
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        if (stepIndex < steps.length - 1) {
            setStepIndex(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleSkip = () => {
        document.querySelectorAll('.tour-highlight').forEach(el => el.classList.remove('tour-highlight'));
        handleClose();
    };

    const handleClose = () => {
        setRun(false);
        localStorage.setItem('stock720x_tour_completed', 'true');
    };

    const step = steps[stepIndex];
    const isCenter = step.placement === 'center' || !targetRect;

    // Calcular posição do tooltip
    let tooltipStyle: React.CSSProperties = {};
    if (!isCenter && targetRect) {
        // Logica simplificada para ficar under ou over o target
        const spaceBelow = window.innerHeight - targetRect.bottom;
        const spaceAbove = targetRect.top;
        
        if (step.placement === 'bottom' || (step.placement !== 'top' && spaceBelow > 200)) {
            tooltipStyle = {
                top: targetRect.bottom + 16 + window.scrollY,
                left: Math.max(16, targetRect.left + (targetRect.width / 2) - 150),
            };
        } else {
            tooltipStyle = {
                top: targetRect.top - 200 + window.scrollY, // Guess max tooltip height
                left: Math.max(16, targetRect.left + (targetRect.width / 2) - 150),
            };
        }
    }

    return (
        <div className="tour-overlay">
            {/* Cutout Highlight if target exists */}
            {!isCenter && targetRect && (
                <div 
                    className="tour-cutout"
                    style={{
                        top: targetRect.top + window.scrollY - 8,
                        left: targetRect.left + window.scrollX - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                    }}
                />
            )}

            {/* Tooltip Card */}
            <div 
                className={`tour-tooltip ${isCenter ? 'tour-center' : ''}`}
                style={isCenter ? {} : tooltipStyle}
            >
                <div className="tour-header">
                    <h3 className="tour-title">{step.title}</h3>
                    <button className="tour-close" onClick={handleSkip}>×</button>
                </div>
                <div className="tour-body">
                    {step.content}
                </div>
                <div className="tour-footer">
                    <span className="tour-progress">
                        Passo {stepIndex + 1} de {steps.length}
                    </span>
                    <div className="tour-actions">
                        {stepIndex > 0 && (
                            <button className="tour-btn-secondary" onClick={() => setStepIndex(p => p - 1)}>
                                Voltar
                            </button>
                        )}
                        <button className="tour-btn-primary" onClick={handleNext}>
                            {stepIndex === steps.length - 1 ? 'Começar!' : 'Avançar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
