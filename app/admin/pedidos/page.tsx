import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PedidoRow } from "./PedidoRow"

export default async function AdminPedidosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Cargar TODOS los pedidos ACTIVOS/Pendientes sin importar la fecha,
    // y cargar los completados/cancelados del DIA DE HOY para mantener historial relevante.
    const hoy = new Date().toISOString().split("T")[0]

    const { data: pedidos } = await supabase
        .from("pedidos")
        .select(`
      id, numero_pedido, estado, total, tipo_entrega, 
      direccion_entrega, hora_solicitada, notas, created_at,
      profiles!pedidos_cliente_id_fkey(nombre, telefono),
      items_pedido(
        id, cantidad, precio_unitario, subtotal,
        items_menu(nombre)
      )
    `)
        // Trae los pendientes siempre, O trae los de hoy sin importar su estado
        .or(`estado.in.(pendiente_pago,pago_en_revision,confirmado,en_preparacion,en_delivery),created_at.gte.${hoy}T00:00:00`)
        .order("created_at", { ascending: false })
        .limit(100) // Límite de seguridad

    // Formatear los datos para el componente
    const pedidosFormateados = (pedidos || []).map(p => ({
        id: p.id,
        numero_pedido: p.numero_pedido,
        estado: p.estado,
        total: p.total,
        tipo_entrega: p.tipo_entrega,
        direccion_entrega: p.direccion_entrega,
        hora_solicitada: p.hora_solicitada,
        notas: p.notas,
        created_at: p.created_at,
        cliente_nombre: (p.profiles as any)?.nombre || "Cliente",
        cliente_telefono: (p.profiles as any)?.telefono || null,
        detalle_pedidos: (p.items_pedido || []) as any,
    }))

    const byEstado = {
        activos: pedidosFormateados.filter(p => ["pendiente_pago", "pago_en_revision", "confirmado", "en_preparacion", "en_delivery"].includes(p.estado)),
        completados: pedidosFormateados.filter(p => ["entregado", "cancelado"].includes(p.estado)),
    }

    // Calcular Consolidador de Deudores Semanales
    const deudoresMap = byEstado.activos
        .filter(p => p.estado === "pendiente_pago")
        .reduce((acc, p) => {
            const tel = p.cliente_telefono
            if (!tel) return acc
            if (!acc[tel]) {
                acc[tel] = { nombre: p.cliente_nombre, telefono: tel, total: 0, count: 0 }
            }
            acc[tel].total += p.total
            acc[tel].count += 1
            return acc
        }, {} as Record<string, { nombre: string; telefono: string; total: number; count: number }>)

    const deudores = Object.values(deudoresMap)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-heading font-bold text-white">Pedidos del Día</h1>
                <p className="text-gray-400 mt-1">{pedidosFormateados.length} pediditos registrados hoy</p>
            </div>

            {pedidosFormateados.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <p className="text-gray-400 text-lg">Aún no hay pedidos para hoy.</p>
                </div>
            ) : (
                <div className="space-y-10">

                    {/* Consolidado de Deudas */}
                    {deudores.length > 0 && (
                        <section className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm">
                            <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse inline-block" />
                                Pendientes de Cobro (Agrupados por Cliente)
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {deudores.map((deudor, idx) => {
                                    const msj = `¡Hola, ${deudor.nombre}! 👩‍🍳 La Tía Elvira por aquí. Tienes un total de ${deudor.count} ${deudor.count > 1 ? 'pedidos pendientes' : 'pedido pendiente'} de pago en tu libreta por un total de $${deudor.total.toLocaleString("es-CL")}. ¡Cuando puedas te das el tiempo, mi niñ@! Un abrazo grande.`
                                    const waLink = `https://wa.me/${deudor.telefono.replace('+', '')}?text=${encodeURIComponent(msj)}`

                                    return (
                                        <div key={idx} className="bg-white p-4 rounded-2xl border border-red-100 flex flex-col justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{deudor.nombre}</p>
                                                <p className="text-xs text-gray-500 mb-2">{deudor.count} pedido(s)</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="font-black text-red-600 text-lg">${deudor.total.toLocaleString('es-CL')}</span>
                                                <a href={waLink} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                                    Cobrar vía WA
                                                </a>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Activos */}
                    {byEstado.activos.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse inline-block" />
                                Activos ({byEstado.activos.length})
                            </h2>
                            <div className="space-y-3">
                                {byEstado.activos.map(p => <PedidoRow key={p.id} pedido={p} />)}
                            </div>
                        </section>
                    )}

                    {/* Completados */}
                    {byEstado.completados.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-gray-300 rounded-full inline-block" />
                                Completados ({byEstado.completados.length})
                            </h2>
                            <div className="space-y-3 opacity-70">
                                {byEstado.completados.map(p => <PedidoRow key={p.id} pedido={p} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    )
}
