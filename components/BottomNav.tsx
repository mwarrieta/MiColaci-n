"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Utensils, ShoppingBag, ClipboardList, User, ShieldCheck, Bike, LogOut, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useEffect, useState } from 'react'

interface NavLink {
    href: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    badge?: boolean
}

interface BottomNavProps {
    userRole: string
    isLoggedIn?: boolean
    hideOnMobile?: boolean
}

export function BottomNav({ userRole, isLoggedIn = false, hideOnMobile = false }: BottomNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)
    const totalItems = useCartStore((state) => state.getTotalItems())

    useEffect(() => {
        setMounted(true)
    }, [])

    const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path))

    const navLinks: NavLink[] = [
        { href: '/', label: 'Menú', icon: Utensils },
        { href: '/carrito', label: 'Carrito', icon: ShoppingBag, badge: true },
        { href: '/mis-pedidos', label: 'Pedidos', icon: ClipboardList },
    ]

    // Link dinámico según rol
    const roleLink: NavLink = userRole === 'admin'
        ? { href: '/admin', label: 'Admin', icon: ShieldCheck }
        : userRole === 'repartidor'
            ? { href: '/delivery', label: 'Delivery', icon: Bike }
            : { href: '/perfil', label: 'Perfil', icon: User }

    const allLinks: NavLink[] = [...navLinks, roleLink]

    return (
        <>
            {/* Móvil: barra inferior fija */}
            {!hideOnMobile && (
                <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-wood-100 py-2.5 px-6 flex justify-between items-center sm:hidden z-50">
                    {allLinks.map((link) => {
                        const Icon = link.icon
                        const active = isActive(link.href)
                        return (
                            <Link key={link.href} href={link.href} className={`relative flex flex-col items-center gap-1 transition-colors ${active ? 'text-brand-600' : 'text-wood-500 hover:text-brand-500'}`}>
                                <div className={`p-1.5 rounded-2xl transition-colors ${active ? 'bg-brand-50' : ''}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-bold">{link.label}</span>
                                {link.badge && mounted && totalItems > 0 && (
                                    <span className="absolute top-0 right-1 translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce shadow-sm">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            )}

            {/* Desktop: barra horizontal superior */}
            <nav className="hidden sm:flex fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-wood-100 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto w-full px-6 py-3 flex items-center justify-between">
                    {/* Logo + Nombre */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <img
                            src="/Logo_La_Cocina_de_Elvira.jpeg"
                            alt="La Cocina de Elvira"
                            className="w-12 h-12 rounded-full object-cover border-2 border-brand-500 shadow-md group-hover:scale-105 transition-transform"
                        />
                        <span className="text-xl font-heading font-bold text-wood-700 tracking-tight">La Cocina de Elvira</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        {pathname !== '/' && (
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-wood-500 hover:text-wood-700 hover:bg-wood-100 transition mr-2"
                                title="Volver atrás"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden lg:inline">Volver</span>
                            </button>
                        )}

                        {allLinks.map((link) => {
                            const Icon = link.icon
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${active
                                        ? 'bg-brand-50 text-brand-600 shadow-sm'
                                        : 'text-wood-500 hover:text-brand-600 hover:bg-brand-50/50'
                                        }`}
                                >
                                    <Icon className="w-4.5 h-4.5" />
                                    {link.label}
                                    {link.badge && mounted && totalItems > 0 && (
                                        <span className="bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm ml-1">
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}

                        {isLoggedIn && (
                            <div className="ml-2 pl-2 border-l border-wood-100 flex items-center">
                                <form action="/auth/signout" method="post">
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                                    >
                                        <LogOut className="w-4.5 h-4.5" />
                                        Salir
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </>
    )
}
