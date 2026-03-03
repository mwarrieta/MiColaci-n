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
                <Link href="/admin/costos" className="text-gray-500 hover:text-gray-900 bg-white border border-gray-200 shadow-sm p-1.5 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-heading font-black tracking-tight text-gray-900">📦 Ingredientes</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                        {ingredientes?.length || 0} ingredientes registrados
                    </p>
                </div>
            </div>

            <IngredientesList ingredientes={ingredientes || []} />
        </div>
    )
}
