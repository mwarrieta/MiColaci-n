import { createClient } from "@/lib/supabase/server"

/**
 * Registra una acción en la tabla de auditoría.
 * Llamar desde cualquier Server Action que modifique datos.
 */
export async function registrarAuditoria(
    userId: string,
    accion: string,
    tablaAfectada: string,
    registroId?: string,
    datosAnteriores?: Record<string, unknown>,
    datosNuevos?: Record<string, unknown>
) {
    try {
        const supabase = await createClient()
        await supabase.from("audit_log").insert({
            usuario_id: userId,
            accion,
            tabla_afectada: tablaAfectada,
            registro_id: registroId || null,
            datos_anteriores: datosAnteriores || null,
            datos_nuevos: datosNuevos || null,
        })
    } catch (error) {
        // No fallar silenciosamente pero no interrumpir el flujo principal
        console.error("[AUDITORIA] Error al registrar:", error)
    }
}
