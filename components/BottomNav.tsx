"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Utensils, ShoppingBag, ClipboardList, User, ShieldCheck, Bike } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useEffect, useState } from 'react'

interface BottomNavProps {
    userRole: string
}

export function BottomNav({ userRole }: BottomNavProps) {
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    const totalItems = useCartStore((state) => state.getTotalItems())

    // Evitar hydration error
    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        setMounted(true)
    }, [])

    const isActive = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path))

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-brand-100/50 py-2.5 px-6 flex justify-between items-center sm:hidden z-50">
            <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/') ? 'text-brand-600' : 'text-[#B5AD9F] hover:text-brand-500'}`}>
                <div className={`p-1.5 rounded-2xl transition-colors ${isActive('/') ? 'bg-brand-50' : ''}`}><Utensils className="w-6 h-6" /></div>
                <span className="text-[10px] font-bold">Menú</span>
            </Link>

            <Link href="/carrito" className={`relative flex flex-col items-center gap-1 transition-colors ${isActive('/carrito') ? 'text-brand-600' : 'text-[#B5AD9F] hover:text-brand-500'}`}>
                <div className={`p-1.5 rounded-2xl transition-colors ${isActive('/carrito') ? 'bg-brand-50' : ''}`}><ShoppingBag className="w-6 h-6" /></div>
                <span className="text-[10px] font-bold">Carrito</span>

                {mounted && totalItems > 0 && (
                    <span className="absolute top-0 right-1 translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-bounce shadow-sm">
                        {totalItems}
                    </span>
                )}
            </Link>

            <Link href="/mis-pedidos" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/mis-pedidos') ? 'text-brand-600' : 'text-[#B5AD9F] hover:text-brand-500'}`}>
                <div className={`p-1.5 rounded-2xl transition-colors ${isActive('/mis-pedidos') ? 'bg-brand-50' : ''}`}><ClipboardList className="w-6 h-6" /></div>
                <span className="text-[10px] font-bold">Pedidos</span>
            </Link>

            {userRole === 'admin' ? (
                <Link href="/admin" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/admin') ? 'text-brand-600' : 'text-[#B5AD9F] hover:text-brand-500'}`}>
                    <div className={`p-1.5 rounded-2xl transition-colors ${isActive('/admin') ? 'bg-brand-50' : ''}`}><ShieldCheck className="w-6 h-6" /></div>
                    <span className="text-[10px] font-bold">Admin</span>
                </Link>
            ) : userRole === 'repartidor' ? (
                <Link href="/delivery" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/delivery') ? 'text-brand-600' : 'text-[#B5AD9F] hover:text-brand-500'}`}>
                    <div className={`p-1.5 rounded-2xl transition-colors ${isActive('/delivery') ? 'bg-brand-50' : ''}`}><Bike className="w-6 h-6" /></div>
                    <span className="text-[10px] font-bold">Delivery</span>
                </Link>
            ) : (
                <Link href={userRole ? "/perfil" : "/login"} className={`flex flex-col items-center gap-1 transition-colors ${isActive('/perfil') || isActive('/login') ? 'text-brand-600' : 'text-[#B5AD9F] hover:text-brand-500'}`}>
                    <div className={`p-1.5 rounded-2xl transition-colors ${isActive('/perfil') || isActive('/login') ? 'bg-brand-50' : ''}`}><User className="w-6 h-6" /></div>
                    <span className="text-[10px] font-bold">Perfil</span>
                </Link>
            )}
        </nav>
    )
}
