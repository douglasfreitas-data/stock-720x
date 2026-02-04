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
import ProductListScreen from './screens/ProductListScreen'
import PrintQRScreen from './screens/PrintQRScreen'
import CartScreen from './screens/CartScreen'
import CheckoutScreen from './screens/CheckoutScreen'

function App() {
  // State
  const [products, setProducts] = useState(initialProducts)
  const [currentScreen, setCurrentScreen] = useState('home')
  const [scannerMode, setScannerMode] = useState(null) // 'sale' or 'inventory'
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [saleData, setSaleData] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Cart State
  const [cart, setCart] = useState([]) // Array of { productId, quantity }

  // Toast
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleExit = () => {
    window.close()
    // Fallback se window.close não funcionar (navegador bloqueia)
    window.location.href = 'about:blank'
  }

  // Cart Functions
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.productId === product.id)
      if (existingItem) {
        // Update quantity if product already in cart
        const newQty = Math.min(existingItem.quantity + quantity, product.stock)
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: newQty }
            : item
        )
      } else {
        // Add new item
        return [...prev, { productId: product.id, quantity: Math.min(quantity, product.stock) }]
      }
    })
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId))
  }

  const updateCartQuantity = (productId, quantity) => {
    setCart(prev => prev.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ))
  }

  const clearCart = () => {
    setCart([])
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

      if (scannerMode === 'sale') {
        // Add to cart and go to cart screen
        addToCart(currentProduct)
        showToast(`${currentProduct.name} adicionado ao carrinho!`, 'success')
        setCurrentScreen('cart')
      } else {
        // Inventory mode - keep original behavior
        setSelectedProduct(currentProduct)
        setCurrentScreen('inventory')
      }
    } else {
      showToast('Produto não encontrado', 'error')
    }
  }

  // Keep old sale handler for backwards compatibility (single product)
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
      items: [{ product, quantity, oldStock, newStock }],
      customer,
      paymentMethod,
      totalItems: quantity,
      totalValue: product.price * quantity
    })

    setCurrentScreen('success')
  }

  // New cart sale handler
  const handleConfirmCartSale = (customer, paymentMethod) => {
    // Calculate sale data BEFORE updating state
    const saleItems = []
    let totalItems = 0
    let totalValue = 0

    cart.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.productId)
      if (product) {
        const oldStock = product.stock
        const newStock = oldStock - cartItem.quantity

        saleItems.push({
          product: { ...product },
          quantity: cartItem.quantity,
          oldStock,
          newStock
        })

        totalItems += cartItem.quantity
        totalValue += product.price * cartItem.quantity
      }
    })

    // Update stock for each item in cart
    setProducts(prev => {
      const updatedProducts = [...prev]

      cart.forEach(cartItem => {
        const productIndex = updatedProducts.findIndex(p => p.id === cartItem.productId)
        if (productIndex !== -1) {
          const product = updatedProducts[productIndex]
          const newStock = product.stock - cartItem.quantity

          updatedProducts[productIndex] = {
            ...product,
            stock: newStock
          }
        }
      })

      return updatedProducts
    })

    // Save sale data for success screen
    setSaleData({
      items: saleItems,
      customer,
      paymentMethod,
      totalItems,
      totalValue
    })

    // Clear cart and go to success
    clearCart()
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

  const goToCart = () => {
    setCurrentScreen('cart')
  }

  const goToCheckout = () => {
    setCurrentScreen('checkout')
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
          onSair={handleExit}
        />
      )}

      {currentScreen === 'scanner' && (
        <ScannerModal
          mode={scannerMode}
          cartCount={cart.length}
          onClose={goHome}
          onScan={handleScanResult}
          onViewCart={goToCart}
        />
      )}

      {currentScreen === 'sale' && selectedProduct && (
        <SaleScreen
          product={selectedProduct}
          onClose={goHome}
          onConfirm={handleConfirmSale}
        />
      )}

      {currentScreen === 'cart' && (
        <CartScreen
          cart={cart}
          products={products}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onScanMore={() => openScanner('sale')}
          onCheckout={goToCheckout}
          onClose={goHome}
        />
      )}

      {currentScreen === 'checkout' && (
        <CheckoutScreen
          cart={cart}
          products={products}
          onConfirm={handleConfirmCartSale}
          onBack={goToCart}
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
        <ProductsScreen
          products={products}
          onClose={goHome}
          onProductList={() => setCurrentScreen('productList')}
          onPrintQR={() => setCurrentScreen('printQR')}
        />
      )}

      {currentScreen === 'productList' && (
        <ProductListScreen
          products={products}
          onClose={() => setCurrentScreen('products')}
        />
      )}

      {currentScreen === 'printQR' && (
        <PrintQRScreen
          products={products}
          onClose={() => setCurrentScreen('products')}
        />
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
