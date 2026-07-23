# AGENTS.md

Guía para agentes de IA (Claude Code y similares) que trabajan en este repositorio.
Estas instrucciones tienen prioridad sobre el comportamiento por defecto del agente.

## Qué es este proyecto

Catálogo web público de **Sorbo** (blends y sabores de yerba/té). Muestra los
productos disponibles en stock, permite buscarlos, alternar entre precio
**minorista** y **mayorista**, y armar una lista/carrito. Es una app de
**solo lectura** para el cliente final: no hay login, ni panel de administración,
ni escritura hacia el backend.

## Stack

- **Next.js 16** con **App Router** (`app/`), **React 19**, **TypeScript** (`strict`).
- **Tailwind CSS v4** (via `@tailwindcss/postcss`), tokens en `app/globals.css`.
- **shadcn/ui** sobre `@base-ui/react`; iconos de `lucide-react`.
- **SWR** para data fetching en cliente.
- **pnpm** como gestor de paquetes (hay `pnpm-lock.yaml`; **no usar npm/yarn**).
- `@vercel/analytics` (solo en producción).

## Comandos

Estos comandos los ejecuta **el desarrollador**, no el agente (ver
[Política de ejecución de comandos](#política-de-ejecución-de-comandos)).
Correr todo desde la raíz del proyecto.

- `pnpm install` — instalar dependencias.
- `pnpm dev` — servidor de desarrollo (`next dev`, por defecto http://localhost:3000).
- `pnpm build` — build de producción (`next build`). Los errores de tipos rompen el build.
- `pnpm start` — sirve el build de producción.
- `pnpm lint` — ESLint (`eslint .`).

> No hay test runner configurado. La verificación de correctitud es el
> **build/typecheck de TypeScript** (`pnpm build`) y `pnpm lint`, y la corre
> el desarrollador.

## Política de ejecución de comandos

- **El agente / IA NO debe ejecutar comandos de proyecto** (`pnpm install`,
  `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, tests, etc.). La
  validación con comandos `pnpm` la hace **el desarrollador**.
- Los **únicos** comandos que el agente puede correr son los de control de
  versiones y gestión de PRs:
  - Crear y cambiar de ramas (`git checkout -b`, `git checkout`).
  - Actualizar (`git pull`, `git fetch`).
  - Commit y push (`git add`, `git commit`, `git push`).
  - Crear y revisar Pull Requests (`gh pr create`, `gh pr view`, `gh pr review`, ...).
- El agente implementa el cambio en el código; cuando necesita verificarlo,
  **le pide al desarrollador** que corra el build/lint correspondiente.

## Arquitectura

### Estructura

- `app/` — App Router.
  - `app/layout.tsx` — layout raíz, metadata, fuente `Nunito_Sans`, `lang="es"`.
  - `app/page.tsx` — página única del catálogo (client component).
  - `app/api/products/route.ts` y `app/api/costs/route.ts` — route handlers.
  - `app/globals.css` — estilos globales y tokens de Tailwind.
- `components/` — componentes de React.
  - `product-catalog.tsx`, `product-card.tsx`, `cart-provider.tsx`, `cart-panel.tsx`, `site-header.tsx`.
  - `components/ui/` — primitivas shadcn (`button.tsx`, ...).
- `lib/` — lógica de dominio y utilidades.
  - `products.ts` — tipo `Product`, fetch, y **cálculo de precios**.
  - `costs.ts` — tipo `CostItem` y fetch de costos.
  - `utils.ts` — `cn()` (clsx + tailwind-merge).
- `public/` — assets estáticos (logo, íconos, placeholders).
- Alias de imports: **`@/*` → raíz del proyecto** (definido en `tsconfig.json`).

### Backend-for-frontend (BFF)

Los route handlers en `app/api/*` actúan como **proxy** hacia la API real y NO
exponen el upstream al navegador:

- Upstream: `https://api-sorbo.onrender.com/api/v1` (`/products`, `/costs`).
- Cachean con `revalidate = 60` (ISR, 60 s).
- Ante fallo del upstream devuelven `502` con un mensaje en español.
- El frontend siempre consume las rutas locales `/api/products` y `/api/costs`
  (constantes `PRODUCTS_ENDPOINT` / `COSTS_ENDPOINT`), nunca el upstream directo.

### Datos en el cliente

Patrón por recurso, replicarlo para cualquier feature nueva:

1. `lib/<recurso>.ts` — tipo, constante de endpoint local y función `fetch<Recurso>`.
2. `useSWR(ENDPOINT, fetcher, { revalidateOnFocus: false })` dentro del componente.
3. El componente compone los datos (filtra, ordena, recalcula) con `useMemo`.

### Cálculo de precios (crítico)

El `precioVenta` que llega del backend **se descarta**; el precio que ve el
usuario se **recalcula en el frontend** (`lib/products.ts`):

- `calculateApplicableCosts(costs, tipoProducto)` — suma los `CostItem` cuyo
  `tipo` es `general`, `amortizable` (aplican a todos) o coincide con el tipo
  del producto (`blend` / `caja` / `gin`).
- `calculateSalePrice(precioCosto, costos, porcentaje)` =
  `roundToNearestHundred((precioCosto + costos) * (1 + porcentaje/100))`.
- `roundToNearestHundred(value)` = `Math.round(value / 100) * 100` (redondeo al
  centenar más cercano: resto `< 50` baja, `>= 50` sube).
- `recalculateProduct(product, costs)` produce `precioVenta` (usa
  `porcentajeGanancia`) y `precioVentaMayorista` (usa `porcentajeGananciaMayorista`).
- El redondeo vive **una sola vez en el origen** (`calculateSalePrice`) y se
  propaga a card, carrito y totales. No redondear de nuevo en los renders.
- `formatPrice(value)` formatea en ARS sin decimales (`Intl.NumberFormat es-AR`).

El carrito (`cart-provider.tsx`) expone `unitPrice(product)` (elige mayorista o
minorista según el toggle `wholesale`) y `totalPrice` (suma `unitPrice * quantity`).

## Convenciones

- **Idioma del dominio en español**: `nombre`, `precioCosto`, `porcentajeGanancia`,
  `stock`, `esMayorista`, etc. Mantener nuevos campos en español.
- **Textos de UI en español** (es-AR).
- Money/cantidades: valores no negativos; formatear precios con `formatPrice`.
- Client components marcados con `"use client"` cuando usan estado/hooks.
- Usar el alias `@/...` para imports internos, no rutas relativas largas.
- Estilos con clases Tailwind + helper `cn()`; no CSS inline salvo necesidad.

## Flujo de trabajo para resolver tareas

Seguir estos pasos **en orden** para cualquier cambio no trivial:

### 1. Crear el plan

- Entender el pedido y explorar el código relevante antes de escribir nada.
- Definir el enfoque: qué archivos se tocan, dónde vive el cambio (preferir el
  **origen** sobre parches en cada punto de uso) y cómo se verifica.
- Si hay ambigüedad o decisiones abiertas, consultarlas antes de implementar.

### 2. Implementar el plan

- Aplicar los cambios siguiendo las convenciones de arriba.
- Mantener el cambio acotado al objetivo; no refactorizar de más.
- El agente **no corre** `pnpm build`/`pnpm lint`: al terminar, le indica al
  desarrollador qué comando conviene correr para validar (ver
  [Política de ejecución de comandos](#política-de-ejecución-de-comandos)).

### 3. Rama, commit y push

- Partir siempre de `main` actualizado:
  ```bash
  git checkout main
  git pull origin main
  git checkout -b <tipo>/<descripcion-corta-en-kebab-case>
  ```
  Prefijos de rama: `feat/`, `fix/`, `docs/`, `refactor/`, `chore/`.
- Commit siguiendo **Conventional Commits** con el formato de este repo:
  - `<tipo>: <descripción en inglés, imperativo, minúscula>`
  - **Sin scope** (sin paréntesis: `feat:`, no `feat(precios):`).
  - **Sin body** (solo el título; el detalle va en la descripción del PR).
  - Tipos: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `style`.
  - Ejemplo: `feat: round retail and wholesale prices to nearest hundred`.
  ```bash
  git add <archivos>
  git commit -m "feat: short imperative description"
  git push -u origin <rama>
  ```

### 4. Crear el Pull Request

- Crear el PR contra `main` con `gh pr create`.
- El **título** del PR = el mensaje del commit (mismo Conventional Commit).
- La **descripción** (en español) debe incluir:
  - **Qué cambia** y por qué.
  - **Cómo** se implementó (archivos/funciones clave).
  - **Alcance** (qué se ve afectado).
  - **Verificación**: qué debería validar el desarrollador (build/lint), ya
    que el agente no ejecuta esos comandos.
  - Tablas de ejemplos cuando aplique (ej. casos de cálculo).
- Dejar el PR abierto para revisión; no mergear salvo pedido explícito.
