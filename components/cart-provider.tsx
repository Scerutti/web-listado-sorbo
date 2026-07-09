"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Product } from "@/lib/products"

export interface CartItem {
  product: Product
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  wholesale: boolean
  setWholesale: (value: boolean) => void
  totalItems: number
  totalPrice: number
  unitPrice: (product: Product) => number
  quantityOf: (id: string) => number
  add: (product: Product) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [wholesale, setWholesale] = useState(false)

  const unitPrice = useMemo(
    () => (product: Product) =>
      wholesale ? product.precioVentaMayorista : product.precioVenta,
    [wholesale],
  )

  const add = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        // Respect available stock
        if (existing.quantity >= product.stock) return prev
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const increment = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === id && i.quantity < i.product.stock
          ? { ...i, quantity: i.quantity + 1 }
          : i,
      ),
    )
  }

  const decrement = (id: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === id ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    )
  }

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== id))
  }

  const clear = () => setItems([])

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  )

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + unitPrice(i.product) * i.quantity, 0),
    [items, unitPrice],
  )

  const quantityOf = (id: string) =>
    items.find((i) => i.product.id === id)?.quantity ?? 0

  const value: CartContextValue = {
    items,
    wholesale,
    setWholesale,
    totalItems,
    totalPrice,
    unitPrice,
    quantityOf,
    add,
    increment,
    decrement,
    remove,
    clear,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider")
  return ctx
}
