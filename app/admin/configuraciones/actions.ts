"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function actualizarConfiguraciones(formData: FormData) {
    const supabase = await createClient()

    // 1. Validar Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
    if (profile?.rol !== 'admin') return

    // 2. Extraer valores
    const costoDelivery = formData.get("costo_delivery") as string

    // 3. Upsert
    if (costoDelivery) {
        const { error } = await supabase
            .from('configuraciones')
            .upsert({ clave: 'costo_delivery', valor: costoDelivery })

        if (error) {
            console.error(error)
            return
        }
    }

    revalidatePath("/admin/configuraciones")
    revalidatePath("/checkout")
}
