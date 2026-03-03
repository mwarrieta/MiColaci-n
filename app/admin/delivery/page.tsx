import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { actualizarConfiguraciones } from "../configuraciones/actions"

export default async function DeliveryDashboardPage() {
    const supabase = await createClient()

    // Verificación de acceso Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
    if (profile?.rol !== 'admin' && profile?.rol !== 'repartidor') {
        redirect("/")
    }

    // Obtener pedidos de Delivery Activos
    const { data: pedidosDelivery, error } = await supabase
        .from("pedidos")
        .select(`
            *,
            profiles:cliente_id (nombre, telefono),
            items_pedido(*, items_menu(nombre))
        `)
        .eq("tipo_entrega", "delivery")
        .in("estado", ["pendiente", "pendiente_pago", "en_preparacion", "pagado_preparando", "en_camino"])
        .order("created_at", { ascending: true })

    if (error) {
        console.error("Error obteniendo delivery:", error)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-gray-900">Módulo Delivery</h1>
                    <p className="text-gray-500 mt-1">Gestión de envíos y logística en tiempo real.</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                    <Truck className="w-6 h-6" />
                </div>
            </div>

            {/* Ajustes de Costo de Delivery */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold font-heading text-gray-900">Ajustes de Despacho</h2>
                        <p className="text-sm text-gray-500">Configura el costo base que se cobrará por envío.</p>
                    </div>
                </div>
                <div className="p-6">
                    <form action={actualizarConfiguraciones} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Costo Base de Delivery ($)
                            </label>
                            <input
                                type="number"
                                name="costo_delivery"
                                required
                                min="0"
                                placeholder="Ej: 1500"
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md shrink-0 w-full sm:w-auto"
                        >
                            Guardar Costo
                        </button>
                    </form>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-brand-50 p-3 rounded-2xl text-brand-600"><Clock className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">A Preparar / Pendientes</p>
                        <p className="text-2xl font-bold font-heading text-gray-900">
                            {pedidosDelivery?.filter(p => ['pendiente', 'pendiente_pago', 'en_preparacion', 'pagado_preparando'].includes(p.estado)).length || 0}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Truck className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">En Camino</p>
                        <p className="text-2xl font-bold font-heading text-gray-900">
                            {pedidosDelivery?.filter(p => p.estado === 'en_camino').length || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista Principal de Envíos */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold font-heading text-gray-900">Envíos Activos</h2>
                </div>

                <div className="p-0 overflow-x-auto">
                    {(!pedidosDelivery || pedidosDelivery.length === 0) ? (
                        <div className="p-12 text-center text-gray-500">
                            No hay pedidos de delivery pendientes en este momento.
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                                    <th className="p-4 font-semibold">📍 Destino</th>
                                    <th className="p-4 font-semibold">👤 Cliente</th>
                                    <th className="p-4 font-semibold">⏰ Hora Solicitada</th>
                                    <th className="p-4 font-semibold">Estado</th>
                                    <th className="p-4 font-semibold text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-100">
                                {pedidosDelivery.map(pedido => (
                                    <tr key={pedido.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-medium text-gray-900 flex items-start gap-1">
                                                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                                                <span className="truncate max-w-[200px]">{pedido.direccion_entrega || "No especificada"}</span>
                                            </div>
                                            {pedido.notas && <p className="text-xs text-gray-500 mt-1 italic pl-5">Nota: {pedido.notas}</p>}
                                        </td>
                                        <td className="p-4">
                                            <p className="font-semibold text-gray-900">{pedido.profiles?.nombre || "Sin Nombre"}</p>
                                            <p className="text-xs text-gray-500">{pedido.profiles?.telefono || "Sin Tel"}</p>
                                        </td>
                                        <td className="p-4 font-bold text-gray-700">
                                            {pedido.hora_solicitada || "Lo antes posible"}
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={pedido.estado as any} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                {pedido.profiles?.telefono && (
                                                    <a
                                                        href={`https://wa.me/${pedido.profiles.telefono.replace('+', '')}?text=${encodeURIComponent(`¡Hola ${pedido.profiles.nombre}! 🛵 La Tía Elvira te avisa que tu colación ya va en camino hacia ${pedido.direccion_entrega || 'ti'}. ¡Prepárate para disfrutar!`)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center"
                                                        title="Avisar por WhatsApp"
                                                    >
                                                        WhatsApp
                                                    </a>
                                                )}
                                                <button className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-md">
                                                    Gestionar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    )
}
