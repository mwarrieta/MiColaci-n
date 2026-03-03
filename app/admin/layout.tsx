import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Utensils, ClipboardList, Truck, Users, LogOut, Store, Settings, ChefHat, BarChart3, DollarSign, Shield } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('nombre, rol').eq('id', user.id).single()
    if (profile?.rol !== 'admin') redirect('/')

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
        { href: '/admin/menu', label: 'Menú', icon: Utensils },
        { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
        { href: '/admin/delivery', label: 'Delivery', icon: Truck },
        { href: '/admin/cocina', label: 'Cocina', icon: ChefHat },
        { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
        { href: '/admin/costos', label: 'Costos', icon: DollarSign },
        { href: '/admin/auditoria', label: 'Auditoría', icon: Shield },
        { href: '/admin/configuraciones', label: 'Ajustes', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900">
            <header className="bg-white text-gray-900 sticky top-0 z-50 shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-brand-500 rounded-lg text-white">
                            <Utensils className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-heading font-bold tracking-tight hidden sm:block">La Cocina de Elvira</h1>
                        <span className="bg-brand-500/20 border border-brand-500/30 text-[10px] uppercase font-bold px-2.5 py-1 rounded-md text-brand-400 tracking-wide">ADMIN</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/" target="_blank" className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-xl transition-all border border-brand-500/20 font-bold whitespace-nowrap">
                            <Store className="w-4 h-4" /> <span className="hidden lg:inline">Ver Tienda</span>
                        </Link>

                        <span className="text-sm font-medium text-gray-300 hidden md:block truncate max-w-[150px]">{profile?.nombre || user.email}</span>

                        <form action="/auth/signout" method="post">
                            <button type="submit" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl transition-all border border-gray-200">
                                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Nav Tabs */}
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-hide">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-2 text-sm text-gray-500 font-medium hover:text-brand-600 hover:bg-gray-50 border-b-2 border-transparent hover:border-brand-500 px-4 py-3 transition-all whitespace-nowrap"
                            >
                                <Icon className="w-4 h-4" /> {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {children}
            </main>
        </div>
    )
}
