---
name: mi-colacion-nuevas-funciones
description: "Guía paso a paso para agregar nuevas funcionalidades a Mi Colación. Usar cuando el usuario pide crear una nueva página, módulo, formulario, Server Action, o cualquier nueva característica del sistema. Asegura consistencia con el stack y el sistema de diseño."
---

# ➕ Agregar Nuevas Funciones — Mi Colación

## Checklist de Nueva Página/Feature

Antes de crear cualquier nueva funcionalidad, seguir estas comprobaciones:

1. **¿Es Server Component o Client Component?**
   - Si solo muestra datos de DB → Server Component (sin "use client")
   - Si tiene estado, eventos, efectos → Client Component ("use client")
   - Si hace ambas → Server para data fetching, Client para partes interactivas

2. **¿Necesita protección de rol?**
   - Rutas bajo `/admin/*` → verificadas por Middleware automáticamente
   - Rutas bajo `/delivery/*` → verificadas por Middleware automáticamente
   - Rutas de clientes → cualquier usuario logueado puede acceder

3. **¿Escribe datos en DB?**
   - Siempre usar **Server Action** en archivo `actions.ts` junto a la página
   - Siempre verificar `auth.getUser()` al inicio de la acción
   - Nunca confiar en datos de precio/costo del cliente

4. **¿Tiene elementos visuales?**
   - **LEER LA SKILL `mi-colacion-branding`** antes de elegir colores, fuentes o estilos.
   - Usar `framer-motion` para animaciones de entrada en elementos visibles.
   - Cliente → fondo crema `#FAF7F2`, colores terracota.
   - Admin → dark mode `#1E2128`, cards `#262B33`.

---

## Plantilla: Nueva Página Admin (Dark Mode)

```tsx
// app/admin/[modulo]/page.tsx
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminModuloPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  
  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
  if (profile?.rol !== "admin") redirect("/")
  
  const { data: items } = await supabase.from("tabla").select("*")
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold text-admin-text">Módulo</h1>
      {/* UI aquí — usar colores admin dark */}
    </div>
  )
}
```

---

## Plantilla: Nuevo Server Action

```ts
// app/[ruta]/actions.ts
"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function miNuevaAccion(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }
  
  const campo = formData.get("campo") as string
  if (!campo) return { error: "Campo requerido" }
  
  const { error } = await supabase.from("tabla").insert({ campo, user_id: user.id })
  if (error) return { error: error.message }
  
  revalidatePath("/ruta-que-debe-actualizarse")
  return { success: true }
}
```

---

## Plantilla: Nuevo Componente UI Cliente

```tsx
// components/ui/MiComponente.tsx
"use client"
import { motion } from "framer-motion"

interface MiComponenteProps {
  className?: string
}

export function MiComponente({ className = "" }: MiComponenteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-3xl shadow-sm shadow-brand-500/5 border border-brand-100/50 p-6 ${className}`}
    >
      {/* contenido */}
    </motion.div>
  )
}
```

---

## Agregar una Ruta Nueva

1. Crear `app/[nueva-ruta]/page.tsx`
2. Si tiene formularios interactivos, agregar `app/[nueva-ruta]/actions.ts`
3. Si es admin, agregar bajo `app/admin/[nueva-ruta]/`
4. Agregar enlace en layout correspondiente (`admin/layout.tsx` o `BottomNav.tsx`)
5. Verificar que el Middleware no bloquea la ruta
6. **CONSULTAR skill de branding** para estilos y colores

---

## Estado Actual del Roadmap

| Fase | Módulo | Estado |
|---|---|---|
| 1-5 | Fundaciones, Auth, DB, Menú, Carrito, Checkout | ✅ |
| 6 | Dashboard Admin | ✅ |
| 7 | CRUD Menú Admin + Categorías | ✅ |
| 8 | Gestión de Usuarios y Roles | ✅ |
| 9 | Módulo Delivery / Repartidores | ✅ |
| 10 | Notificaciones WhatsApp | ✅ |
| 11 | Integración de Pagos (Mercado Pago) | ✅ |
| 12 | Analytics y KPIs | ✅ |
| 13 | Deploy Vercel (Producción) | ⏳ Pendiente |
| 14 | **Rediseño Visual v2.0** | 🔄 En progreso |
