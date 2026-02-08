'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

interface NuvemshopProduct {
    id: number;
    name: { pt?: string;[key: string]: string | undefined };
    images: { src: string }[];
    variants: { stock?: number | null; sku?: string | null; barcode?: string | null }[];
    published: boolean;
}

interface PrintQRClientProps {
    products: NuvemshopProduct[];
}

export default function PrintQRClient({ products }: PrintQRClientProps) {
    const [qrCodes, setQrCodes] = useState<Record<number, string>>({});
    const [generatingPdf, setGeneratingPdf] = useState(false);

    // Transform products for QR logic
    const productsForQR = products.map(p => ({
        id: p.id,
        name: p.name.pt || Object.values(p.name)[0] || 'Produto sem nome',
        sku: p.variants[0]?.sku || `SKU-${p.id}`,
        barcode: p.variants[0]?.barcode || p.variants[0]?.sku || `${p.id}`,
        image: p.images[0]?.src || 'https://via.placeholder.com/100',
        category: '',
        brand: ''
    }));

    // Generate QR codes for all products
    useEffect(() => {
        const generateQRCodes = async () => {
            const codes: Record<number, string> = {};
            for (const product of productsForQR) {
                try {
                    codes[product.id] = await QRCode.toDataURL(product.barcode, {
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
            const margin = 15;
            const itemHeight = 50;
            const spacing = 10;
            let y = margin;

            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Lista de Produtos - 720x', pageWidth / 2, y, { align: 'center' });
            y += 15;

            for (let i = 0; i < productsForQR.length; i++) {
                const product = productsForQR[i];
                if (y + itemHeight + spacing > pageHeight - margin) {
                    pdf.addPage();
                    y = margin;
                }

                pdf.setFillColor(245, 245, 245);
                pdf.roundedRect(margin, y, pageWidth - margin * 2, itemHeight, 3, 3, 'F');

                try {
                    const imgData = await loadImage(product.image);
                    if (imgData) pdf.addImage(imgData, 'JPEG', margin + 5, y + 5, 40, 40);
                } catch { }

                const textX = margin + 50;
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0);

                let name = product.name;
                if (pdf.getTextWidth(name) > 80) {
                    while (pdf.getTextWidth(name + '...') > 80 && name.length > 0) name = name.slice(0, -1);
                    name += '...';
                }
                pdf.text(name, textX, y + 12);

                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100);
                pdf.text(`SKU: ${product.sku}`, textX, y + 20);
                pdf.setFontSize(9);
                pdf.text(`${product.category || 'N/A'} | ${product.brand || 'N/A'}`, textX, y + 27);

                pdf.setFont('courier', 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(60);
                pdf.text(product.barcode, textX, y + 35);

                const qrDataUrl = await QRCode.toDataURL(product.barcode, {
                    width: 200, margin: 1, color: { dark: '#000000', light: '#ffffff' }
                });
                const qrSize = 35;
                const qrX = pageWidth - margin - qrSize - 5;
                pdf.addImage(qrDataUrl, 'PNG', qrX, y + 7, qrSize, qrSize);

                y += itemHeight + spacing;
            }

            pdf.setFontSize(8);
            pdf.setTextColor(150);
            pdf.text('720x.com.br - Sistema de Gestão de Estoque', pageWidth / 2, pageHeight - 10, { align: 'center' });
            pdf.save('produtos_qrcode_720x.pdf');
        } catch (err) {
            console.error(err);
            alert('Erro ao gerar PDF');
        }
        setGeneratingPdf(false);
    };

    return (
        <div className="modal-body">
            <p className="print-description">
                Gere um PDF com todos os produtos para impressão. Cada produto terá imagem,
                descrição e QR Code para facilitar o escaneamento.
            </p>

            <button className="btn-confirm" onClick={generatePDF} disabled={generatingPdf} style={{ marginBottom: '24px' }}>
                {generatingPdf ? '⏳ Gerando PDF...' : '📄 Gerar PDF para Impressão'}
            </button>

            <h4 className="print-preview-title">Prévia ({productsForQR.length} produtos)</h4>
            <div className="print-preview-list">
                {productsForQR.map(product => (
                    <div key={product.id} className="print-preview-item">
                        <img src={product.image} alt={product.name} className="print-preview-image" />
                        <div className="print-preview-info">
                            <h4 className="print-preview-name">{product.name}</h4>
                            <p className="print-preview-sku">{product.sku}</p>
                            <p className="print-preview-barcode">{product.barcode}</p>
                        </div>
                        <div className="print-preview-qr">
                            {qrCodes[product.id] ? (
                                <img src={qrCodes[product.id]} alt="QR" className="qr-preview" />
                            ) : (
                                <div className="qr-loading">⏳</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
