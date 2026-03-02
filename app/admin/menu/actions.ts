"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleItemActivo(id: string, activo: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Sin permisos" }

    const { error } = await supabase.from("items_menu").update({ activo }).eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin/menu")
    revalidatePath("/")
    return { success: true }
}

export async function guardarItemMenu(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Sin permisos" }

    // 1. Verificar si es una Acción por Lote (Prioridad Absoluta)
    const isToggleTodos = formData.get("toggle_todos") === "true"
    if (isToggleTodos) {
        const activoMasivo = formData.get("activo_masivo") === "true"
        // Actualiza todos los registros y salta todas las demás validaciones
        const { error: batchError } = await supabase.from('items_menu').update({ activo: activoMasivo }).not('id', 'is', null)
        if (batchError) return { error: batchError.message }
        revalidatePath("/admin/menu")
        revalidatePath("/")
        return { success: true }
    }

    const id = formData.get("id") as string | null

    // 2. Si es un toggle rápido de Agotado Manual desde la tabla
    const isToggleAgotado = formData.get("toggle_agotado") === 'true'
    if (isToggleAgotado && id) {
        const agotado_manual = formData.get("agotado_manual") === 'true'
        const { error } = await supabase.from("items_menu").update({ agotado_manual }).eq("id", id)
        if (error) return { error: error.message }
        revalidatePath("/admin/menu")
        revalidatePath("/")
        return { success: true }
    }

    // 3. Si llega hasta aquí, se asume Creación o Edición de un ítem individual
    const nombre = formData.get("nombre") as string
    const descripcion = formData.get("descripcion") as string
    const precio = parseInt(formData.get("precio") as string)
    const categoria_id = formData.get("categoria_id") as string
    const stockRaw = formData.get("stock") as string | null
    const stock = stockRaw && stockRaw !== '' ? parseInt(stockRaw) : null
    const activo = formData.get("activo") === 'on'
    const agotado_manual = formData.get("agotado_manual") === 'on'
    const file = formData.get("imagen") as File | null

    if (!nombre || !precio || !categoria_id) {
        return { error: "Faltan campos obligatorios" }
    }

    let imagen_url = formData.get("imagen_url") as string | null

    // Subir imagen si se selecciona una nueva
    if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        const filePath = `platos/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from("menu")
            .upload(filePath, file)

        if (uploadError) return { error: "Error al subir la imagen: " + uploadError.message }

        const { data: publicUrlData } = supabase.storage.from("menu").getPublicUrl(filePath)
        imagen_url = publicUrlData.publicUrl
    }

    const payload = {
        nombre,
        descripcion,
        precio,
        categoria_id,
        stock,
        activo,
        agotado_manual,
        ...(imagen_url && { imagen_url }),
    }

    let error;
    if (id) {
        const res = await supabase.from("items_menu").update(payload).eq("id", id)
        error = res.error
    } else {
        const res = await supabase.from("items_menu").insert([payload])
        error = res.error
    }

    if (error) return { error: error.message }

    revalidatePath("/admin/menu")
    revalidatePath("/")
    return { success: true }
}

export async function eliminarItemMenu(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Sin permisos" }

    // Verificar si está en algún pedido
    const { data: enPedido } = await supabase.from("detalle_pedidos").select("id").eq("item_id", id).limit(1)

    if (enPedido && enPedido.length > 0) {
        return { error: "No se puede eliminar porque este plato ya está en pedidos históricos. Te sugerimos desactivarlo (Agotado)." }
    }

    const { error } = await supabase.from("items_menu").delete().eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin/menu")
    revalidatePath("/")
    return { success: true }
}

export async function guardarCategoria(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Sin permisos" }

    const id = formData.get("id") as string | null
    const nombre = formData.get("nombre") as string
    const orden = formData.get("orden") ? parseInt(formData.get("orden") as string) : null

    if (!nombre) return { error: "El nombre es obligatorio" }

    const payload: any = { nombre }
    if (orden) payload.orden = orden

    let error;
    if (id) {
        const res = await supabase.from("categorias").update(payload).eq("id", id)
        error = res.error
    } else {
        const res = await supabase.from("categorias").insert([payload])
        error = res.error
    }

    if (error) return { error: error.message }

    revalidatePath("/admin/menu")
    revalidatePath("/admin/menu/categorias")
    revalidatePath("/")
    return { success: true }
}

export async function eliminarCategoria(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin") return { error: "Sin permisos" }

    // Verificar si hay items usando esta categoría
    const { data: itemsRef } = await supabase.from("items_menu").select("id").eq("categoria_id", id).limit(1)

    if (itemsRef && itemsRef.length > 0) {
        return { error: "No se puede eliminar porque hay platos asignados a esta categoría. Mueve los platos a otra categoría primero." }
    }

    const { error } = await supabase.from("categorias").delete().eq("id", id)
    if (error) return { error: error.message }

    revalidatePath("/admin/menu")
    revalidatePath("/admin/menu/categorias")
    revalidatePath("/")
    return { success: true }
}
