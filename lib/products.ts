export interface Product {
  id: string
  nombre: string
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

export const PRODUCTS_ENDPOINT = "/api/products"

export async function fetchProducts(url: string): Promise<Product[]> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Error ${res.status} al obtener los productos`)
  }
  const data = (await res.json()) as Product[]
  return data
}

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
  return currency.format(Math.round(value))
}
