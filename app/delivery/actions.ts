"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function marcarEnCamino(pedidoId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin" && profile?.rol !== "repartidor") return { error: "Rol no autorizado para esta acción" }

    const { error } = await supabase
        .from("pedidos")
        .update({ estado: "en_delivery" })
        .eq("id", pedidoId)

    if (error) return { error: error.message }

    revalidatePath("/delivery")
    revalidatePath("/admin")
    revalidatePath("/admin/pedidos")
    return { success: true }
}

export async function marcarEntregado(pedidoId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin" && profile?.rol !== "repartidor") return { error: "Rol no autorizado para esta acción" }

    const { error } = await supabase
        .from("pedidos")
        .update({ estado: "entregado" })
        .eq("id", pedidoId)

    if (error) return { error: error.message }

    revalidatePath("/delivery")
    revalidatePath("/admin")
    revalidatePath("/admin/pedidos")
    return { success: true }
}
