import { createContext, useContext, useEffect, useState } from 'react'
import { starterProducts } from '../data/products'

const StoreContext = createContext()

const getSaved = (key, fallback) => {
  const saved = localStorage.getItem(key)
  return saved ? JSON.parse(saved) : fallback
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() =>
    getSaved('northstar-products', starterProducts)
  )

  const [cart, setCart] = useState(() =>
    getSaved('northstar-cart', [])
  )

  const [wishlist, setWishlist] = useState(() =>
    getSaved('northstar-wishlist', [])
  )

  const [orders, setOrders] = useState(() =>
    getSaved('northstar-orders', [])
  )

  const [user, setUser] = useState(() =>
    getSaved('northstar-user', null)
  )

  useEffect(() => {
    localStorage.setItem(
      'northstar-products',
      JSON.stringify(products)
    )
  }, [products])

  useEffect(() => {
    localStorage.setItem(
      'northstar-cart',
      JSON.stringify(cart)
    )
  }, [cart])

  useEffect(() => {
    localStorage.setItem(
      'northstar-wishlist',
      JSON.stringify(wishlist)
    )
  }, [wishlist])

  useEffect(() => {
    localStorage.setItem(
      'northstar-orders',
      JSON.stringify(orders)
    )
  }, [orders])

  useEffect(() => {
    localStorage.setItem(
      'northstar-user',
      JSON.stringify(user)
    )
  }, [user])

  function addToCart(product) {
    if (!product.stock) return

    setCart(items => {
      const exists = items.some(item => item.id === product.id)

      if (exists) {
        return items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...items,
        {
          ...product,
          quantity: 1
        }
      ]
    })
  }

  function updateQuantity(id, quantity) {
    setCart(items => {
      if (quantity < 1) {
        return items.filter(item => item.id !== id)
      }

      return items.map(item =>
        item.id === id
          ? { ...item, quantity }
          : item
      )
    })
  }

  function toggleWishlist(id) {
    setWishlist(items => {
      if (items.includes(id)) {
        return items.filter(item => item !== id)
      }

      return [...items, id]
    })
  }

  function saveProduct(product) {
    setProducts(items => {
      const exists = items.some(
        item => item.id === product.id
      )

      if (exists) {
        return items.map(item =>
          item.id === product.id
            ? product
            : item
        )
      }

      return [
        ...items,
        {
          ...product,
          id: Date.now(),
          rating: 4.5,
          reviews: 0
        }
      ]
    })
  }

  function deleteProduct(id) {
    setProducts(items =>
      items.filter(item => item.id !== id)
    )

    setCart(items =>
      items.filter(item => item.id !== id)
    )

    setWishlist(items =>
      items.filter(item => item !== id)
    )
  }

  function placeOrder(details) {
    const total = cart.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    )

    const order = {
      id: `NS-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(),
      items: cart,
      total,
      status: 'Processing',
      details
    }

    setOrders(items => [
      order,
      ...items
    ])

    setCart([])

    return order
  }

  return (
    <StoreContext.Provider
      value={{ products,cart, wishlist, orders, user, setUser, addToCart, updateQuantity, toggleWishlist, saveProduct, deleteProduct, placeOrder
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)