import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Clock, Filter, Database, User } from "lucide-react"

export const revalidate = 0

export default async function AuditoriaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Cargar los últimos 100 registros de auditoría
    const { data: logs } = await supabase
        .from("audit_log")
        .select("*, profiles!audit_log_usuario_id_fkey(nombre)")
        .order("created_at", { ascending: false })
        .limit(100)

    const ACCION_COLORS: Record<string, string> = {
        crear: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        editar: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        eliminar: "bg-red-500/10 text-red-400 border-red-500/20",
        estado: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    }

    const getAccionColor = (accion: string) => {
        const key = Object.keys(ACCION_COLORS).find(k => accion.toLowerCase().includes(k))
        return ACCION_COLORS[key || ''] || "bg-white/5 text-gray-400 border-white/10"
    }

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-heading font-black tracking-tight text-white">🔍 Auditoría</h1>
                <p className="text-gray-400 font-medium text-sm mt-1">
                    Últimas {logs?.length || 0} acciones registradas en el sistema
                </p>
            </div>

            {(!logs || logs.length === 0) ? (
                <div className="bg-admin-surface rounded-2xl border border-white/5 p-12 text-center">
                    <Database className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-30" />
                    <p className="text-gray-400 font-medium">Sin registros de auditoría todavía.</p>
                    <p className="text-xs text-gray-500 mt-1">Las acciones se registrarán automáticamente a medida que uses el sistema.</p>
                </div>
            ) : (
                <div className="bg-admin-surface rounded-3xl border border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Fecha/Hora</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Usuario</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Acción</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Tabla</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden lg:table-cell">Detalle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 text-gray-500" />
                                                {new Date(log.created_at).toLocaleString("es-CL", { timeZone: 'America/Santiago', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <User className="w-3 h-3 text-gray-500" />
                                                <span className="text-gray-300 text-xs font-medium">
                                                    {(log.profiles as any)?.nombre || "Sistema"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${getAccionColor(log.accion)}`}>
                                                {log.accion}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-400 text-xs font-mono">
                                            {log.tabla_afectada}
                                            {log.registro_id && <span className="text-gray-600 ml-1">#{log.registro_id.slice(0, 8)}</span>}
                                        </td>
                                        <td className="px-5 py-3 hidden lg:table-cell">
                                            {(log.datos_anteriores || log.datos_nuevos) ? (
                                                <details className="text-xs">
                                                    <summary className="text-gray-500 cursor-pointer hover:text-gray-300">Ver JSON</summary>
                                                    <div className="mt-2 bg-black/30 p-2 rounded-lg overflow-auto max-h-32 text-gray-400 font-mono text-[10px]">
                                                        {log.datos_anteriores && (
                                                            <div><span className="text-red-400">-</span> {JSON.stringify(log.datos_anteriores, null, 2)}</div>
                                                        )}
                                                        {log.datos_nuevos && (
                                                            <div><span className="text-emerald-400">+</span> {JSON.stringify(log.datos_nuevos, null, 2)}</div>
                                                        )}
                                                    </div>
                                                </details>
                                            ) : (
                                                <span className="text-gray-600 text-xs">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
