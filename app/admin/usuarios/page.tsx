import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { UsuariosTable } from "./UsuariosTable"

export const revalidate = 0

export default async function AdminUsuariosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Cargar usuarios con resumen de pedidos
    const { data: usuarios } = await supabase
        .from("profiles")
        .select("id, nombre, email, rol, telefono, created_at, activo, limite_fiado, avatar_url")
        .order("activo", { ascending: false })
        .order("created_at", { ascending: false })

    // Cargar pedidos agrupados por cliente
    const { data: pedidos } = await supabase
        .from("pedidos")
        .select("id, numero_pedido, total, estado, created_at, cliente_id, tipo_entrega, items_pedido(cantidad, items_menu(nombre))")
        .order("created_at", { ascending: false })

    // Mapear pedidos por cliente
    const pedidosPorCliente: Record<string, any[]> = {}
    const deudasPorCliente: Record<string, number> = {}
    const totalGastadoPorCliente: Record<string, number> = {}

    pedidos?.forEach(p => {
        const cid = p.cliente_id
        if (!pedidosPorCliente[cid]) pedidosPorCliente[cid] = []
        pedidosPorCliente[cid].push(p)

        // Total gastado (solo pagados/entregados)
        if (!totalGastadoPorCliente[cid]) totalGastadoPorCliente[cid] = 0
        if (p.estado !== 'cancelado') totalGastadoPorCliente[cid] += (p.total || 0)

        // Deuda fiados
        if (!deudasPorCliente[cid]) deudasPorCliente[cid] = 0
        if (p.estado === 'pendiente_pago') deudasPorCliente[cid] += (p.total || 0)
    })

    const usuariosConDatos = (usuarios || []).map(u => ({
        ...u,
        totalGastado: totalGastadoPorCliente[u.id] || 0,
        deuda: deudasPorCliente[u.id] || 0,
        totalPedidos: pedidosPorCliente[u.id]?.length || 0,
        ultimosPedidos: (pedidosPorCliente[u.id] || []).slice(0, 5).map((p: any) => ({
            id: p.id,
            numero_pedido: p.numero_pedido,
            total: p.total,
            estado: p.estado,
            created_at: p.created_at,
            tipo_entrega: p.tipo_entrega,
            items: (p.items_pedido || []).map((i: any) => `${i.cantidad}x ${i.items_menu?.nombre || 'Plato'}`).join(', ')
        }))
    }))

    return <UsuariosTable usuarios={usuariosConDatos} selfId={user.id} />
}
