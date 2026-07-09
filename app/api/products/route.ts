import { NextResponse } from "next/server"

const UPSTREAM = "https://api-sorbo.onrender.com/api/v1/products"

export const revalidate = 60

export async function GET() {
  try {
    const res = await fetch(UPSTREAM, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream respondió ${res.status}` },
        { status: 502 },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el servidor de productos" },
      { status: 502 },
    )
  }
}
