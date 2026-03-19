'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { FileText, Loader, Search, X, CheckSquare, Square } from 'lucide-react';

interface LocalVariant {
    id: number;
    image_url?: string | null;
    stock?: number | null;
    min_stock?: number | null;
    sku?: string | null;
    barcode?: string | null;
    values?: { pt: string }[] | null;
}

interface LocalProduct {
    id: number;
    name: { pt?: string; [key: string]: string | undefined };
    images: { id?: number; src: string }[];
    variants: LocalVariant[];
    published: boolean;
}

interface PrintQRClientProps {
    products: LocalProduct[];
}

export default function PrintQRClient({ products }: PrintQRClientProps) {
    const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(20);
    const observerTarget = useRef<HTMLDivElement>(null);

    // Transform and sort products for QR logic
    const productsForQR = useMemo(() => {
        return products.flatMap(product => 
            product.variants.map((v, index) => {
                const mainImage = v.image_url || product.images?.[0]?.src || 'https://via.placeholder.com/100';
                let productName = product.name?.pt || (product.name ? Object.values(product.name)[0] : null) || 'Produto sem nome';
                
                if (v.values && Array.isArray(v.values) && v.values.length > 0) {
                    const tags = v.values.map(val => val?.pt).filter(Boolean).join(' / ');
                    if (tags) {
                        productName = `${productName} - ${tags}`;
                    }
                } else if (product.variants.length > 1) {
                    productName = `${productName} - Var ${index + 1}`;
                }

                const sku = v.sku || `SKU-${product.id}-${index}`;
                const barcode = v.barcode || v.sku || `${v.id}`;

                return {
                    id: v.id,
                    productId: product.id,
                    name: productName,
                    sku,
                    barcode,
                    stock: v.stock || 0,
                    mainImage
                };
            })
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Derived states
    const filteredProducts = useMemo(() => {
        if (!searchTerm.trim()) return [];
        const q = searchTerm.toLowerCase();
        return productsForQR.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
        ).slice(0, 10);
    }, [productsForQR, searchTerm]);

    const selectedProductsArr = useMemo(() => {
        return productsForQR.filter(p => selectedIds.has(p.id));
    }, [productsForQR, selectedIds]);

    const visibleSelectedProducts = useMemo(() => {
        return selectedProductsArr.slice(0, visibleCount);
    }, [selectedProductsArr, visibleCount]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && visibleCount < selectedProductsArr.length) {
                    setVisibleCount(prev => prev + 20);
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [visibleCount, selectedProductsArr.length]);

    const handleSelectProduct = (id: number) => {
        const newSet = new Set(selectedIds);
        newSet.add(id);
        setSelectedIds(newSet);
        setSearchTerm('');
        setShowDropdown(false);
    };

    const handleRemoveProduct = (id: number) => {
        const newSet = new Set(selectedIds);
        newSet.delete(id);
        setSelectedIds(newSet);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === productsForQR.length) {
            setSelectedIds(new Set()); // deselect all
        } else {
            setSelectedIds(new Set(productsForQR.map(p => p.id))); // select all
        }
    };

    // Generate QR codes only for selected products
    useEffect(() => {
        const generateQRCodes = async () => {
            const codes: Record<number, string> = { ...qrCodes };
            let hasNew = false;
            for (const product of selectedProductsArr) {
                if (!codes[product.id]) {
                    try {
                        codes[product.id] = await QRCode.toDataURL(String(product.id), {
                            width: 200,
                            margin: 2,
                            color: { dark: '#000000', light: '#ffffff' }
                        });
                        hasNew = true;
                    } catch (err) {
                        console.error('Error generating QR code:', err);
                    }
                }
            }
            if (hasNew) setQrCodes(codes);
        };
        generateQRCodes();
    }, [selectedProductsArr]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadImage = async (url: string | null): Promise<string | null> => {
        if (!url) return null;
        try {
            const optimizedUrl = `/_next/image?url=${encodeURIComponent(url)}&w=128&q=75`;
            const response = await fetch(optimizedUrl);
            const blob = await response.blob();
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error('Error loading image:', e);
            return null;
        }
    };

    const generatePDF = async () => {
        if (selectedProductsArr.length === 0) {
            alert('Selecione pelo menos um produto para imprimir.');
            return;
        }

        setGeneratingPdf(true);
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = 210;
            const pageHeight = 297;
            const itemWidth = 150;
            const itemHeight = 30;
            const cols = 1;
            const marginX = (pageWidth - itemWidth) / 2; // 30mm
            const marginY = (pageHeight - (9 * itemHeight)) / 2; // 13.5mm
            
            let currentItemCount = 0;

            for (let i = 0; i < selectedProductsArr.length; i++) {
                const product = selectedProductsArr[i];
                
                // Calculate position
                const row = currentItemCount % 9;
                
                let x = marginX;
                let y = marginY + (row * itemHeight);
                
                // Check if we need a new page
                if (row === 0 && currentItemCount > 0) {
                    pdf.addPage();
                }

                // Draw dashed border for cutting
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineDashPattern([2, 2], 0);
                pdf.rect(x, y, itemWidth, itemHeight);
                pdf.setLineDashPattern([], 0); // reset dash

                // Load image
                const imageBase64 = await loadImage(product.mainImage);
                if (imageBase64) {
                    pdf.addImage(imageBase64, 'JPEG', x + 2, y + 2, 26, 26);
                }

                const textX = x + 30;
                let textY = y + 7;
                
                // Product Name
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0);

                let splitTitle = pdf.splitTextToSize(product.name, 90);
                if (splitTitle.length > 3) {
                    splitTitle = splitTitle.slice(0, 3);
                    splitTitle[2] = splitTitle[2].slice(0, -3) + '...';
                }
                pdf.text(splitTitle, textX, textY);

                textY += (splitTitle.length * 4.5) + 2;

                // Barcode / ID
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.setTextColor(80);
                pdf.text(`Cód: ${product.barcode}`, textX, textY);

                // Footer
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(7);
                pdf.setTextColor(150);
                pdf.text('Stock 720x', textX, y + 27);

                // QR Code
                const qrDataUrl = qrCodes[product.id];
                if (qrDataUrl) {
                    const qrSize = 24;
                    const qrX = x + itemWidth - qrSize - 3;
                    const qrY = y + (itemHeight - qrSize) / 2;
                    pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
                }

                currentItemCount++;
            }

            pdf.save('etiquetas_qrcode_720x.pdf');
        } catch (err) {
            console.error(err);
            alert('Erro ao gerar PDF');
        }
        setGeneratingPdf(false);
    };

    return (
        <div className="modal-body">
            <p className="print-description">
                Busque e selecione os itens que deseja imprimir. Cada produto terá imagem,
                descrição e QR Code para facilitar o escaneamento.
            </p>

            <div className="qr-selection-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div ref={searchRef} style={{ position: 'relative', flex: 1 }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px' }} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Buscar produto por nome ou SKU..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        {showDropdown && searchTerm.trim() !== '' && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                marginTop: '4px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                zIndex: 10,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => handleSelectProduct(p.id)}
                                            style={{
                                                padding: '10px 12px',
                                                borderBottom: '1px solid var(--border-color)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.9rem', color: '#333' }}>{p.name} {p.barcode && <span style={{ color: '#888', fontSize: '0.8rem' }}>({p.barcode})</span>}</span>
                                            {selectedIds.has(p.id) && <CheckSquare size={16} color="var(--accent)" />}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '12px', color: '#888', textAlign: 'center', fontSize: '0.9rem' }}>Nenhum produto encontrado.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={handleSelectAll}
                        style={{
                            background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 'bold'
                        }}
                    >
                        {selectedIds.size === productsForQR.length ? (
                            <><CheckSquare size={18} /> Limpar Seleção</>
                        ) : (
                            <><Square size={18} /> Selecionar Todos</>
                        )}
                    </button>

                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {selectedIds.size} selecionado(s)
                    </span>
                </div>
            </div>

            <button
                className="btn-confirm"
                onClick={generatePDF}
                disabled={generatingPdf || selectedIds.size === 0}
                style={{ marginBottom: '24px', opacity: selectedIds.size === 0 ? 0.6 : 1 }}
            >
                {generatingPdf ? (
                    <><Loader size={16} className="animate-spin" style={{ display: 'inline' }} /> Gerando PDF...</>
                ) : (
                    <><FileText size={16} style={{ display: 'inline' }} /> Gerar PDF dos Selecionados</>
                )}
            </button>

            {selectedProductsArr.length > 0 && (
                <>
                    <h4 className="print-preview-title">Prévia ({selectedProductsArr.length} produtos)</h4>
                    <div className="print-preview-list">
                        {visibleSelectedProducts.map(product => (
                            <div key={product.id} className="print-preview-item" style={{ position: 'relative' }}>
                                <button
                                    onClick={() => handleRemoveProduct(product.id)}
                                    style={{
                                        position: 'absolute', top: '8px', right: '8px', zIndex: 2,
                                        background: 'rgba(255,0,0,0.1)', border: 'none', borderRadius: '50%',
                                        width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: 'var(--danger)'
                                    }}
                                >
                                    <X size={14} />
                                </button>
                                <img 
                                    src={`/_next/image?url=${encodeURIComponent(product.mainImage)}&w=128&q=75`} 
                                    alt={product.name} 
                                    className="product-qr-image" 
                                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }}
                                    loading="lazy"
                                />
                                <div className="print-preview-info">
                                    <h4 className="print-preview-name" style={{ paddingRight: '20px' }}>{product.name}</h4>
                                    {product.barcode && <p className="print-preview-barcode">{product.barcode}</p>}
                                </div>
                                <div className="print-preview-qr">
                                    {qrCodes[product.id] ? (
                                        <img src={qrCodes[product.id]} alt="QR" className="qr-preview" style={{ width: '48px', height: '48px' }} />
                                    ) : (
                                        <div className="qr-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader size={16} /></div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {visibleCount < selectedProductsArr.length && (
                            <div ref={observerTarget} style={{ padding: '20px', display: 'flex', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                <Loader size={20} className="animate-spin" />
                            </div>
                        )}
                    </div>
                </>
            )}
            
            {selectedProductsArr.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                    <Search size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p>Busque e adicione produtos para gerar o QR Code.</p>
                </div>
            )}
        </div>
    );
}
