import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CocinaBoard } from "./CocinaBoard"

export const revalidate = 0

export default async function AdminCocinaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Cargar pedidos activos que la cocina necesita gestionar
    const { data: pedidos } = await supabase
        .from("pedidos")
        .select(`
            id, numero_pedido, estado, total, tipo_entrega,
            direccion_entrega, hora_solicitada, notas, created_at,
            profiles!pedidos_cliente_id_fkey(nombre, telefono),
            items_pedido(
                id, cantidad, precio_unitario,
                items_menu(nombre)
            )
        `)
        .in("estado", ["confirmado", "en_preparacion", "en_delivery"])
        .order("created_at", { ascending: true })

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
        items: (p.items_pedido || []).map((item: any) => ({
            cantidad: item.cantidad,
            nombre: item.items_menu?.nombre || "Plato",
        })),
    }))

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-3xl font-heading font-black tracking-tight text-white">🍳 La Cocina</h1>
                <p className="text-gray-400 font-medium text-sm mt-1">
                    {pedidosFormateados.length} pediditos en cola — ¡manos a la obra, cariño!
                </p>
            </div>

            <CocinaBoard pedidos={pedidosFormateados} />
        </div>
    )
}
