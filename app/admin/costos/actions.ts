"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ---- INGREDIENTES ---- //

export async function crearIngrediente(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Privilegios insuficientes" }

    const nombre = formData.get("nombre") as string
    const unidad_medida = formData.get("unidad_medida") as string
    const costo_por_unidad = parseFloat(formData.get("costo_por_unidad") as string) || 0
    const stock_actual = parseFloat(formData.get("stock_actual") as string) || 0
    const stock_minimo = parseFloat(formData.get("stock_minimo") as string) || 0

    if (!nombre || !unidad_medida) return { error: "Nombre y unidad son requeridos" }

    const { error } = await supabase.from("ingredientes").insert({
        nombre, unidad_medida, costo_por_unidad, stock_actual, stock_minimo
    })

    if (error) return { error: error.message }

    revalidatePath("/admin/costos")
    revalidatePath("/admin/costos/ingredientes")
    return { success: true }
}

export async function editarIngrediente(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Privilegios insuficientes" }

    const nombre = formData.get("nombre") as string
    const unidad_medida = formData.get("unidad_medida") as string
    const costo_por_unidad = parseFloat(formData.get("costo_por_unidad") as string) || 0
    const stock_actual = parseFloat(formData.get("stock_actual") as string) || 0
    const stock_minimo = parseFloat(formData.get("stock_minimo") as string) || 0

    const { error } = await supabase.from("ingredientes").update({
        nombre, unidad_medida, costo_por_unidad, stock_actual, stock_minimo
    }).eq("id", id)

    if (error) return { error: error.message }

    revalidatePath("/admin/costos")
    revalidatePath("/admin/costos/ingredientes")
    return { success: true }
}

export async function eliminarIngrediente(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Privilegios insuficientes" }

    // Verificar si está en alguna receta
    const { data: enRecetas } = await supabase.from("recetas").select("id").eq("ingrediente_id", id).limit(1)
    if (enRecetas && enRecetas.length > 0) {
        return { error: "No puedes borrar un ingrediente que está en una receta. Quítalo primero de las recetas." }
    }

    const { error } = await supabase.from("ingredientes").delete().eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin/costos/ingredientes")
    return { success: true }
}

// ---- RECETAS ---- //

export async function agregarIngredienteAReceta(itemMenuId: string, ingredienteId: string, cantidad: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Privilegios insuficientes" }

    if (cantidad <= 0) return { error: "La cantidad debe ser mayor a 0" }

    // Verificar si ya existe esta combinación
    const { data: existente } = await supabase.from("recetas").select("id").eq("item_menu_id", itemMenuId).eq("ingrediente_id", ingredienteId).limit(1)
    if (existente && existente.length > 0) {
        // Actualizar en vez de crear
        const { error } = await supabase.from("recetas").update({ cantidad }).eq("id", existente[0].id)
        if (error) return { error: error.message }
    } else {
        const { error } = await supabase.from("recetas").insert({
            item_menu_id: itemMenuId,
            ingrediente_id: ingredienteId,
            cantidad
        })
        if (error) return { error: error.message }
    }

    revalidatePath("/admin/costos")
    return { success: true }
}

export async function quitarIngredienteDeReceta(recetaId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Privilegios insuficientes" }

    const { error } = await supabase.from("recetas").delete().eq("id", recetaId)
    if (error) return { error: error.message }

    revalidatePath("/admin/costos")
    return { success: true }
}
