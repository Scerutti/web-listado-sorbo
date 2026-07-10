export interface Product {
  id: string
  nombre: string
  descripcion?: string
  tipo: string
  precioCosto: number
  porcentajeGanancia: number
  porcentajeGananciaMayorista: number
  costos: string[]
  precioVenta: number
  precioVentaMayorista: number
  stock: number
  soldCount: number
  createdAt?: string
  updatedAt?: string
}

import type { CostItem } from "@/lib/costs"

export const PRODUCTS_ENDPOINT = "/api/products"

export async function fetchProducts(url: string): Promise<Product[]> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Error ${res.status} al obtener los productos`)
  }
  const data = (await res.json()) as Product[]
  return data
}

/**
 * Suma de los CostItem que aplican a un producto según su tipo.
 * Un costo aplica si es `general`, `amortizable` (aplican a todos) o si su
 * `tipo` coincide con el tipo del producto (blend/caja/gin). Replica
 * `calculateApplicableCosts` de la página principal (shared/functions.tsx).
 */
export function calculateApplicableCosts(
  costs: CostItem[],
  tipoProducto: string,
): number {
  return costs
    .filter(
      (cost) =>
        cost.tipo === "general" ||
        cost.tipo === tipoProducto ||
        cost.tipo === "amortizable",
    )
    .reduce((acc, cost) => acc + cost.valor, 0)
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Precio de venta con costos incluidos:
 *   (precioCosto + costosAplicables) * (1 + porcentaje / 100)
 */
function calculateSalePrice(
  precioCosto: number,
  costos: number,
  porcentaje: number,
): number {
  const base = (precioCosto ?? 0) + costos
  return round2(base * (1 + (porcentaje ?? 0) / 100))
}

/**
 * Recalcula precioVenta y precioVentaMayorista de un producto cruzando los
 * CostItem por tipo, tal como lo hace el listado de la app principal
 * (recalculateProductFinancials). El precioVenta que trae el backend se
 * descarta a favor de este cálculo.
 */
export function recalculateProduct(
  product: Product,
  costs: CostItem[],
): Product {
  const costos = calculateApplicableCosts(costs, product.tipo)
  return {
    ...product,
    precioVenta: calculateSalePrice(
      product.precioCosto,
      costos,
      product.porcentajeGanancia,
    ),
    precioVentaMayorista: calculateSalePrice(
      product.precioCosto,
      costos,
      product.porcentajeGananciaMayorista || 0,
    ),
  }
}

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
  return currency.format(Math.round(value))
}
