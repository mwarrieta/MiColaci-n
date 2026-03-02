import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MenuManager } from "./MenuManager"

export default async function AdminMenuPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Obtener items y categorías
    const { data: categorias } = await supabase.from("categorias").select("*").order("orden", { ascending: true })

    const { data: items } = await supabase
        .from("items_menu")
        .select("*")
        .order("nombre", { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-white">Gestión de Menú</h1>
                    <p className="text-gray-400 mt-1">Administra los platos disponibles, precios y categorías.</p>
                </div>
                <Link href="/admin/menu/categorias" className="text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-colors self-start sm:self-auto">
                    Gestionar Categorías →
                </Link>
            </div>

            <MenuManager items={items || []} categorias={categorias || []} />
        </div>
    )
}
