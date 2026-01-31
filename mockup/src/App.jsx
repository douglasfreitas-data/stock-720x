import { useState } from 'react'
import './index.css'
import { products as initialProducts, customers, findProductByBarcode } from './data/products'

// Screens
import HomeScreen from './screens/HomeScreen'
import ScannerModal from './screens/ScannerModal'
import SaleScreen from './screens/SaleScreen'
import InventoryScreen from './screens/InventoryScreen'
import FinanceScreen from './screens/FinanceScreen'
import SuccessScreen from './screens/SuccessScreen'
import ProductsScreen from './screens/ProductsScreen'

function App() {
  // State
  const [products, setProducts] = useState(initialProducts)
  const [currentScreen, setCurrentScreen] = useState('home')
  const [scannerMode, setScannerMode] = useState(null) // 'sale' or 'inventory'
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [saleData, setSaleData] = useState(null)

  // Toast
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Handlers
  const openScanner = (mode) => {
    setScannerMode(mode)
    setCurrentScreen('scanner')
  }

  const handleScanResult = (barcode) => {
    const product = findProductByBarcode(barcode)
    if (product) {
      // Get current stock from state
      const currentProduct = products.find(p => p.id === product.id)
      setSelectedProduct(currentProduct)
      setCurrentScreen(scannerMode) // 'sale' or 'inventory'
    } else {
      showToast('Produto não encontrado', 'error')
    }
  }

  const handleConfirmSale = (product, quantity, customer, paymentMethod) => {
    const oldStock = product.stock
    const newStock = oldStock - quantity

    // Update product stock
    setProducts(prev => prev.map(p =>
      p.id === product.id
        ? { ...p, stock: newStock }
        : p
    ))

    // Save sale data for success screen
    setSaleData({
      product,
      quantity,
      customer,
      paymentMethod,
      oldStock,
      newStock
    })

    setCurrentScreen('success')
  }

  const handleUpdateInventory = (product, newStock, minStock) => {
    setProducts(prev => prev.map(p =>
      p.id === product.id
        ? { ...p, stock: newStock, minStock }
        : p
    ))

    showToast('Estoque atualizado!', 'success')
    goHome()
  }

  const goHome = () => {
    setCurrentScreen('home')
    setSelectedProduct(null)
    setSaleData(null)
    setScannerMode(null)
  }

  return (
    <div className="app">
      {/* Header with Logo */}
      <header className="header">
        <img src="/logo.png" alt="720x" className="logo" />
      </header>

      {/* Screens */}
      {currentScreen === 'home' && (
        <HomeScreen
          onVenda={() => openScanner('sale')}
          onInventario={() => openScanner('inventory')}
          onProdutos={() => setCurrentScreen('products')}
          onFinanceiro={() => setCurrentScreen('finance')}
        />
      )}

      {currentScreen === 'scanner' && (
        <ScannerModal
          mode={scannerMode}
          onClose={goHome}
          onScan={handleScanResult}
        />
      )}

      {currentScreen === 'sale' && selectedProduct && (
        <SaleScreen
          product={selectedProduct}
          onClose={goHome}
          onConfirm={handleConfirmSale}
        />
      )}

      {currentScreen === 'inventory' && selectedProduct && (
        <InventoryScreen
          product={selectedProduct}
          onClose={goHome}
          onSave={handleUpdateInventory}
        />
      )}

      {currentScreen === 'finance' && (
        <FinanceScreen onClose={goHome} />
      )}

      {currentScreen === 'products' && (
        <ProductsScreen products={products} onClose={goHome} />
      )}

      {currentScreen === 'success' && saleData && (
        <SuccessScreen
          saleData={saleData}
          onClose={goHome}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App
