"use client"

import { useState } from "react"
import { GestionRolBtn } from "./GestionRolBtn"
import { GestionFiadoBtn } from "./GestionFiadoBtn"
import { ToggleEstadoBtn } from "./ToggleEstadoBtn"
import { Search, ChevronDown, ShieldCheck, User, Bike, Ban, BookOpen, ShoppingBag, DollarSign } from "lucide-react"
import { StatusBadge } from "@/components/ui/StatusBadge"

const ROL_CONFIG = {
    admin: { icon: ShieldCheck, label: "Admin", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
    cliente: { icon: User, label: "Cliente", bg: "bg-gray-500/10", text: "text-gray-400", border: "border-white/10" },
    repartidor: { icon: Bike, label: "Repartidor", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
}

interface UsuarioConDatos {
    id: string
    nombre: string | null
    email: string
    rol: string
    telefono: string | null
    created_at: string
    activo: boolean
    limite_fiado: number | null
    avatar_url: string | null
    totalGastado: number
    deuda: number
    totalPedidos: number
    ultimosPedidos: {
        id: string
        numero_pedido: number
        total: number
        estado: string
        created_at: string
        tipo_entrega: string
        items: string
    }[]
}

export function UsuariosTable({ usuarios, selfId }: { usuarios: UsuarioConDatos[]; selfId: string }) {
    const [search, setSearch] = useState("")
    const [expandedId, setExpandedId] = useState<string | null>(null)

    const filtrados = usuarios.filter(u => {
        const term = search.toLowerCase()
        return (u.nombre?.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.telefono?.includes(term))
    })

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-black tracking-tight text-white">👥 Usuarios</h1>
                    <p className="text-gray-400 font-medium text-sm mt-1">
                        {usuarios.filter(u => u.activo).length} activos · {usuarios.length} registrados
                    </p>
                </div>
                {/* Buscador */}
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-admin-surface border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-gray-500 focus:border-brand-500/50 focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-sm text-blue-300">
                <p className="font-bold mb-1">¿Agregar nuevo admin?</p>
                <p className="text-blue-300/70">La persona debe registrarse primero. Después la buscái acá y le cambiái el rol.</p>
            </div>

            {/* Tabla */}
            <div className="bg-admin-surface rounded-3xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Usuario</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden sm:table-cell">Teléfono</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Rol</th>
                                <th className="text-right px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">Gastado</th>
                                <th className="text-right px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider hidden md:table-cell">Deuda</th>
                                <th className="text-right px-5 py-3.5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtrados.map((u) => {
                                const config = ROL_CONFIG[u.rol as keyof typeof ROL_CONFIG] || ROL_CONFIG.cliente
                                const Icon = config.icon
                                const esSelf = u.id === selfId
                                const isExpanded = expandedId === u.id

                                return (
                                    <>
                                        <tr
                                            key={u.id}
                                            className={`hover:bg-white/5 transition-colors cursor-pointer ${esSelf ? "bg-brand-500/5" : ""} ${!u.activo ? "opacity-50" : ""}`}
                                            onClick={() => setExpandedId(isExpanded ? null : u.id)}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-gray-300 font-bold text-sm shrink-0 relative overflow-hidden">
                                                        {u.avatar_url ? (
                                                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            u.nombre?.charAt(0)?.toUpperCase() || "?"
                                                        )}
                                                        {!u.activo && (
                                                            <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full p-0.5">
                                                                <Ban className="w-2 h-2 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`font-semibold truncate ${!u.activo ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                            {u.nombre || "Sin nombre"}
                                                            {esSelf && <span className="ml-2 text-[10px] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded-full font-bold">Tú</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-400 hidden sm:table-cell">{u.telefono || "—"}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                                                    <Icon className="w-3 h-3" /> {config.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right hidden md:table-cell">
                                                <span className="text-white font-bold text-xs">${u.totalGastado.toLocaleString("es-CL")}</span>
                                                <span className="text-gray-500 text-[10px] block">{u.totalPedidos} pedidos</span>
                                            </td>
                                            <td className="px-5 py-4 text-right hidden md:table-cell">
                                                {u.deuda > 0 ? (
                                                    <span className="text-red-400 font-bold text-xs">${u.deuda.toLocaleString("es-CL")}</span>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                {esSelf ? (
                                                    <span className="text-xs text-gray-500 italic">Tú</span>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <GestionRolBtn userId={u.id} rolActual={u.rol} disabled={!u.activo} />
                                                        {u.rol === 'cliente' && <GestionFiadoBtn userId={u.id} limiteActual={u.limite_fiado || 0} disabled={!u.activo} />}
                                                        <ToggleEstadoBtn userId={u.id} isActivo={u.activo} />
                                                    </div>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Ficha expandida */}
                                        {isExpanded && (
                                            <tr key={`${u.id}-detail`}>
                                                <td colSpan={6} className="p-0">
                                                    <div className="bg-white/5 border-t border-white/5 p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                        {/* Stats rápidos */}
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="bg-admin-surface rounded-xl p-3 border border-white/5 text-center">
                                                                <ShoppingBag className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                                                                <p className="font-bold text-white text-lg">{u.totalPedidos}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Pedidos</p>
                                                            </div>
                                                            <div className="bg-admin-surface rounded-xl p-3 border border-white/5 text-center">
                                                                <DollarSign className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                                                                <p className="font-bold text-emerald-400 text-lg">${u.totalGastado.toLocaleString("es-CL")}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Total</p>
                                                            </div>
                                                            <div className="bg-admin-surface rounded-xl p-3 border border-white/5 text-center">
                                                                <BookOpen className="w-4 h-4 text-red-500 mx-auto mb-1" />
                                                                <p className={`font-bold text-lg ${u.deuda > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                                                    ${u.deuda.toLocaleString("es-CL")}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Deuda</p>
                                                            </div>
                                                        </div>

                                                        {/* Últimos pedidos */}
                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Últimos Pedidos</h4>
                                                            {u.ultimosPedidos.length === 0 ? (
                                                                <p className="text-sm text-gray-500">Sin pedidos aún.</p>
                                                            ) : (
                                                                <ul className="space-y-2">
                                                                    {u.ultimosPedidos.map((p) => (
                                                                        <li key={p.id} className="flex items-center justify-between bg-admin-surface rounded-xl p-3 border border-white/5">
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-bold text-white text-xs">#{String(p.numero_pedido).padStart(5, "0")}</span>
                                                                                    <span className="text-[10px] text-gray-500">
                                                                                        {new Date(p.created_at).toLocaleDateString("es-CL", { timeZone: 'America/Santiago', day: '2-digit', month: 'short' })}
                                                                                    </span>
                                                                                    <span className="text-[10px] text-gray-600">{p.tipo_entrega === 'delivery' ? '🛵' : '🏪'}</span>
                                                                                </div>
                                                                                <p className="text-[10px] text-gray-500 truncate mt-0.5">{p.items}</p>
                                                                            </div>
                                                                            <div className="flex items-center gap-3 shrink-0 ml-3">
                                                                                <span className="text-xs font-bold text-white">${p.total.toLocaleString("es-CL")}</span>
                                                                                <StatusBadge status={p.estado} />
                                                                            </div>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
