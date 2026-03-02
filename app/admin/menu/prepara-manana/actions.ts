"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import fs from "fs/promises"
import path from "path"

export async function prepararMenuManana() {
    try {
        const supabase = await createClient()

        // 1. Verificación de Seguridad (Solo Admin)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: "No autorizado" }
        const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
        if (profile?.rol !== "admin") return { error: "Sin permisos" }

        // 2. Ocultar TODO el menú actual
        const { error: hideError } = await supabase.from('items_menu').update({ activo: false }).not('id', 'is', null)
        if (hideError) throw new Error("Error al ocultar menú actual: " + hideError.message)

        // 3. Obtener las Categorías para asignar correctamente (Buscamos por nombre aproximado)
        const { data: categorias } = await supabase.from("categorias_menu").select("*")
        const getCatId = (keywords: string[]) => {
            const cat = categorias?.find(c => keywords.some(k => c.nombre.toLowerCase().includes(k)))
            return cat ? cat.id : categorias?.[0]?.id // Fallback preventivo
        }

        const catPlatos = getCatId(["fondo", "plato"])
        const catEnsaladas = getCatId(["ensalada"])
        const catPostres = getCatId(["postre"])

        // Definición de Platos Mágicos
        const nuevosPlatos = [
            {
                nombre: "Carbonada",
                precio: 3500,
                descripcion: "Exquisita carbonada casera chilena.",
                categoria_id: catPlatos,
                archivo_local: "Carbonada.jpeg"
            },
            {
                nombre: "Ensalada con Atún y Huevo",
                precio: 3500,
                descripcion: "Ensalada fresca de mix de lechugas, atún y huevo duro.",
                categoria_id: catEnsaladas,
                archivo_local: "Ensalada Mixta de Huevo y Atún.jpeg"
            },
            {
                nombre: "Fruta con Yogurt y Granola",
                precio: 2500,
                descripcion: "Postre fresco de fruta picada, yogurt natural y granola crujiente.",
                categoria_id: catPostres,
                archivo_local: null // No tenemos por ahora
            }
        ]

        // Variables maestras de ruta
        // Usa la ruta absoluta desde el punto de vista del usuario
        const imageDir = path.join("C:", "Users", "mwarr", "OneDrive - UNIVERSIDAD DE LAS AMERICAS", "NOTEBOOK", "PROYECTOS", "Mi Colación", "Platos")

        // 4. Procesar e Insertar/Actualizar
        for (const plato of nuevosPlatos) {
            let imagen_url = null

            // Subir imagen si se especificó el archivo local
            if (plato.archivo_local) {
                const filePathLocal = path.join(imageDir, plato.archivo_local)

                try {
                    const imageBuffer = await fs.readFile(filePathLocal)
                    const fileExt = plato.archivo_local.split('.').pop()
                    const fileName = `${plato.nombre.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.${fileExt}`
                    const filePathCloud = `platos_diarios/${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from("menu")
                        .upload(filePathCloud, imageBuffer, { contentType: 'image/jpeg' })

                    if (uploadError) {
                        console.error("No se pudo subir la imagen", plato.archivo_local, uploadError)
                    } else {
                        const { data: publicUrlData } = supabase.storage.from("menu").getPublicUrl(filePathCloud)
                        imagen_url = publicUrlData.publicUrl
                    }
                } catch (imgLocalErr) {
                    console.error("No se encontró la imagen local:", filePathLocal, imgLocalErr)
                }
            }

            // Upsert (o buscar e inyectar) 
            // Para simplificar, insertamos si no existe el nombre, o actualizamos si existe.
            const { data: exist } = await supabase.from('items_menu').select('id, imagen_url').eq('nombre', plato.nombre).maybeSingle()

            const payload = {
                nombre: plato.nombre,
                descripcion: plato.descripcion,
                precio: plato.precio,
                categoria_id: plato.categoria_id,
                activo: true, // Queda visible de inmediato
                agotado_manual: false, // Stock listo
                stock: null, // Asumimos infinito por ahora
                ...(imagen_url && { imagen_url }) // Si subimos imagen, actualiza
            }

            if (exist) {
                // Actualizar
                await supabase.from('items_menu').update(payload).eq('id', exist.id)
            } else {
                // Crear
                await supabase.from('items_menu').insert(payload)
            }
        }

        revalidatePath("/admin/menu")
        revalidatePath("/")
        return { success: true }

    } catch (e: any) {
        console.error(e)
        return { error: e.message || "Error desconocido" }
    }
}
