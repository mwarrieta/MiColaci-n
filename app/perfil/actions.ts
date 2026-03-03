"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function actualizarPerfilUsuario(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "No autorizado" }
    }

    const nombre = formData.get("nombre") as string
    const telefono = formData.get("telefono") as string
    const direccion = formData.get("direccion") as string

    if (!nombre) {
        return { error: "El nombre es obligatorio" }
    }

    const { error: profileError } = await supabase
        .from("profiles")
        .update({
            nombre,
            telefono: telefono || null,
            direccion: direccion || null,
        })
        .eq("id", user.id)

    if (profileError) {
        return { error: profileError.message }
    }

    revalidatePath("/perfil")
    revalidatePath("/checkout")

    return { success: true }
}
