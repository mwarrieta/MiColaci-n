import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FileBarChart, TrendingUp } from "lucide-react"
import { VentasChart } from "../VentasChart"

export const revalidate = 0

export default async function ReportesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const hoyDate = new Date()
    const hace7DiasDate = new Date()
    hace7DiasDate.setDate(hoyDate.getDate() - 6)
    const hace7DiasStr = hace7DiasDate.toISOString().split("T")[0]

    const [
        { data: pedidosTotales },
        { data: detallesRecientes },
    ] = await Promise.all([
        supabase.from("pedidos").select("id, total, estado, created_at, numero_pedido").gte("created_at", `${hace7DiasStr}T00:00:00`).order("created_at", { ascending: false }),
        supabase.from("items_pedido").select(`
            cantidad, item_menu_id,
            items_menu(nombre),
            pedidos(created_at, estado)
        `).gte("pedidos.created_at", `${hace7DiasStr}T00:00:00`),
    ])

    // Chart data
    const chartDataMap: Record<string, { amount: number; count: number }> = {}
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(hoyDate.getDate() - i)
        chartDataMap[d.toISOString().split("T")[0]] = { amount: 0, count: 0 }
    }

    pedidosTotales?.forEach(p => {
        const dStr = p.created_at.split("T")[0]
        if (chartDataMap[dStr]) {
            chartDataMap[dStr].amount += (p.total || 0)
            chartDataMap[dStr].count += 1
        }
    })

    const chartData = Object.entries(chartDataMap).map(([date, data]) => ({ date, amount: data.amount, count: data.count }))

    // Top items
    const detallesValidos = detallesRecientes?.filter(d => d.pedidos !== null) || []
    const rankingItems: Record<string, { nombre: string; cantidad: number; id: string }> = {}
    detallesValidos.forEach(d => {
        if (!d.items_menu) return
        const itemName = (d.items_menu as unknown as { nombre: string }).nombre
        const itemId = d.item_menu_id!
        if (!rankingItems[itemId]) rankingItems[itemId] = { nombre: itemName, cantidad: 0, id: itemId }
        rankingItems[itemId].cantidad += d.cantidad
    })

    const top5Items = Object.values(rankingItems).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5)

    // Totales semana
    const ventasSemana = pedidosTotales?.reduce((acc, p) => acc + (p.total || 0), 0) || 0
    const pedidosSemana = pedidosTotales?.length || 0

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-heading font-black tracking-tight text-gray-900">📊 Reportes</h1>
                <p className="text-gray-500 font-medium text-sm mt-1">
                    Análisis de la última semana — {hace7DiasDate.toLocaleDateString("es-CL")} al {hoyDate.toLocaleDateString("es-CL")}
                </p>
            </div>

            {/* Resumen Semanal */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ventas Semana</p>
                    <p className="text-2xl font-black font-heading text-emerald-600 mt-1">${ventasSemana.toLocaleString("es-CL")}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pedidos Semana</p>
                    <p className="text-2xl font-black font-heading text-gray-900 mt-1">{pedidosSemana}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
                    <div className="p-6 pb-2 border-b border-gray-100">
                        <h2 className="font-heading font-black tracking-tight text-xl text-gray-900 flex items-center gap-2">
                            <FileBarChart className="w-5 h-5 text-brand-500" /> Ingresos Diarios
                        </h2>
                        <p className="text-xs font-semibold text-gray-500 mt-1">Suma del total cobrado (últimos 7 días)</p>
                    </div>
                    <div className="p-6">
                        <VentasChart data={chartData} />
                    </div>
                </div>

                {/* Ranking */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="font-heading font-black tracking-tight text-xl text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" /> Ranking Platos
                        </h2>
                        <p className="text-xs font-semibold text-gray-500 mt-1">Más vendidos de la semana</p>
                    </div>
                    <div className="p-6">
                        {top5Items.length === 0 ? (
                            <p className="text-sm text-gray-500 font-medium text-center py-10">Sin ventas registradas.</p>
                        ) : (
                            <ul className="space-y-4">
                                {top5Items.map((item, i) => (
                                    <li key={item.id} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600 font-heading">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-900 truncate text-sm">{item.nombre}</p>
                                        </div>
                                        <div className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-brand-200">
                                            {item.cantidad} uni.
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
