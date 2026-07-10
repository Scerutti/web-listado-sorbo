export type CostType = "general" | "blend" | "caja" | "gin" | "amortizable"

export interface CostItem {
  id: string
  nombre: string
  descripcion?: string
  tipo: CostType
  valor: number
  createdAt?: string
  updatedAt?: string
}

export const COSTS_ENDPOINT = "/api/costs"

export async function fetchCosts(url: string): Promise<CostItem[]> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Error ${res.status} al obtener los costos`)
  }
  const data = (await res.json()) as CostItem[]
  return data
}
