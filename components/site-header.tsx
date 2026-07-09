"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart-provider"

export function SiteHeader({ onOpenCart }: { onOpenCart: () => void }) {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-serif text-lg font-bold leading-none">S</span>
          </span>
          <div className="leading-tight">
            <p className="font-bold tracking-tight">Sorbo Sabores</p>
            <p className="text-xs text-muted-foreground">Catálogo de blends</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCart}
          className="relative flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          aria-label={`Abrir mi lista, ${totalItems} unidades`}
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Mi lista</span>
          {totalItems > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground tabular-nums">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
