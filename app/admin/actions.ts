"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type EstadoPedido = "pendiente_pago" | "pago_en_revision" | "confirmado" | "en_preparacion" | "en_delivery" | "entregado" | "cancelado"

export async function actualizarEstadoPedido(id: string, estado: EstadoPedido) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin" && profile?.rol !== "repartidor") {
        return { error: "Privilegios insuficientes" }
    }

    const { error } = await supabase
        .from("pedidos")
        .update({ estado })
        .eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/pedidos")
    revalidatePath("/admin")
    revalidatePath("/delivery")
    return { success: true }
}

export async function actualizarRolUsuario(userId: string, nuevoRol: "cliente" | "admin" | "repartidor") {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") {
        return { error: "Privilegios insuficientes" }
    }

    const { error } = await supabase
        .from("profiles")
        .update({ rol: nuevoRol })
        .eq("id", userId)

    if (error) return { error: error.message }

    revalidatePath("/admin/usuarios")
    return { success: true }
}

export async function toggleUsuarioActivo(userId: string, targetState: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") {
        return { error: "Privilegios insuficientes" }
    }

    const { error } = await supabase
        .from("profiles")
        .update({ activo: targetState })
        .eq("id", userId)

    if (error) return { error: error.message }

    revalidatePath("/admin/usuarios")
    return { success: true }
}

export async function downloadVentasCSV() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Validar autorización admin
    if (!user) {
        return { error: "No autorizado" }
    }
    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") {
        return { error: "Privilegios insuficientes" }
    }

    // Traer todos los pedidos confirmados/pendientes/entregados (todo menos cancelados)
    const { data: pedidos, error } = await supabase
        .from("pedidos")
        .select(`
            numero_pedido,
            created_at,
            total,
            estado,
            tipo_entrega,
            profiles(nombre, email)
        `)
        .order("created_at", { ascending: false })

    if (error) {
        return { error: "Error obteniendo datos para el reporte" }
    }

    if (!pedidos || pedidos.length === 0) {
        return { error: "No hay pedidos reportables todavía" }
    }

    // Construir la cabecera del CSV
    const csvRows = [
        ["ID", "Fecha", "Hora", "Cliente", "Email", "Tipo Entrega", "Estado", "Total ($)"]
    ]

    // Formatear filas
    pedidos.forEach(p => {
        const d = new Date(p.created_at)
        const fecha = d.toLocaleDateString('es-CL')
        const hora = d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

        const profileInfo = p.profiles as unknown as { nombre: string; email: string } | null
        const clienteNom = profileInfo?.nombre || "N/A"
        const clienteMail = profileInfo?.email || "N/A"

        // Es vital envolver en comillas para evitar problemas con comas en nombres
        csvRows.push([
            `#${String(p.numero_pedido).padStart(5, '0')}`,
            fecha,
            hora,
            `"${clienteNom}"`,
            `"${clienteMail}"`,
            p.tipo_entrega,
            p.estado,
            String(p.total)
        ])
    })

    // Unir filas y columnas con salto de linea y separador
    const csvString = csvRows.map(row => row.join(";")).join("\n") // Usamos punto y coma por ser estándar en Excel Latam

    return { success: true, csvString }
}

export async function actualizarLimiteFiado(userId: string, targetLimit: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") {
        return { error: "Privilegios insuficientes" }
    }

    const { error } = await supabase
        .from("profiles")
        .update({ limite_fiado: targetLimit })
        .eq("id", userId)

    if (error) return { error: error.message }

    revalidatePath("/admin/usuarios")
    return { success: true }
}

// ---- EDICIÓN DE PEDIDOS ---- //

export async function editarItemPedido(
    itemId: string,
    pedidoId: string,
    datos: { cantidad?: number; precio_unitario?: number }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Privilegios insuficientes" }

    // Obtener valores actuales del item
    const { data: itemActual } = await supabase.from("items_pedido").select("cantidad, precio_unitario").eq("id", itemId).single()
    if (!itemActual) return { error: "Item no encontrado" }

    const cantFinal = datos.cantidad ?? itemActual.cantidad
    const precioFinal = datos.precio_unitario ?? itemActual.precio_unitario
    const subtotalItem = cantFinal * precioFinal

    const { error: itemError } = await supabase
        .from("items_pedido")
        .update({ cantidad: cantFinal, precio_unitario: precioFinal, subtotal: subtotalItem })
        .eq("id", itemId)
    if (itemError) return { error: itemError.message }

    // Recalcular total del pedido padre
    const { data: itemsPedido } = await supabase.from("items_pedido").select("subtotal").eq("pedido_id", pedidoId)
    const nuevoSubtotal = (itemsPedido || []).reduce((acc, i) => acc + (i.subtotal || 0), 0)

    const { data: pedido } = await supabase.from("pedidos").select("costo_delivery").eq("id", pedidoId).single()
    const costoDelivery = pedido?.costo_delivery || 0

    await supabase.from("pedidos").update({ subtotal: nuevoSubtotal, total: nuevoSubtotal + costoDelivery }).eq("id", pedidoId)

    revalidatePath("/admin/pedidos")
    revalidatePath("/admin")
    revalidatePath("/mis-pedidos")
    return { success: true }
}

export async function editarPedido(
    pedidoId: string,
    datos: { notas?: string; direccion_entrega?: string; hora_solicitada?: string }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Privilegios insuficientes" }

    const updateData: Record<string, string> = {}
    if (datos.notas !== undefined) updateData.notas = datos.notas
    if (datos.direccion_entrega !== undefined) updateData.direccion_entrega = datos.direccion_entrega
    if (datos.hora_solicitada !== undefined) updateData.hora_solicitada = datos.hora_solicitada

    const { error } = await supabase.from("pedidos").update(updateData).eq("id", pedidoId)
    if (error) return { error: error.message }

    revalidatePath("/admin/pedidos")
    revalidatePath("/admin")
    revalidatePath("/mis-pedidos")
    return { success: true }
}

export async function eliminarPedido(pedidoId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Privilegios insuficientes" }

    // Soft delete: cambiar estado a cancelado
    const { error } = await supabase.from("pedidos").update({ estado: "cancelado" }).eq("id", pedidoId)
    if (error) return { error: error.message }

    revalidatePath("/admin/pedidos")
    revalidatePath("/admin")
    revalidatePath("/mis-pedidos")
    return { success: true }
}
