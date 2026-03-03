import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Clock, CheckCircle2, ShoppingBag, TrendingUp, Users, ChefHat, BookOpen, MapPin, AlertTriangle } from "lucide-react"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ExportOrdersButton } from "./ExportOrdersButton"

export const revalidate = 0

export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const hoyDate = new Date()
    const hoyStr = hoyDate.toISOString().split("T")[0]

    // Obtener datos en paralelo
    const [
        { data: pedidosHoyRaw },
        { data: pedidosPendientes },
        { data: totalClientes },
        { data: itemsActivos },
        { data: pedidosFiados },
    ] = await Promise.all([
        supabase.from("pedidos").select("id, total, estado, created_at, numero_pedido, tipo_entrega, direccion_entrega, hora_solicitada, metodo_pago, profiles!pedidos_cliente_id_fkey(nombre), items_pedido(cantidad, items_menu(nombre))").gte("created_at", `${hoyStr}T00:00:00`).order("created_at", { ascending: false }),
        supabase.from("pedidos").select("id, numero_pedido, estado, total, tipo_entrega, hora_solicitada, direccion_entrega, profiles!pedidos_cliente_id_fkey(nombre, telefono), items_pedido(cantidad, items_menu(nombre))").in("estado", ["pendiente_pago", "pago_en_revision", "confirmado", "en_preparacion"]).order("created_at", { ascending: true }).limit(10),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("rol", "cliente"),
        supabase.from("items_menu").select("id", { count: "exact", head: true }).eq("activo", true),
        supabase.from("pedidos").select("total").eq("estado", "pendiente_pago"),
    ])

    const pedidosHoy = pedidosHoyRaw || []
    const ventasHoy = pedidosHoy.reduce((acc, p) => acc + (p.total || 0), 0)
    const pedidosHoyCount = pedidosHoy.length
    const pedidosPendientesCount = pedidosPendientes?.length || 0
    const deudaFiados = (pedidosFiados || []).reduce((acc, p) => acc + (p.total || 0), 0)

    const kpis = [
        {
            label: "Ventas Hoy", value: `$${ventasHoy.toLocaleString("es-CL")}`,
            icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10",
            sub: `${pedidosHoyCount} pedidos`, href: "/admin/pedidos",
        },
        {
            label: "Pendientes", value: String(pedidosPendientesCount),
            icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10",
            sub: "requieren atención", href: "/admin/pedidos",
        },
        {
            label: "Clientes", value: String(totalClientes || 0),
            icon: Users, color: "text-blue-400", bg: "bg-blue-500/10",
            sub: "registrados", href: "/admin/usuarios",
        },
        {
            label: "Platos Activos", value: String(itemsActivos || 0),
            icon: ChefHat, color: "text-brand-400", bg: "bg-brand-500/10",
            sub: "en menú hoy", href: "/admin/menu",
        },
    ]

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-black tracking-tight text-gray-900">Centro de Control</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                        Resumen pa' hoy, {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Santiago' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/reportes"
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 shadow-sm font-semibold px-4 py-2 rounded-xl transition-all text-sm"
                    >
                        <TrendingUp className="w-4 h-4" /> Reportes
                    </Link>
                    <ExportOrdersButton />
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {kpis.map((kpi) => {
                    const Icon = kpi.icon
                    return (
                        <Link href={kpi.href} key={kpi.label} className="block bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 transition-all hover:border-gray-300 hover:shadow-md duration-300">
                            <div className={`w-12 h-12 ${kpi.bg} rounded-2xl flex items-center justify-center mb-4`}>
                                <Icon className={`w-6 h-6 ${kpi.color}`} />
                            </div>
                            <p className="text-2xl sm:text-3xl font-black font-heading text-gray-900 tracking-tight">{kpi.value}</p>
                            <p className="text-sm font-bold text-gray-500 mt-1">{kpi.label}</p>
                            <p className="text-xs font-semibold text-gray-400 mt-0.5">{kpi.sub}</p>
                        </Link>
                    )
                })}
            </div>

            {/* Deuda Fiados */}
            {
                deudaFiados > 0 && (
                    <div className="bg-red-50 rounded-3xl border border-red-100 p-5 sm:p-6 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-black font-heading text-red-600">${deudaFiados.toLocaleString("es-CL")}</p>
                                <p className="text-sm font-bold text-red-500">Deuda Total en Libreta</p>
                            </div>
                        </div>
                        <Link href="/admin/pedidos" className="text-sm text-red-600 font-bold bg-white px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 transition-colors shadow-sm">
                            Ver detalle
                        </Link>
                    </div>
                )
            }

            {/* Operaciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Urgentes */}
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h2 className="font-heading font-black tracking-tight text-xl text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> Urgentes
                        </h2>
                        <Link href="/admin/pedidos" className="text-sm text-brand-600 font-bold hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full transition-colors border border-brand-100">
                            Ver todos
                        </Link>
                    </div>
                    {!pedidosPendientes || pedidosPendientes.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-50" />
                            <p className="text-sm font-medium">¡Todo al día, cariño! Sin pendientes.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {pedidosPendientes.map((p) => {
                                const items = (p.items_pedido || []) as any[]
                                const resumenItems = items.slice(0, 3).map((i: any) => `${i.cantidad}x ${i.items_menu?.nombre || 'Plato'}`).join(', ')
                                return (
                                    <li key={p.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold font-heading text-gray-900 text-sm">
                                                        #{String(p.numero_pedido).padStart(5, "0")}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {(p.profiles as any)?.nombre || 'Cliente'}
                                                    </span>
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
                                                        {p.tipo_entrega === 'delivery' ? '🛵' : '🏪'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 truncate">{resumenItems}{items.length > 3 ? ` +${items.length - 3} más` : ''}</p>
                                                {p.hora_solicitada && (
                                                    <p className="text-xs text-brand-600 font-bold mt-1">⏰ Para las {p.hora_solicitada}</p>
                                                )}
                                                {p.direccion_entrega && (
                                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.direccion_entrega}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <span className="text-sm font-bold text-gray-900">${p.total?.toLocaleString("es-CL")}</span>
                                                <StatusBadge status={p.estado} />
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>

                {/* Pedidos de Hoy */}
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                        <h2 className="font-heading font-black tracking-tight text-xl text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-gray-500" /> Pedidos Hoy
                        </h2>
                    </div>
                    {pedidosHoy.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">Aún no hay pedidos hoy, cariño.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 max-h-[350px] overflow-y-auto">
                            {pedidosHoy.map((p) => {
                                const items = (p.items_pedido || []) as any[]
                                const resumenItems = items.slice(0, 2).map((i: any) => `${i.cantidad}x ${i.items_menu?.nombre || 'Plato'}`).join(', ')
                                return (
                                    <li key={p.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold font-heading text-gray-900 text-sm">
                                                    #{String(p.numero_pedido).padStart(5, "0")}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {(p.profiles as any)?.nombre || 'Cliente'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{resumenItems}</p>
                                            <span className="text-xs text-gray-400">
                                                {new Date(p.created_at).toLocaleTimeString("es-CL", { timeZone: 'America/Santiago', hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="text-sm font-bold text-gray-900">${p.total?.toLocaleString("es-CL")}</span>
                                            <StatusBadge status={p.estado} />
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div >
    )
}
