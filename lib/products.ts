/**
 * Producto tal como lo consume el catálogo. La respuesta del backend trae más
 * campos (`tipoId`, `precioCosto`, `porcentajeGanancia`, `costos`, `soldCount`,
 * timestamps); acá se declaran solo los que la UI usa, porque es una app de
 * solo lectura y los precios llegan ya calculados.
 */
export interface Product {
  id: string
  nombre: string
  descripcion?: string
  tipoNombre: string
  precioVenta: number
  precioVentaMayorista: number
  stock: number
}

export const PRODUCTS_ENDPOINT = "/api/products"

/**
 * Redondea un monto al centenar más cercano.
 * Analiza el resto de la división por 100: si es < 50 baja al múltiplo de 100
 * inferior, si es >= 50 sube al superior. No muta el valor original.
 *   2460 -> 2500 | 2230 -> 2200 | 2250 -> 2300 | 2149 -> 2100 | 2150 -> 2200
 */
export function roundToNearestHundred(value: number): number {
  return Math.round((value ?? 0) / 100) * 100
}

/**
 * Normaliza un producto tal como llega de la API para mostrarlo en el listado.
 *
 * Los precios ya vienen calculados por el backend (`ProductsService` cruza los
 * CostItem con los TiposCosto marcados como `aplicaATodos` y suma los del tipo
 * propio del producto). Acá SOLO se redondea al centenar más cercano, que es la
 * regla de presentación de este catálogo. El redondeo se aplica una única vez,
 * en el fetch, para que la card y el carrito trabajen siempre con el mismo
 * número y los totales coincidan.
 */
function normalizeProduct(product: Product): Product {
  return {
    ...product,
    precioVenta: roundToNearestHundred(product.precioVenta),
    precioVentaMayorista: roundToNearestHundred(product.precioVentaMayorista),
  }
}

export async function fetchProducts(url: string): Promise<Product[]> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Error ${res.status} al obtener los productos`)
  }
  const data = (await res.json()) as Product[]
  return data.map(normalizeProduct)
}

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export function formatPrice(value: number): string {
  return currency.format(Math.round(value))
}

/** Unidades totales del pedido para acceder al precio mayorista. */
export const WHOLESALE_MIN_UNITS = 10

/**
 * Indica si el pedido llega al mínimo mayorista.
 *
 * Se evalúa sobre el **total de unidades del carrito**, sin importar cómo se
 * reparten entre productos: 10 unidades de un blend, 10 blends distintos de 1
 * unidad, o 5 + 5 de dos blends califican todos igual.
 *
 * Al ser una regla del pedido y no de cada línea, el carrito se cobra entero a
 * un solo precio: o todo mayorista o todo minorista, nunca mezclado.
 */
export function qualifiesForWholesale(totalUnits: number): boolean {
  return totalUnits >= WHOLESALE_MIN_UNITS
}
