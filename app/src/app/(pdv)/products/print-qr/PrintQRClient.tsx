'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { FileText, Loader, Search, X, CheckSquare, Square } from 'lucide-react';

interface NuvemshopProduct {
    id: number;
    name: { pt?: string;[key: string]: string | undefined };
    images: { id?: number; src: string }[];
    variants: { id: number; image_id?: number | null; stock?: number | null; sku?: string | null; barcode?: string | null; values?: { pt: string }[] | null }[];
    published: boolean;
}

interface PrintQRClientProps {
    products: NuvemshopProduct[];
}

export default function PrintQRClient({ products }: PrintQRClientProps) {
    const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Transform and sort products for QR logic
    const productsForQR = useMemo(() => {
        return products.flatMap(p => 
            p.variants.map((v, index) => {
                let baseName = p.name.pt || Object.values(p.name)[0] || 'Produto sem nome';
                
                if (v.values && Array.isArray(v.values) && v.values.length > 0) {
                    const tags = v.values.map(val => val?.pt).filter(Boolean).join(' / ');
                    if (tags) {
                        baseName = `${baseName} - ${tags}`;
                    }
                } else if (p.variants.length > 1) {
                    baseName = `${baseName} - Var ${index + 1}`;
                }

                return {
                    id: v.id,
                    productId: p.id,
                    name: baseName,
                    sku: v.sku || `SKU-${p.id}-${index}`,
                    barcode: v.barcode || v.sku || `${v.id}`,
                    image: (v.image_id ? p.images.find(img => img.id === v.image_id)?.src : null) || p.images[0]?.src || 'https://via.placeholder.com/100',
                    category: '',
                    brand: ''
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
                        codes[product.id] = await QRCode.toDataURL(product.barcode, {
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

    const loadImage = (url: string): Promise<string | null> => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
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
            const margin = 5;
            const itemWidth = 100;
            const itemHeight = 30;
            const cols = 2;
            
            let currentItemCount = 0;

            for (let i = 0; i < selectedProductsArr.length; i++) {
                const product = selectedProductsArr[i];
                
                // Calculate position based on grid (2 cols)
                const col = currentItemCount % cols;
                const row = Math.floor(currentItemCount / cols);
                
                let x = margin + (col * itemWidth);
                let y = margin + (row * itemHeight);
                
                // Check if we need a new page
                if (y + itemHeight > pageHeight - margin) {
                    pdf.addPage();
                    currentItemCount = 0;
                    x = margin;
                    y = margin;
                }

                // Draw dashed border for cutting
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineDashPattern([2, 2], 0);
                pdf.rect(x, y, itemWidth, itemHeight);
                pdf.setLineDashPattern([], 0); // reset dash

                const textX = x + 4;
                const textY = y + 8;
                
                // Product Name
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0);

                let name = product.name;
                if (pdf.getTextWidth(name) > 65) {
                    while (pdf.getTextWidth(name + '...') > 65 && name.length > 0) name = name.slice(0, -1);
                    name += '...';
                }
                pdf.text(name, textX, textY);

                // SKU
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(80);
                pdf.text(`SKU: ${product.sku}`, textX, textY + 6);

                // Barcode
                pdf.setFont('courier', 'bold');
                pdf.setFontSize(9);
                pdf.setTextColor(0);
                pdf.text(product.barcode, textX, textY + 13);

                // Footer
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(7);
                pdf.setTextColor(120);
                pdf.text('720x.com.br', textX, textY + 19);

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
                                            <span style={{ fontSize: '0.9rem', color: '#333' }}>{p.name} <span style={{ color: '#888', fontSize: '0.8rem' }}>({p.sku})</span></span>
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
                        {selectedProductsArr.map(product => (
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
                                <img src={product.image} alt={product.name} className="print-preview-image" />
                                <div className="print-preview-info">
                                    <h4 className="print-preview-name" style={{ paddingRight: '20px' }}>{product.name}</h4>
                                    <p className="print-preview-sku">{product.sku}</p>
                                    <p className="print-preview-barcode">{product.barcode}</p>
                                </div>
                                <div className="print-preview-qr">
                                    {qrCodes[product.id] ? (
                                        <img src={qrCodes[product.id]} alt="QR" className="qr-preview" />
                                    ) : (
                                        <div className="qr-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader size={16} /></div>
                                    )}
                                </div>
                            </div>
                        ))}
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
