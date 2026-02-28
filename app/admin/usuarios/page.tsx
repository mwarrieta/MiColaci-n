import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GestionRolBtn } from "./GestionRolBtn"
import { ShieldCheck, User, Bike } from "lucide-react"

const ROL_CONFIG = {
    admin: { icon: ShieldCheck, label: "Admin", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    cliente: { icon: User, label: "Cliente", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
    repartidor: { icon: Bike, label: "Repartidor", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
}

export default async function AdminUsuariosPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: usuarios } = await supabase
        .from("profiles")
        .select("id, nombre, email, rol, telefono, created_at")
        .order("created_at", { ascending: false })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-500 mt-1">{usuarios?.length || 0} usuarios registrados</p>
            </div>

            {/* Instrucción para nuevo admin */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800">
                <p className="font-bold mb-1">¿Quieres agregar un nuevo administrador?</p>
                <p>La persona debe registrarse primero en la app usando <strong>Ingresar → Crear cuenta</strong>. Una vez registrada, aparecerá aquí y podrás cambiar su rol a <strong>Admin</strong>.</p>
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Usuario</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Teléfono</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Rol Actual</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Registrado</th>
                                <th className="text-right px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Cambiar Rol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(usuarios || []).map((u) => {
                                const config = ROL_CONFIG[u.rol as keyof typeof ROL_CONFIG] || ROL_CONFIG.cliente
                                const Icon = config.icon
                                const esSelf = u.id === user.id

                                return (
                                    <tr key={u.id} className={`hover:bg-gray-50 transition-colors ${esSelf ? "bg-brand-50/30" : ""}`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0">
                                                    {u.nombre?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {u.nombre || "Sin nombre"}
                                                        {esSelf && <span className="ml-2 text-[10px] bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded-full font-bold">Tú</span>}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">
                                            {u.telefono || "—"}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                                                <Icon className="w-3.5 h-3.5" />
                                                {config.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-gray-400 text-xs hidden md:table-cell">
                                            {new Date(u.created_at).toLocaleDateString("es-CL")}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {esSelf ? (
                                                <span className="text-xs text-gray-400 italic">Tu propio rol</span>
                                            ) : (
                                                <GestionRolBtn userId={u.id} rolActual={u.rol} />
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
