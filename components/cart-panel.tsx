"use client"

import { useEffect } from "react"
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { formatPrice } from "@/lib/products"

export function CartPanel({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const {
    items,
    increment,
    decrement,
    remove,
    clear,
    unitPrice,
    totalItems,
    totalPrice,
    wholesale,
  } = useCart()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  return (
    <div
      className={
        open ? "fixed inset-0 z-50" : "pointer-events-none fixed inset-0 z-50"
      }
      aria-hidden={!open}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-foreground/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mi lista"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Mi lista</h2>
            {totalItems > 0 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {totalItems} u.
              </span>
            )}
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Cerrar lista"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-secondary">
              <ShoppingCart
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            </span>
            <p className="font-medium">Tu lista está vacía</p>
            <p className="text-sm text-muted-foreground">
              Agregá blends desde el catálogo para verlos acá.
            </p>
            <Button variant="outline" onClick={onClose} className="mt-2">
              Ver catálogo
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-4">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-3 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-pretty font-medium leading-tight">
                        {product.nombre}
                      </h3>
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={`Eliminar ${product.nombre}`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatPrice(unitPrice(product))} c/u
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex items-center rounded-lg border border-border">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => decrement(product.id)}
                          aria-label={`Quitar una unidad de ${product.nombre}`}
                        >
                          <Minus className="size-3.5" aria-hidden="true" />
                        </Button>
                        <span className="min-w-7 text-center text-sm font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 disabled:opacity-40"
                          onClick={() => increment(product.id)}
                          disabled={quantity >= product.stock}
                          aria-label={`Agregar una unidad de ${product.nombre}`}
                        >
                          <Plus className="size-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                      <span className="font-semibold tabular-nums">
                        {formatPrice(unitPrice(product) * quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-border px-4 py-4">
              <div className="mb-1 flex items-center justify-between text-sm text-muted-foreground">
                <span>Precios</span>
                <span>{wholesale ? "Mayorista" : "Minorista"}</span>
              </div>
              <div className="mb-4 flex items-baseline justify-between">
                <span className="font-medium">Total</span>
                <span className="text-2xl font-bold text-primary tabular-nums">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <Button
                render={<a href="#" />}
                nativeButton={false}
                className="h-11 w-full text-base"
              >
                Continuar
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <button
                type="button"
                onClick={clear}
                className="mt-3 w-full text-center text-sm text-muted-foreground transition-colors hover:text-destructive"
              >
                Vaciar lista
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
