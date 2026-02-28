---
name: mi-colacion-arquitectura
description: Describe la arquitectura técnica completa de Mi Colación. Usar cuando se crea una nueva página, ruta, componente, Server Action, o cuando se necesita entender el flujo de datos, la estructura de carpetas o las decisiones de diseño del sistema.
---

# 🏗️ Arquitectura Técnica — Mi Colación

## Stack

| Capa          | Tecnología            | Versión     |
|---------------|-----------------------|-------------|
| Framework     | Next.js App Router    | 16+         |
| Lenguaje      | TypeScript            | 5+          |
| Estilos       | Tailwind CSS          | v4          |
| DB/Auth       | Supabase (SSR)        | Latest      |
| Estado global | Zustand               | Latest      |
| Notificaciones| Sonner                | Latest      |
| Iconos        | Lucide React          | Latest      |
| Utilidades    | clsx, tailwind-merge  | Latest      |

---

## Estructura de Carpetas

```
mi-colacion/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       ├── page.tsx          ← Form de login/registro
│   │       └── actions.ts        ← Server Actions de Auth
│   ├── admin/                    ← Protected: rol="admin"
│   │   ├── layout.tsx
│   │   ├── page.tsx              ← Dashboard KPIs
│   │   ├── menu/page.tsx         ← CRUD de menú
│   │   └── pedidos/page.tsx      ← Gestión pedidos
│   ├── delivery/                 ← Protected: rol="repartidor"
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── carrito/
│   │   └── page.tsx              ← Vista carrito (client)
│   ├── checkout/
│   │   ├── page.tsx              ← Formulario checkout (client)
│   │   ├── actions.ts            ← Server Action: processOrder()
│   │   └── success/page.tsx      ← Confirmación + datos pago
│   ├── mis-pedidos/
│   │   └── page.tsx              ← Historial del cliente (server)
│   ├── api/
│   │   └── auth/
│   │       └── signout/route.ts  ← POST handler signout
│   ├── layout.tsx                ← Root: fuentes + Toaster
│   ├── page.tsx                  ← Home público + menú del día
│   └── globals.css
├── components/
│   ├── ui/
│   │   ├── Button.tsx            ← Variants: primary, ghost
│   │   ├── MenuCard.tsx          ← Tarjeta de ítem del menú
│   │   └── StatusBadge.tsx       ← Badges de estado de pedido
│   ├── BottomNav.tsx             ← Navegación inferior móvil (client)
│   └── MenuCatalog.tsx           ← Catálogo interactivo (client)
├── lib/
│   └── supabase/
│       ├── client.ts             ← createBrowserClient
│       ├── server.ts             ← createServerClient (SSR)
│       └── middleware.ts         ← updateSession + role guard
├── store/
│   └── cartStore.ts              ← Zustand + persist (localStorage)
├── middleware.ts                 ← Punto de entrada del Middleware
└── .env.local                    ← Variables de entorno
```

---

## Flujo de Autenticación y Roles

```
Usuario → Middleware → updateSession() → Supabase Auth
                           ↓
                     profiles.rol
                     ┌──────────────────┐
                     │ cliente → /       │
                     │ admin   → /admin  │
                     │ repartidor → /delivery │
                     └──────────────────┘
```

**Regla de Oro de Seguridad:**

- El Middleware verifica el rol en CADA petición consultando `profiles.rol` en Supabase.
- Los clientes NUNCA ven botones ni pistas de que existe `/admin`.
- Los Server Actions re-verifican `user.id` antes de cualquier escritura en DB.

---

## Patrones de Código

### Server Component (lectura de datos)

```tsx
// Siempre usar createClient de @/lib/supabase/server
import { createClient } from "@/lib/supabase/server"
export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.from("tabla").select("*")
  return <div>{/* renderizar */}</div>
}
```

### Server Action (escritura de datos)

```tsx
"use server"
import { createClient } from "@/lib/supabase/server"
export async function miAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")
  // ... lógica de escritura
}
```

### Client Component (interactividad)

```tsx
"use client"
// Usar createClient de @/lib/supabase/client SOLO si necesitas auth en client
// Preferir pasar datos desde Server Component como props
```

---

## Base de Datos — Tablas Principales

| Tabla              | Descripción                             |
|--------------------|-----------------------------------------|
| `profiles`         | Perfil de usuario (rol, nombre, tel)    |
| `categorias`       | Grupos de menú (Almuerzo, Bebidas…)     |
| `items_menu`       | Platos individuales con precio y foto   |
| `pedidos`          | Cabecera del pedido (estado, totales)   |
| `detalle_pedidos`  | Líneas de items por pedido (FK)         |
| `pagos`            | Registro de transacciones de pago       |

### ENUMs de Supabase

```sql
rol_usuario:  cliente | admin | repartidor
estado_pedido: pendiente | confirmado | preparando | en_camino | entregado | cancelado
metodo_pago: transferencia | mercadopago | efectivo
tipo_entrega: delivery | retiro
```

---

## Estado Global (Zustand)

```ts
// store/cartStore.ts
interface CartItem {
  id: string
  nombre: string
  precio: number
  imagen_url?: string
  cantidad: number
}

useCartStore.getState().items       // lista de items
useCartStore.getState().addItem()   // agregar +1
useCartStore.getState().decreaseItem() // restar -1
useCartStore.getState().removeItem()   // eliminar
useCartStore.getState().clearCart()    // vaciar
useCartStore.getState().getTotal()     // total $
useCartStore.getState().getTotalItems() // count
```

El carrito persiste en `localStorage` con `zustand/middleware/persist`.

---

## Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=   (solo server, no exponer)
```
