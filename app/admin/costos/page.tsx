import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { DollarSign, Package, ChevronRight, TrendingUp, AlertTriangle } from "lucide-react"
import { PlatoRecetaRow } from "./PlatoRecetaRow"

export const revalidate = 0

export default async function AdminCostosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Cargar platos activos con sus recetas (ingredientes)
    const { data: platos } = await supabase
        .from("items_menu")
        .select(`
            id, nombre, precio, activo,
            recetas(
                id, cantidad,
                ingredientes(id, nombre, unidad_medida, costo_por_unidad)
            )
        `)
        .eq("activo", true)
        .order("nombre")

    // Cargar todos los ingredientes para el selector
    const { data: ingredientes } = await supabase
        .from("ingredientes")
        .select("id, nombre, unidad_medida, costo_por_unidad")
        .order("nombre")

    // Calcular costo unitario de cada plato
    const platosConCosto = (platos || []).map(plato => {
        const recetas = (plato.recetas || []) as any[]
        const costoUnitario = recetas.reduce((acc: number, r: any) => {
            const costoPorUnidad = r.ingredientes?.costo_por_unidad || 0
            return acc + (costoPorUnidad * r.cantidad)
        }, 0)

        const margen = plato.precio > 0 ? ((plato.precio - costoUnitario) / plato.precio * 100) : 0

        return {
            ...plato,
            recetas,
            costoUnitario: Math.round(costoUnitario),
            margen: Math.round(margen),
        }
    })

    const totalPlatos = platosConCosto.length
    const platosSinReceta = platosConCosto.filter(p => p.recetas.length === 0).length
    const margenPromedio = totalPlatos > 0
        ? Math.round(platosConCosto.reduce((acc, p) => acc + p.margen, 0) / totalPlatos)
        : 0

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-black tracking-tight text-gray-900">💰 Costos por Plato</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                        Análisis de costo unitario basado en ingredientes
                    </p>
                </div>
                <Link
                    href="/admin/costos/ingredientes"
                    className="flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 hover:bg-brand-100 font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"
                >
                    <Package className="w-4 h-4" /> Gestionar Ingredientes <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Platos con Receta</p>
                    <p className="text-2xl font-black font-heading text-gray-900 mt-1">{totalPlatos - platosSinReceta} / {totalPlatos}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Margen Promedio</p>
                    <p className={`text-2xl font-black font-heading mt-1 ${margenPromedio >= 50 ? 'text-emerald-600' : margenPromedio >= 30 ? 'text-amber-600' : 'text-red-500'}`}>
                        {margenPromedio}%
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ingredientes</p>
                    <p className="text-2xl font-black font-heading text-gray-900 mt-1">{ingredientes?.length || 0}</p>
                </div>
            </div>

            {/* Alerta sin receta */}
            {platosSinReceta > 0 && (
                <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-center gap-3 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800 font-medium">
                        {platosSinReceta} plato{platosSinReceta > 1 ? 's' : ''} sin receta definida. Agrega ingredientes para calcular su costo real.
                    </p>
                </div>
            )}

            {/* Lista de platos */}
            <div className="space-y-3">
                {platosConCosto.map((plato) => (
                    <PlatoRecetaRow
                        key={plato.id}
                        plato={plato}
                        ingredientesDisponibles={ingredientes || []}
                    />
                ))}
            </div>
        </div>
    )
}
