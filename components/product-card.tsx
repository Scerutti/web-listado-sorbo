"use client"

import { Leaf, Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { formatPrice, type Product } from "@/lib/products"

export function ProductCard({ product }: { product: Product }) {
  const { add, increment, decrement, quantityOf, wholesale } = useCart()
  const quantity = quantityOf(product.id)
  const lowStock = product.stock <= 5
  const maxed = quantity >= product.stock

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Leaf className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="text-pretty font-semibold leading-tight text-card-foreground">
              {product.nombre}
            </h3>
            <p className="mt-0.5 text-xs capitalize text-muted-foreground">
              {product.tipo}
            </p>
          </div>
        </div>
        <span
          className={
            lowStock
              ? "shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"
              : "shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
          }
        >
          {lowStock ? `¡${product.stock} u.!` : `${product.stock} u.`}
        </span>
      </div>

      <div className="mt-auto space-y-3 p-4 pt-0">
        <div className="rounded-lg bg-secondary/60 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-muted-foreground">Minorista</span>
            <span
              className={
                wholesale
                  ? "text-sm font-medium text-muted-foreground"
                  : "text-lg font-bold text-primary"
              }
            >
              {formatPrice(product.precioVenta)}
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className="text-xs text-muted-foreground">Mayorista</span>
            <span
              className={
                wholesale
                  ? "text-lg font-bold text-primary"
                  : "text-sm font-medium text-muted-foreground"
              }
            >
              {formatPrice(product.precioVentaMayorista)}
            </span>
          </div>
        </div>

        {quantity === 0 ? (
          <Button
            className="h-10 w-full"
            onClick={() => add(product)}
            aria-label={`Agregar ${product.nombre} a la lista`}
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            Agregar
          </Button>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-border bg-background p-1">
            <Button
              size="icon"
              variant="ghost"
              className="size-9"
              onClick={() => decrement(product.id)}
              aria-label={`Quitar una unidad de ${product.nombre}`}
            >
              <Minus className="size-4" aria-hidden="true" />
            </Button>
            <span
              className="min-w-8 text-center font-semibold tabular-nums"
              aria-live="polite"
            >
              {quantity}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="size-9 disabled:opacity-40"
              onClick={() => increment(product.id)}
              disabled={maxed}
              aria-label={`Agregar una unidad de ${product.nombre}`}
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </article>
  )
}
