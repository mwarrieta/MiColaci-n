import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { MenuCatalog } from '@/components/MenuCatalog'
import { BottomNav } from '@/components/BottomNav'
import { Utensils, User, LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0


// Tipos para el fetch de datos
interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  orden: number
}

interface ItemMenu {
  id: string
  categoria_id: string
  nombre: string
  descripcion: string | null
  precio: number
  imagen_url: string | null
  activo: boolean
  stock: number | null
  agotado_manual: boolean
}

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Obtener Sesión
  const { data: { user } } = await supabase.auth.getUser()

  let userRole = 'cliente'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
    if (profile) userRole = profile.rol
  }

  // 2. Obtener Categorías activas
  const { data: categorias, error: errorCat } = await supabase
    .from('categorias')
    .select('id, nombre, descripcion, orden')
    .eq('activa', true)
    .order('orden', { ascending: true })

  if (errorCat) console.error('[HomePage] Error categorias:', errorCat)

  // 3. Obtener Items activos
  const { data: items, error: errorItems } = await supabase
    .from('items_menu')
    .select('id, categoria_id, nombre, descripcion, precio, imagen_url, activo, stock, agotado_manual')
    .eq('activo', true)
    .order('nombre', { ascending: true })

  if (errorItems) console.error('[HomePage] Error items_menu:', errorItems)

  // Solo cargar el menú si el usuario está logueado
  let menuPorCategoria: any[] = []
  if (userRole !== 'cliente' || user) {
    menuPorCategoria = (categorias || []).map(cat => ({
      ...cat,
      items: (items || []).filter(item => item.categoria_id === cat.id)
    })).filter(cat => cat.items.length > 0)
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-20 sm:pb-0 sm:pt-20">
      {/* Header - Solo visible en móvil (desktop usa BottomNav desktop bar) */}
      <header className="bg-[#FFF8F0]/80 backdrop-blur-md sticky top-0 z-50 border-b border-wood-100 sm:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/Logo_La_Cocina_de_Elvira.jpeg"
              alt="La Cocina de Elvira"
              width={44}
              height={44}
              className="rounded-full object-cover border-2 border-brand-500 shadow-md"
            />
            <h1 className="text-lg font-heading font-bold text-wood-700 tracking-tight">La Cocina de Elvira</h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="ghost" className="px-3 py-1.5 h-auto rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700">
                  <LogOut className="w-4 h-4 mr-1" /> Salir
                </Button>
              </form>
            ) : (
              <Link href="/login">
                <Button variant="primary" className="px-5 py-2 h-auto text-sm">
                  Ingresar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-wood-900/10 text-center py-12 sm:py-20 mb-10 border border-wood-200 mt-4 sm:mt-0">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/menu-bg.png"
              alt="Plato Artesanal La Cocina de Elvira"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
          </div>

          <div className="relative z-10 px-4">
            <div className="flex justify-center mb-6">
              <Image
                src="/Logo_La_Cocina_de_Elvira.jpeg"
                alt="La Cocina de Elvira Logo"
                width={110}
                height={110}
                className="rounded-full object-cover border-4 border-white/90 shadow-2xl"
              />
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white mb-4 sm:mb-6 tracking-tight leading-tight drop-shadow-md">
              Cocina casera, <br className="sm:hidden" />
              hecha con amor.
            </h2>
            <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto font-medium drop-shadow-md">
              Platos preparados hoy frescos, directo a tu lugar de trabajo.
            </p>
          </div>
        </div>

        {/* Listado del Menú Dinámico o CTA de Login */}
        {!user ? (
          <div className="bg-white rounded-3xl shadow-md shadow-wood-500/10 border border-wood-100 p-8 sm:p-12 max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6">
              <Image
                src="/Logo_La_Cocina_de_Elvira.jpeg"
                alt="La Cocina de Elvira"
                width={96}
                height={96}
                className="rounded-full object-cover border-2 border-brand-500 shadow-lg"
              />
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-wood-700 mb-4">
              ¿Listo para pedir tu colación?
            </h3>
            <p className="text-wood-500 text-lg font-medium mb-8">
              Para ver el delicioso menú de hoy y hacer tu pedido, inicia sesión o crea una cuenta en segundos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full h-12 px-8 text-base">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>
        ) : menuPorCategoria.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md shadow-wood-500/10 border border-wood-100 p-12 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-brand-500" />
            </div>
            <p className="text-wood-500 font-medium text-lg">
              Aún tengo las ollas en el fuego, mi niño. ¡Vuelve en un ratito para ver lo que cociné hoy! 👩‍🍳
            </p>
          </div>
        ) : (
          <MenuCatalog categorias={menuPorCategoria} isLoggedIn={!!user} />
        )}
      </main>

      {/* Bottom nav mobile + Desktop nav */}
      <BottomNav userRole={userRole} isLoggedIn={!!user} />
    </div>
  )
}
