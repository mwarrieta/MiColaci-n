import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { IngredientesList } from "./IngredientesList"

export const revalidate = 0

export default async function IngredientesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: ingredientes } = await supabase
        .from("ingredientes")
        .select("*")
        .order("nombre")

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center gap-4">
                <Link href="/admin/costos" className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-heading font-black tracking-tight text-white">📦 Ingredientes</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">
                        {ingredientes?.length || 0} ingredientes registrados
                    </p>
                </div>
            </div>

            <IngredientesList ingredientes={ingredientes || []} />
        </div>
    )
}
