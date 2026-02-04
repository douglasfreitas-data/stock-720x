import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export default function ProductListScreen({ products, onClose }) {
    const [qrCodes, setQrCodes] = useState({})
    const [selectedProduct, setSelectedProduct] = useState(null)

    // Generate QR codes for all products
    useEffect(() => {
        const generateQRCodes = async () => {
            const codes = {}
            for (const product of products) {
                try {
                    codes[product.id] = await QRCode.toDataURL(product.barcode, {
                        width: 150,
                        margin: 1,
                        color: {
                            dark: '#000000',
                            light: '#ffffff'
                        }
                    })
                } catch (err) {
                    console.error('Error generating QR code:', err)
                }
            }
            setQrCodes(codes)
        }
        generateQRCodes()
    }, [products])

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="modal-close" onClick={onClose}>←</button>
                <h3 className="modal-title">📋 Lista de Produtos</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                <div className="product-list">
                    {products.map(product => (
                        <div
                            key={product.id}
                            className="product-list-item"
                            onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="product-list-image"
                            />
                            <div className="product-list-info">
                                <h4 className="product-list-name">{product.name}</h4>
                                <p className="product-list-sku">{product.sku}</p>
                                <p className="product-list-stock">📦 {product.stock} em estoque</p>
                            </div>
                            <div className="product-list-qr">
                                {qrCodes[product.id] ? (
                                    <img
                                        src={qrCodes[product.id]}
                                        alt={`QR ${product.barcode}`}
                                        className="qr-thumbnail"
                                    />
                                ) : (
                                    <div className="qr-loading">⏳</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* QR Code Modal */}
                {selectedProduct && (
                    <div className="qr-modal" onClick={() => setSelectedProduct(null)}>
                        <div className="qr-modal-content" onClick={e => e.stopPropagation()}>
                            <h3 className="qr-modal-title">{selectedProduct.name}</h3>
                            <p className="qr-modal-barcode">{selectedProduct.barcode}</p>
                            {qrCodes[selectedProduct.id] && (
                                <img
                                    src={qrCodes[selectedProduct.id]}
                                    alt={`QR ${selectedProduct.barcode}`}
                                    className="qr-large"
                                />
                            )}
                            <button
                                className="btn-confirm"
                                onClick={() => setSelectedProduct(null)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
