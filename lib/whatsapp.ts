import { formatPrice } from "@/lib/products"

/**
 * Número de WhatsApp de Sorbo al que se envían los pedidos.
 *
 * Va hardcodeado a propósito: es un dato público del catálogo, igual que el
 * link de Instagram que reemplazó. Como variable `NEXT_PUBLIC_*` terminaría
 * igual en el bundle del cliente y Next la inlinea en build, así que no
 * aportaría ni privacidad ni la posibilidad de cambiarla sin redeploy.
 *
 * Formato internacional, solo dígitos: código de país + `9` + área (sin 0) +
 * número (sin 15). +54 9 3442 689509 -> "5493442689509".
 */
const WHATSAPP_NUMBER = "5493442689509"

/** Una línea del pedido, ya resuelta con el precio vigente (mayorista o minorista). */
export interface OrderLine {
  nombre: string
  quantity: number
  subtotal: number
}

/**
 * Arma el texto del pedido que se precarga en el chat de WhatsApp.
 *
 * WhatsApp no renderiza tablas, así que el "listado" es una lista con viñetas
 * (`cantidad x nombre — subtotal`), que se lee bien en pantallas angostas y no
 * depende de alineación monoespaciada. Cuando el carrito está en modo mayorista
 * se aclara en el encabezado, porque los precios del mensaje difieren de los
 * minoristas y quien recibe el pedido necesita saber con qué lista se armó.
 */
export function buildOrderMessage(
  lines: OrderLine[],
  totalPrice: number,
  wholesale: boolean,
): string {
  const encabezado = wholesale
    ? "Te paso mi pedido (precios mayoristas):"
    : "Te paso mi pedido:"

  const detalle = lines
    .map(
      ({ nombre, quantity, subtotal }) =>
        `• ${quantity} x ${nombre} — ${formatPrice(subtotal)}`,
    )
    .join("\n")

  return [
    "Hola!",
    encabezado,
    "",
    detalle,
    "",
    `Total: ${formatPrice(totalPrice)}`,
    "Gracias!",
  ].join("\n")
}

/**
 * URL de wa.me que abre el chat con el mensaje del pedido ya escrito.
 * `encodeURIComponent` preserva los saltos de línea y los acentos del catálogo.
 */
export function buildWhatsAppOrderUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
