import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PedidoRow } from "./PedidoRow"

export default async function AdminPedidosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Cargar los pedidos del día junto con clientes y detalles
    const hoy = new Date().toISOString().split("T")[0]

    const { data: pedidos } = await supabase
        .from("pedidos")
        .select(`
      id, numero_pedido, estado, total, tipo_entrega, 
      direccion_entrega, notas, created_at,
      profiles!pedidos_cliente_id_fkey(nombre),
      detalle_pedidos(
        cantidad, precio_unitario,
        items_menu(nombre)
      )
    `)
        .gte("created_at", `${hoy}T00:00:00`)
        .order("created_at", { ascending: false })

    // Formatear los datos para el componente
    const pedidosFormateados = (pedidos || []).map(p => ({
        id: p.id,
        numero_pedido: p.numero_pedido,
        estado: p.estado,
        total: p.total,
        tipo_entrega: p.tipo_entrega,
        direccion_entrega: p.direccion_entrega,
        notas: p.notas,
        created_at: p.created_at,
        cliente_nombre: (p.profiles as any)?.nombre || "Cliente",
        detalle_pedidos: (p.detalle_pedidos || []) as any,
    }))

    const byEstado = {
        activos: pedidosFormateados.filter(p => ["pendiente", "confirmado", "preparando", "en_camino"].includes(p.estado)),
        completados: pedidosFormateados.filter(p => ["entregado", "cancelado"].includes(p.estado)),
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Pedidos del Día</h1>
                <p className="text-gray-500 mt-1">{pedidosFormateados.length} pedidos registrados hoy</p>
            </div>

            {pedidosFormateados.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <p className="text-gray-400 text-lg">Aún no hay pedidos para hoy.</p>
                </div>
            ) : (
                <div className="space-y-10">
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
