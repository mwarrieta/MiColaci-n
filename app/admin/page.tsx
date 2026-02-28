import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Clock, CheckCircle2, ShoppingBag, TrendingUp, Users, ChefHat, FileBarChart } from "lucide-react"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { VentasChart } from "./VentasChart"
import { ExportOrdersButton } from "./ExportOrdersButton"

// Config de Revalidación para las queries del Dashboard temporal // false
export const revalidate = 0

export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const hoyDate = new Date()
    const hoyStr = hoyDate.toISOString().split("T")[0]

    // Obtener fecha de hace 7 dias para el query de Analytics
    const hace7DiasDate = new Date()
    hace7DiasDate.setDate(hoyDate.getDate() - 6) // -6 para incluir hoy y completar 7 días
    const hace7DiasStr = hace7DiasDate.toISOString().split("T")[0]

    // Obtener datos en paralelo para mejor performance
    const [
        { data: pedidosTotales },
        { data: pedidosPendientes },
        { data: totalClientes },
        { data: itemsActivos },
        { data: detallesRecientes }
    ] = await Promise.all([
        supabase.from("pedidos").select("id, total, estado, created_at, numero_pedido").gte("created_at", `${hace7DiasStr}T00:00:00`).order("created_at", { ascending: false }),
        supabase.from("pedidos").select("id, numero_pedido, estado, total, tipo_entrega").in("estado", ["pendiente", "confirmado", "preparando"]).order("created_at", { ascending: true }).limit(5),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("rol", "cliente"),
        supabase.from("items_menu").select("id", { count: "exact", head: true }).eq("activo", true),
        // Para calcular top items necesitamos las ultimas ventas
        supabase.from("detalle_pedidos").select(`
            cantidad,
            item_menu_id,
            items_menu(nombre),
            pedidos(created_at, estado)
        `).gte("pedidos.created_at", `${hace7DiasStr}T00:00:00`)
    ])

    // Filtros de Hoy
    const pedidosHoy = pedidosTotales?.filter(p => p.created_at.startsWith(hoyStr)) || []
    const ventasHoy = pedidosHoy.reduce((acc, p) => acc + (p.total || 0), 0)
    const pedidosHoyCount = pedidosHoy.length
    const pedidosPendientesCount = pedidosPendientes?.length || 0

    // ---- PROCESAMIENTO ANALYTICS 7 DÍAS ---- //
    const chartDataMap: Record<string, { amount: number, count: number }> = {}

    // Inicializar los últimos 7 días vacíos para asegurar que aparescan incluso si no hay ventas
    for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(hoyDate.getDate() - i)
        const dStr = d.toISOString().split("T")[0]
        chartDataMap[dStr] = { amount: 0, count: 0 }
    }

    // Llenar datos al mapa
    pedidosTotales?.forEach(p => {
        const dStr = p.created_at.split("T")[0]
        if (chartDataMap[dStr]) {
            chartDataMap[dStr].amount += (p.total || 0)
            chartDataMap[dStr].count += 1
        }
    })

    const chartData = Object.entries(chartDataMap).map(([date, data]) => ({
        date,
        amount: data.amount,
        count: data.count
    }))

    // ---- PROCESAMIENTO TOP ITEMS ---- //
    // Filtramos detalles q tengan inner join exitoso con pedidos (por si RLS ocultó algo) y esten en fecha
    const detallesValidos = detallesRecientes?.filter(d => d.pedidos !== null) || [];

    const rankingItems: Record<string, { nombre: string, cantidad: number, id: string }> = {};
    detallesValidos.forEach(d => {
        // Ignorar Items que fueron borrados fiajos temporalmetne en query inner join a null
        if (!d.items_menu) return;

        const itemName = (d.items_menu as unknown as { nombre: string }).nombre
        const itemId = d.item_menu_id!

        if (!rankingItems[itemId]) {
            rankingItems[itemId] = { nombre: itemName, cantidad: 0, id: itemId }
        }
        rankingItems[itemId].cantidad += d.cantidad
    })

    // Ordenar de mayor a menor y tomar Top 5
    const top5Items = Object.values(rankingItems)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5)

    const kpis = [
        {
            label: "Ventas Hoy",
            value: `$${ventasHoy.toLocaleString("es-CL")}`,
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            sub: `${pedidosHoyCount} pedidos`,
        },
        {
            label: "Pendientes",
            value: String(pedidosPendientesCount),
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-50",
            sub: "requieren atención",
        },
        {
            label: "Clientes Totales",
            value: String(totalClientes || 0),
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            sub: "registrados",
        },
        {
            label: "Platos Activos",
            value: String(itemsActivos || 0),
            icon: ChefHat,
            color: "text-brand-600",
            bg: "bg-brand-50",
            sub: "en menú hoy",
        },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-black tracking-tight text-white">General</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">
                        Resumen para hoy, {hoyDate.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                </div>
                <ExportOrdersButton />
            </div>

            {/* KPIs Rápidos */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon
                    return (
                        <div key={kpi.label} className="bg-admin-surface rounded-3xl border border-white/5 p-5 sm:p-6 transition-transform hover:-translate-y-1 duration-300">
                            <div className={`w-12 h-12 ${kpi.bg} rounded-2xl flex items-center justify-center mb-4`}>
                                <Icon className={`w-6 h-6 ${kpi.color}`} />
                            </div>
                            <p className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">{kpi.value}</p>
                            <p className="text-sm font-bold text-gray-400 mt-1">{kpi.label}</p>
                            <p className="text-xs font-semibold text-gray-500 mt-0.5">{kpi.sub}</p>
                        </div>
                    )
                })}
            </div>

            {/* Sección Analítica Analítica */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico 7 Días */}
                <div className="bg-admin-surface rounded-3xl border border-white/5 overflow-hidden lg:col-span-2">
                    <div className="p-6 pb-2 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="font-heading font-black tracking-tight text-xl text-white flex items-center gap-2">
                                <FileBarChart className="w-5 h-5 text-brand-500" /> Ingresos Diarios
                            </h2>
                            <p className="text-xs font-semibold text-gray-400 mt-1">Suma del total cobrado (últimos 7 días)</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <VentasChart data={chartData} />
                    </div>
                </div>

                {/* Top 5 Ventas */}
                <div className="bg-admin-surface rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h2 className="font-heading font-black tracking-tight text-xl text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-500" /> Ranking Platos
                        </h2>
                        <p className="text-xs font-semibold text-gray-400 mt-1">Más vendidos de la semana</p>
                    </div>
                    <div className="p-6">
                        {top5Items.length === 0 ? (
                            <p className="text-sm text-gray-400 font-medium text-center py-10">Sin ventas registradas en la semana.</p>
                        ) : (
                            <ul className="space-y-4">
                                {top5Items.map((item, i) => (
                                    <li key={item.id} className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-sm text-gray-300 font-heading">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-white truncate text-sm">{item.nombre}</p>
                                        </div>
                                        <div className="bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-brand-500/20">
                                            {item.cantidad} uni.
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Operaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pendientes urgentes */}
                <div className="bg-admin-surface rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-heading font-black tracking-tight text-xl text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" /> Urgentes
                        </h2>
                        <Link href="/admin/pedidos" className="text-sm text-brand-600 font-bold hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full transition-colors">
                            Ver todos
                        </Link>
                    </div>
                    {!pedidosPendientes || pedidosPendientes.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
                            <p className="text-sm font-bold">¡Todo al día! Sin pendientes.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-white/5">
                            {pedidosPendientes.map((p) => (
                                <li key={p.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div>
                                        <span className="font-bold font-heading text-white text-sm">
                                            #{String(p.numero_pedido).padStart(5, "0")}
                                        </span>
                                        <span className="text-xs ml-3 font-semibold text-gray-400 uppercase tracking-widest">{p.tipo_entrega}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-white">${p.total?.toLocaleString("es-CL")}</span>
                                        <StatusBadge status={p.estado as "pendiente" | "confirmado" | "preparando" | "en_camino" | "entregado" | "cancelado"} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Todos los pedidos de hoy */}
                <div className="bg-admin-surface rounded-3xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-heading font-black tracking-tight text-xl text-white flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-gray-400" /> Pedidos Hoy
                        </h2>
                    </div>
                    {!pedidosHoy || pedidosHoy.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-bold">Aún no hay pedidos registrados.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-white/5 max-h-[350px] overflow-y-auto">
                            {pedidosHoy.map((p) => (
                                <li key={p.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div>
                                        <span className="font-bold font-heading text-white text-sm">
                                            #{String(p.numero_pedido).padStart(5, "0")}
                                        </span>
                                        <span className="block text-xs font-semibold text-gray-400 mt-0.5">
                                            {new Date(p.created_at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-white">${p.total?.toLocaleString("es-CL")}</span>
                                        <StatusBadge status={p.estado as "pendiente" | "confirmado" | "preparando" | "en_camino" | "entregado" | "cancelado"} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
