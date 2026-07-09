"use client"

import { useState } from "react"
import { CartProvider } from "@/components/cart-provider"
import { CartPanel } from "@/components/cart-panel"
import { ProductCatalog } from "@/components/product-catalog"
import { SiteHeader } from "@/components/site-header"

export default function Page() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader onOpenCart={() => setCartOpen(true)} />

        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Nuestros blends
            </h1>
            <p className="mt-1 text-pretty text-muted-foreground">
              Descubrí los sabores de Sorbo disponibles y armá tu lista.
            </p>
          </div>

          <ProductCatalog />
        </main>

        <CartPanel open={cartOpen} onClose={() => setCartOpen(false)} />
      </div>
    </CartProvider>
  )
}
