"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Loader2, Package, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import { ProductCard } from "@/components/product-card"
import {
  fetchProducts,
  PRODUCTS_ENDPOINT,
  type Product,
} from "@/lib/products"

export function ProductCatalog() {
  const { wholesale, setWholesale } = useCart()
  const [query, setQuery] = useState("")

  const { data, error, isLoading } = useSWR<Product[]>(
    PRODUCTS_ENDPOINT,
    fetchProducts,
    { revalidateOnFocus: false },
  )

  const inStock = useMemo(
    () => (data ?? []).filter((p) => p.stock > 0),
    [data],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? inStock.filter(
          (p) =>
            p.nombre.toLowerCase().includes(q) ||
            p.tipo.toLowerCase().includes(q),
        )
      : inStock
    return [...list].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
  }, [inStock, query])

  return (
    <section aria-label="Catálogo de productos" className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar blend..."
            aria-label="Buscar productos"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </div>

        <div
          className="flex items-center gap-1 rounded-lg border border-border bg-card p-1"
          role="group"
          aria-label="Tipo de precio"
        >
          <Button
            size="sm"
            variant={wholesale ? "ghost" : "default"}
            className="h-8 flex-1 sm:flex-none"
            onClick={() => setWholesale(false)}
            aria-pressed={!wholesale}
          >
            Minorista
          </Button>
          <Button
            size="sm"
            variant={wholesale ? "default" : "ghost"}
            className="h-8 flex-1 sm:flex-none"
            onClick={() => setWholesale(true)}
            aria-pressed={wholesale}
          >
            Mayorista
          </Button>
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          <p className="text-sm">Cargando catálogo...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16 text-center">
          <p className="font-medium">No pudimos cargar los productos</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Revisá tu conexión e intentá nuevamente en unos segundos.
          </p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          <p className="text-sm text-muted-foreground">
            {filtered.length}{" "}
            {filtered.length === 1
              ? "producto disponible"
              : "productos disponibles"}
          </p>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <Package className="size-6" aria-hidden="true" />
              <p className="text-sm">No encontramos productos con ese nombre.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
