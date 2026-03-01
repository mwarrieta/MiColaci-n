import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { LogOut, User, Mail, ShieldCheck, Bike, Utensils } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'

export default async function PerfilPage() {
    const supabase = await createClient()

    // Verificar sesión
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
        redirect('/login')
    }

    // Obtener rol del perfil
    const { data: profile } = await supabase
        .from('profiles')
        .select('rol, nombre, telefono')
        .eq('id', user.id)
        .single()

    const userRole = profile?.rol || 'cliente'
    const nombre = profile?.nombre || 'Mi Perfil'
    const telefono = profile?.telefono || 'No especificado'

    return (
        <div className="min-h-screen bg-[#FAF7F2] pb-20 md:pb-0">
            {/* Header */}
            <header className="bg-white border-b border-brand-100/50 sticky top-0 z-50">
                <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-heading font-bold text-[#2D2319]">Mi Perfil</h1>
                    {userRole === 'admin' && <ShieldCheck className="text-brand-500 w-5 h-5" />}
                    {userRole === 'repartidor' && <Bike className="text-brand-500 w-5 h-5" />}
                    {userRole === 'cliente' && <Utensils className="text-brand-500 w-5 h-5" />}
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-8 space-y-8">
                {/* Info Tarjeta */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                        <User className="w-10 h-10 text-brand-600" />
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-[#2D2319] mb-1">{nombre}</h2>
                    <div className="flex items-center gap-2 text-gray-500 mb-4">
                        <Mail className="w-4 h-4" />
                        <p className="text-sm font-medium">{user.email}</p>
                    </div>

                    <div className="bg-brand-50 px-4 py-2 rounded-xl border border-brand-100/50 w-full text-left">
                        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">Rol de Usuario</span>
                        <span className="text-[#2D2319] font-medium capitalize">{userRole}</span>
                    </div>

                    {telefono !== 'No especificado' && (
                        <div className="bg-brand-50 px-4 py-2 rounded-xl border border-brand-100/50 w-full text-left mt-3">
                            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block mb-1">Teléfono</span>
                            <span className="text-[#2D2319] font-medium">{telefono}</span>
                        </div>
                    )}
                </div>

                {/* Cierre de sesión */}
                <div className="pt-4">
                    <form action="/auth/signout" method="post">
                        <Button
                            type="submit"
                            variant="outline"
                            className="w-full py-6 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 font-bold transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Cerrar Sesión
                        </Button>
                    </form>
                </div>
            </main>

            {/* Bottom nav mobile dinámico */}
            <BottomNav userRole={userRole} />
        </div>
    )
}
