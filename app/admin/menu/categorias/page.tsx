import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CategoriasManager } from "./CategoriasManager"

export default async function AdminCategoriasPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
    if (profile?.rol !== 'admin') redirect('/')

    // Obtener categorías
    const { data: categorias } = await supabase
        .from("categorias")
        .select("*")
        .order("orden", { ascending: true })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Categorías de Menú</h1>
                <p className="text-gray-500 mt-1">Organiza el orden en que los clientes ven los platos.</p>
            </div>

            <CategoriasManager categorias={categorias || []} />
        </div>
    )
}
