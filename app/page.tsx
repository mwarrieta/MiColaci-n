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

  // 3. Obtener Items activos (sin columna 'orden' - no existe en esta tabla)
  const { data: items, error: errorItems } = await supabase
    .from('items_menu')
    .select('id, categoria_id, nombre, descripcion, precio, imagen_url, activo')
    .eq('activo', true)
    .order('nombre', { ascending: true })

  if (errorItems) console.error('[HomePage] Error items_menu:', errorItems)

  // Solo cargar el menú si el usuario está logueado
  let menuPorCategoria: any[] = []
  if (userRole !== 'cliente' || user) {
    // 4. Agrupar items por categoría
    menuPorCategoria = (categorias || []).map(cat => ({
      ...cat,
      items: (items || []).filter(item => item.categoria_id === cat.id)
    })).filter(cat => cat.items.length > 0)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20 md:pb-0">
      {/* Header Sticky */}
      <header className="bg-[#FAF7F2]/80 backdrop-blur-md sticky top-0 z-50 border-b border-brand-100/50">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/Logo_La_Cocina_de_Elvira.jpeg"
              alt="La Cocina de Elvira"
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-brand-500"
            />
            <h1 className="text-xl font-heading font-bold text-[#2D2319] tracking-tight mt-1">La Cocina de Elvira</h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <form action="/auth/signout" method="post">
                <Button type="submit" variant="ghost" className="px-3 py-1.5 h-auto rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 hidden sm:flex">
                  <LogOut className="w-4 h-4 mr-2" /> Salir
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
        <div className="text-center py-8 sm:py-16 mb-4">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold text-[#2D2319] mb-4 sm:mb-6 tracking-tight leading-tight">
            Cocinado hoy. <br className="sm:hidden" />
            Con cariño.<br className="hidden sm:block" /> Para ti.
          </h2>
          <p className="text-[#8A7E6D] text-lg sm:text-xl max-w-2xl mx-auto font-medium">
            Comida casera, preparada hoy. Elige tu colación y recíbela directamente en tu lugar de trabajo.
          </p>
        </div>

        {/* Listado del Menú Dinámico o CTA de Login */}
        {!user ? (
          <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-8 sm:p-12 max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-brand-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[#2D2319] mb-4">
              ¿Listo para pedir tu colación?
            </h3>
            <p className="text-[#8A7E6D] text-lg font-medium mb-8">
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
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-brand-500" />
            </div>
            <p className="text-gray-500 font-medium text-lg">
              No hay colaciones disponibles por el momento.
            </p>
          </div>
        ) : (
          <MenuCatalog categorias={menuPorCategoria} isLoggedIn={!!user} />
        )}
      </main>

      {/* Bottom nav mobile dinámico */}
      <BottomNav userRole={userRole} />
    </div>
  )
}

