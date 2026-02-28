---
name: mi-colacion-branding
description: "Sistema de identidad visual v2.0 de Mi Colación. Fuente de verdad ABSOLUTA para colores, tipografías, componentes UI, animaciones, voz de marca y diferenciación competitiva. Usar SIEMPRE que se cree, modifique o revise cualquier elemento visual del proyecto."
---

# 🎨 Branding & Identidad Visual v2.0 — Mi Colación

## Concepto de Marca

**Mi Colación** es un servicio de comida casera premium para trabajadores de empresas en Chile. No es un marketplace masivo. Es una persona — desde su hogar — cocinando con cariño para trabajadores cercanos. La identidad visual debe transmitir **calidez hogareña**, **confianza artesanal** y **eficiencia digital**.

**Mantra de diseño**: "Como si tu vecina que cocina increíble tuviera una app hermosa."

### Posicionamiento vs Competencia

| Atributo | Rappi | PedidosYa | Mi Colación |
|---|---|---|---|
| Paleta | Rojo neón `#FF2300` | Rojo + Amarillo | Terracota `#D4634A` + Oliva |
| Sensación | Urgencia / Masivo | Rapidez / Corporativo | Calidez / Hogar / Personal |
| Tipografía | Sans genérica | Sans genérica | Serif + Sans cálida |
| Background | Blanco frío | Blanco frío | Crema artesanal `#FAF7F2` |
| Target | Todo público masivo | Todo público masivo | Trabajadores + Hogares cercanos |

---

## Paleta de Colores

### Primarios (Marca)

| Token | Hex | CSS Variable | Uso |
|---|---|---|---|
| `brand-50` | `#FDF5F0` | `--color-brand-50` | Fondos suaves, pills inactivas |
| `brand-100` | `#F9E5D8` | `--color-brand-100` | Fondos hover, chips categoría |
| `brand-500` | `#D4634A` | `--color-brand-500` | **PRIMARIO** — CTAs, botones, links activos |
| `brand-600` | `#BC5540` | `--color-brand-600` | Hover de botones primarios |
| `brand-700` | `#9C4433` | `--color-brand-700` | Texto activo, links visitados |
| `brand-900` | `#5C281E` | `--color-brand-900` | Texto bold de énfasis extremo |

### Secundarios (Naturaleza/Frescura)

| Token | Hex | Uso |
|---|---|---|
| `olive-50` | `#F4F7EF` | Fondos de badge "fresco" |
| `olive-500` | `#7B8A5E` | Badges naturales, iconos secundarios |
| `olive-700` | `#5A6843` | Texto secundario sobre fondos claros |

### Acento (Energía)

| Token | Hex | Uso |
|---|---|---|
| `accent-400` | `#D4A843` | Badges de descuento, highlights, CTA secundario |
| `accent-600` | `#B5892D` | Hover sobre acento |

### Superficies

| Nombre | Hex | Uso |
|---|---|---|
| Crema | `#FAF7F2` | Background general de cliente |
| White | `#FFFFFF` | Superficie de cards y modales |
| Admin Dark | `#1E2128` | Background del panel admin |
| Admin Surface | `#262B33` | Cards y componentes admin |
| Admin Text | `#E5E2DD` | Texto principal en admin dark |

### Textos

| Token | Hex | Uso |
|---|---|---|
| `text-primary` | `#2D2319` | Títulos y texto principal (café oscuro, NO negro puro) |
| `text-secondary` | `#8A7E6D` | Subtextos, descripciones, placeholders |
| `text-muted` | `#B5AD9F` | Texto muy tenue, hints |

### Semánticos (Estado de Pedidos)

| Estado | Color | Badge BG | Badge Text |
|---|---|---|---|
| pendiente | Ámbar | `amber-50` | `amber-700` |
| confirmado | Verde | `emerald-50` | `emerald-700` |
| preparando | Terracota | `brand-50` | `brand-700` |
| en_camino | Azul | `blue-50` | `blue-700` |
| entregado | Gris | `gray-100` | `gray-600` |
| cancelado | Rojo | `red-50` | `red-700` |

### Feedback

| Tipo | Color |
|---|---|
| Éxito | `#4CAF6A` |
| Error | `#E05252` |
| Advertencia | `#E6A43D` |
| Info | `#4A90D9` |

---

## Tipografía

| Uso | Fuente | Variable CSS | Weights |
|---|---|---|---|
| Headings | **Playfair Display** | `--font-heading` | 600, 700, 800, 900 |
| Body / UI | **DM Sans** | `--font-sans` | 400, 500, 600, 700 |

### Jerarquía Tipográfica

```
Hero h1    → text-4xl sm:text-5xl font-extrabold font-heading text-[#2D2319]
Section h2 → text-2xl sm:text-3xl font-bold font-heading
Card h3    → text-lg font-bold font-heading
Body       → text-base font-medium text-[#8A7E6D]
Caption    → text-sm font-semibold text-[#B5AD9F]
Label      → text-xs font-bold uppercase tracking-widest
Precio     → font-heading font-bold text-brand-600
```

> Playfair Display en headings genera contraste serif/sans que eleva la percepción de calidad artesanal y se diferencia de TODAS las apps de delivery que usan sans-serif planas.

---

## Componentes Base

### Button

```
primary   → bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/20
secondary → bg-olive-50 text-olive-700 hover:bg-olive-500/20
accent    → bg-accent-400 text-white hover:bg-accent-600
outline   → border-2 border-brand-200 text-brand-700 hover:bg-brand-50
ghost     → text-text-secondary hover:bg-brand-50 hover:text-brand-700
```

Siempre `rounded-2xl`, `active:scale-95`, `transition-all duration-200`.

### MenuCard

- Esquinas: `rounded-3xl`
- Sombra: `shadow-sm shadow-brand-500/5`
- Hover: `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`
- Imagen: `rounded-t-3xl`, hover → `scale-105`
- Precio: fondo `accent-400/10` con `text-brand-600 font-heading font-bold`
- Badge popular: fondo `accent-400`, texto blanco, `🔥 Popular`
- Botón agregar: `bg-brand-500` full-width con icono `+`

### BottomNav (Mobile)

- Fondo: `bg-white/70 backdrop-blur-xl border-t border-brand-100/50`
- Tab activa: pill con `bg-brand-50 text-brand-600`
- Tab inactiva: `text-[#B5AD9F]`
- Badge carrito: `bg-brand-500 text-white` con animación `animate-bounce`

### StatusBadge

Props: `status: "pendiente" | "confirmado" | "preparando" | "en_camino" | "entregado" | "cancelado"`
Forma: pill `rounded-full px-3 py-1 text-xs font-bold`

---

## Micro-animaciones (Framer Motion)

| Elemento | Animación | Config |
|---|---|---|
| Hero text | Stagger fade-in por palabra | `staggerChildren: 0.08` |
| Tarjetas menú | Slide-up al viewport | `initial: {y: 40, opacity: 0}` |
| Botón Agregar | Pulse al hacer clic | `scale: [1, 1.1, 1]` |
| Badge carrito | Bounce al actualizar | `animate-bounce` |
| Transición página | Fade suave | `opacity: 0 → 1, duration: 0.3` |
| Cards admin | Slide-in derecha | `initial: {x: 20, opacity: 0}` |
| Hover tarjetas | Scale + elevación | `scale: 1.02, shadow-xl` |
| Loading | Skeleton shimmer | Gradiente animado |
| Éxito checkout | Checkmark SVG animado + confeti micro | `pathLength: 0 → 1` |

---

## Layout y Espaciado

- **Bordes**: `rounded-3xl` cards grandes, `rounded-2xl` inputs/buttons, `rounded-full` pills/badges
- **Sombras cliente**: `shadow-sm shadow-brand-500/5` default, `shadow-xl` hover
- **Sombras admin**: Sin sombra en dark mode (usar bordes `border-white/5`)
- **Padding cards**: `p-5` o `p-6`
- **Gap secciones**: `space-y-8` o `gap-6`
- **Max-width cliente**: `max-w-5xl mx-auto`
- **Max-width admin**: `max-w-7xl mx-auto`

---

## Iconografía

Librería exclusiva: **Lucide React**. No usar heroicons, font-awesome ni ninguna otra.

| Tamaño | Uso |
|---|---|
| `w-7 h-7` | Íconos hero decorativos |
| `w-6 h-6` | Navegación, acciones grandes |
| `w-5 h-5` | Dentro de botones, headers |
| `w-4 h-4` | Inline con texto, badges |

Iconos de referencia:

- Menú: `Utensils` — Carrito: `ShoppingBag` — Pedidos: `ClipboardList`
- Admin: `ShieldCheck` — Delivery: `Bike` / `MapPin` — Éxito: `CheckCircle2`
- Pago: `CreditCard` — WhatsApp: externa — Exportar: `Download`

---

## Voz y Tono (Copywriting)

- **Cálido y cercano**: "Tu pedido está listo" (NO "Su orden ha sido procesada")
- **Primera persona**: "Elige tu colación" / "Ver mi pedido"
- **Español Chile**: "Colación", "Local", "Despacho"
- **Emocional en hero**: "Cocinado hoy. Con cariño. Para ti."
- **Emojis**: solo en badges de estado y mensajes WhatsApp (✅🛵👨‍🍳🔥)
- **Acción clara**: botones siempre con verbo ("Agregar", "Pedir ahora", "Ver menú")

---

## Reglas de Oro del Diseño

1. **NUNCA** usar negro puro (`#000`). Usar `#2D2319` (café oscuro).
2. **NUNCA** usar gris frío (`#f9fafb`). Usar crema `#FAF7F2`.
3. **NUNCA** usar más de 3 colores por pantalla (primario + secundario + acento).
4. **SIEMPRE** mantener contraste accesible (mínimo 4.5:1 para texto).
5. **SIEMPRE** animar la entrada de elementos visibles (fade-in mínimo).
6. **SIEMPRE** diferenciar visualmente el panel Admin (dark mode) del lado Cliente (light crema).
