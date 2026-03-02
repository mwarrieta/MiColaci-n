import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Truck, LogOut } from 'lucide-react'

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('nombre').eq('id', user.id).single()

    return (
        <div className="min-h-screen bg-emerald-50/30">
            <header className="bg-emerald-600 outline-none text-white sticky top-0 z-50 shadow-md border-b border-emerald-700">
                <div className="max-w-lg mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-100" />
                        <h1 className="text-xl font-heading font-bold tracking-tight">Delivery</h1>
                        <span className="bg-emerald-800/50 text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-1 text-emerald-50 mt-1">REPARTIDOR</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-emerald-50 hidden sm:block">{profile?.nombre || user.email}</span>
                        <form action="/auth/signout" method="post">
                            <button type="submit" className="flex items-center justify-center p-2 rounded-xl bg-emerald-700/50 hover:bg-emerald-700 text-emerald-50 transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="max-w-lg mx-auto px-4 sm:px-6 py-6 border-x border-dashed border-gray-200 min-h-screen bg-white shadow-sm">
                {children}
            </main>
        </div>
    )
}
