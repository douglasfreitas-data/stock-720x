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

    // Generate PDF with list format
    const generatePDF = async () => {
        setGeneratingPdf(true);

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 15;
            const itemHeight = 50;
            const spacing = 10;
            let y = margin;

            // Title
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Lista de Produtos - 720x', pageWidth / 2, y, { align: 'center' });
            y += 15;

            for (let i = 0; i < products.length; i++) {
                const product = products[i];

                // Check if we need a new page
                if (y + itemHeight + spacing > pageHeight - margin) {
                    pdf.addPage();
                    y = margin;
                }

                // Draw item background
                pdf.setFillColor(245, 245, 245);
                pdf.roundedRect(margin, y, pageWidth - margin * 2, itemHeight, 3, 3, 'F');

                // Load and add product image
                try {
                    const imgData = await loadImage(product.image);
                    if (imgData) {
                        pdf.addImage(imgData, 'JPEG', margin + 5, y + 5, 40, 40);
                    }
                } catch {
                    // Skip image if fails
                }

                // Product info
                const textX = margin + 50;
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0);

                // Name (truncate if too long)
                const maxNameWidth = 80;
                let name = product.name;
                if (pdf.getTextWidth(name) > maxNameWidth) {
                    while (pdf.getTextWidth(name + '...') > maxNameWidth && name.length > 0) {
                        name = name.slice(0, -1);
                    }
                    name += '...';
                }
                pdf.text(name, textX, y + 12);

                // SKU
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100);
                pdf.text(`SKU: ${product.sku}`, textX, y + 20);

                // Category & Brand
                pdf.setFontSize(9);
                pdf.text(`${product.category || 'N/A'} | ${product.brand || 'N/A'}`, textX, y + 27);

                // Barcode
                pdf.setFont('courier', 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(60);
                pdf.text(product.barcode || product.sku, textX, y + 35);

                // QR Code on the right
                const qrDataUrl = await QRCode.toDataURL(product.barcode || product.sku, {
                    width: 200,
                    margin: 1,
                    color: { dark: '#000000', light: '#ffffff' }
                });
                const qrSize = 35;
                const qrX = pageWidth - margin - qrSize - 5;
                pdf.addImage(qrDataUrl, 'PNG', qrX, y + 7, qrSize, qrSize);

                // Move to next item
                y += itemHeight + spacing;
            }

            // Footer on last page
            pdf.setFontSize(8);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(150);
            pdf.text('720x.com.br - Sistema de Gestão de Estoque', pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Save the PDF
            pdf.save('produtos_qrcode_720x.pdf');

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
