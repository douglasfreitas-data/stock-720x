import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function ScannerModal({ mode, onClose, onScan }) {
    const [barcode, setBarcode] = useState('')
    const [scannerReady, setScannerReady] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState(null)
    const [status, setStatus] = useState('')
    const scannerRef = useRef(null)
    const initRef = useRef(false)

    const title = mode === 'sale' ? 'Escanear para Venda' : 'Escanear para Inventário'

    // First step: show the container
    const prepareScanner = () => {
        setError(null)
        setStatus('Preparando...')
        setScannerReady(true)
    }

    // Second step: start scanning after container is mounted
    useEffect(() => {
        if (scannerReady && !initRef.current) {
            initRef.current = true
            // Small delay to ensure DOM is ready
            setTimeout(() => startScanner(), 200)
        }
    }, [scannerReady])

    const startScanner = async () => {
        try {
            setStatus('Iniciando câmera...')

            const container = document.getElementById('scanner-container')
            if (!container) {
                setError('Container não encontrado. Tente novamente.')
                return
            }

            scannerRef.current = new Html5Qrcode("scanner-container")

            await scannerRef.current.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 }
                },
                (decodedText) => {
                    console.log("✅ Detectado:", decodedText)
                    setBarcode(decodedText)
                    setStatus(`✅ Código: ${decodedText}`)
                    stopScanner()
                    setTimeout(() => onScan(decodedText), 1000)
                },
                () => { } // Ignore frame errors
            )

            setIsScanning(true)
            setStatus('📷 Aponte para o código de barras')

        } catch (err) {
            console.error("Erro scanner:", err)
            setStatus('')
            setError(`Erro: ${err.message || err}`)
        }
    }

    const stopScanner = async () => {
        try {
            if (scannerRef.current?.isScanning) {
                await scannerRef.current.stop()
            }
        } catch (e) { }
        setIsScanning(false)
    }

    useEffect(() => {
        return () => {
            try { scannerRef.current?.stop() } catch (e) { }
        }
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (barcode.trim()) {
            stopScanner()
            onScan(barcode.trim())
        }
    }

    const handleClose = () => {
        stopScanner()
        onClose()
    }

    return (
        <div className="modal-overlay">
            <div className="modal-header">
                <button className="modal-close" onClick={handleClose}>←</button>
                <h3 className="modal-title">{title}</h3>
                <div style={{ width: 40 }}></div>
            </div>

            <div className="modal-body">
                {/* Scanner Area */}
                <div style={{
                    width: '100%',
                    background: '#000',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {/* Container sempre presente, mas oculto quando não está escaneando */}
                    <div
                        id="scanner-container"
                        style={{
                            width: '100%',
                            display: scannerReady ? 'block' : 'none'
                        }}
                    />

                    {!scannerReady && (
                        <button
                            onClick={prepareScanner}
                            style={{
                                background: 'var(--accent)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                padding: '16px 32px',
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}
                        >
                            📷 Ativar Scanner
                        </button>
                    )}

                    {status && (
                        <p style={{
                            color: status.includes('✅') ? 'var(--success)' : 'var(--accent)',
                            padding: '12px',
                            fontSize: '0.875rem',
                            textAlign: 'center'
                        }}>
                            {status}
                        </p>
                    )}

                    {error && (
                        <p style={{ color: 'var(--danger)', padding: '12px', fontSize: '0.875rem', textAlign: 'center' }}>
                            {error}
                        </p>
                    )}
                </div>

                {/* Manual Input */}
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '16px 0 8px', fontSize: '0.875rem' }}>
                    Ou digite manualmente:
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="scanner-input-wrapper">
                        <input
                            type="text"
                            className="scanner-input"
                            placeholder="Código de barras"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                        />
                        <button type="submit" className="btn-search">🔍</button>
                    </div>
                </form>

                {/* Quick Test */}
                <div className="quick-codes">
                    <p className="quick-codes-label">Teste rápido:</p>
                    <div className="quick-codes-list">
                        <button
                            type="button"
                            className="quick-code"
                            onClick={() => {
                                stopScanner()
                                onScan('6426010922905')
                            }}
                            style={{ background: 'var(--accent-subtle)', borderColor: 'var(--accent)' }}
                        >
                            🏷️ Dedeira Avalon
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
