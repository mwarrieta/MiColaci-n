"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type EstadoPedido = "pendiente" | "confirmado" | "preparando" | "en_camino" | "entregado" | "cancelado"

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
