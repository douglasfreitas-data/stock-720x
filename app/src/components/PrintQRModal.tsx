'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

interface Product {
    id: number;
    name: string;
    sku: string;
    barcode: string;
    image: string;
    category?: string;
    brand?: string;
}

interface PrintQRModalProps {
    products: Product[];
    onClose: () => void;
}

export default function PrintQRModal({ products, onClose }: PrintQRModalProps) {
    const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Generate QR codes for all products
    useEffect(() => {
        const generateQRCodes = async () => {
            const codes: Record<number, string> = {};
            for (const product of products) {
                try {
                    codes[product.id] = await QRCode.toDataURL(product.barcode || product.sku, {
                        width: 200,
                        margin: 2,
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                } catch (err) {
                    console.error('Error generating QR code:', err);
                }
            }
            setQrCodes(codes);
        };
        generateQRCodes();
    }, [products]);

    // Load image as base64
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

            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                
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
                pdf.text(product.barcode || product.sku, textX, textY + 13);

                // Footer
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(7);
                pdf.setTextColor(120);
                pdf.text('720x.com.br', textX, textY + 19);

                // QR Code
                const qrDataUrl = await QRCode.toDataURL(product.barcode || product.sku, {
                    width: 200,
                    margin: 1,
                    color: { dark: '#000000', light: '#ffffff' }
                });

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
            console.error('Error generating PDF:', err);
            alert('Erro ao gerar PDF');
        }

        setGeneratingPdf(false);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="modal-close" onClick={onClose}>←</button>
                <h3 className="modal-title">🏷️ Imprimir QR Code</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                <p className="print-description">
                    Gere um PDF com todos os produtos para impressão. Cada produto terá imagem,
                    descrição e QR Code para facilitar o escaneamento.
                </p>

                {/* PDF Button */}
                <button
                    className="btn-confirm"
                    onClick={generatePDF}
                    disabled={generatingPdf}
                    style={{ marginBottom: '24px' }}
                >
                    {generatingPdf ? '⏳ Gerando PDF...' : '📄 Gerar PDF para Impressão'}
                </button>

                {/* Preview List */}
                <h4 className="print-preview-title">Prévia ({products.length} produtos)</h4>
                <div className="print-preview-list">
                    {products.map(product => (
                        <div key={product.id} className="print-preview-item">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="print-preview-image"
                            />
                            <div className="print-preview-info">
                                <h4 className="print-preview-name">{product.name}</h4>
                                <p className="print-preview-sku">{product.sku}</p>
                                <p className="print-preview-barcode">{product.barcode}</p>
                            </div>
                            <div className="print-preview-qr">
                                {qrCodes[product.id] ? (
                                    <img
                                        src={qrCodes[product.id]}
                                        alt={`QR ${product.barcode}`}
                                        className="qr-preview"
                                    />
                                ) : (
                                    <div className="qr-loading">⏳</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
