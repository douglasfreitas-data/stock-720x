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
                    codes[product.id] = await QRCode.toDataURL(product.barcode || product.sku || String(product.id), {
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
            const itemWidth = 150;
            const itemHeight = 30;
            const cols = 1;
            const marginX = (pageWidth - itemWidth) / 2; // 30mm
            const marginY = (pageHeight - (9 * itemHeight)) / 2; // 13.5mm
            
            let currentItemCount = 0;

            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                
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

                // Add Image First
                const imgDataUrl = await loadImage(product.image);
                if (imgDataUrl) {
                    pdf.addImage(imgDataUrl, 'JPEG', x + 2, y + 2, 26, 26);
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
                const qrDataUrl = await QRCode.toDataURL(product.barcode || product.sku || String(product.id), {
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
                                <p className="print-preview-barcode">Código: {product.barcode}</p>
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
