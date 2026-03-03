"use client"

import { useState } from "react"
import { GestionRolBtn } from "./GestionRolBtn"
import { GestionFiadoBtn } from "./GestionFiadoBtn"
import { ToggleEstadoBtn } from "./ToggleEstadoBtn"
import { Search, ChevronDown, ShieldCheck, User, Bike, Ban, BookOpen, ShoppingBag, DollarSign } from "lucide-react"
import { StatusBadge } from "@/components/ui/StatusBadge"

const ROL_CONFIG = {
    admin: { icon: ShieldCheck, label: "Admin", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
    cliente: { icon: User, label: "Cliente", bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-200" },
    repartidor: { icon: Bike, label: "Repartidor", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
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
                    <h1 className="text-3xl font-heading font-black tracking-tight text-gray-900">👥 Usuarios</h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                        {usuarios.filter(u => u.activo).length} activos · {usuarios.length} registrados
                    </p>
                </div>
                {/* Buscador */}
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-gray-900 pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 shadow-sm">
                <p className="font-bold mb-1">¿Agregar nuevo admin?</p>
                <p className="text-blue-700">La persona debe registrarse primero. Después la buscái acá y le cambiái el rol.</p>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider">Usuario</th>
                                <th className="text-left px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Teléfono</th>
                                <th className="text-left px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider">Rol</th>
                                <th className="text-right px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Gastado</th>
                                <th className="text-right px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Deuda</th>
                                <th className="text-right px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtrados.map((u) => {
                                const config = ROL_CONFIG[u.rol as keyof typeof ROL_CONFIG] || ROL_CONFIG.cliente
                                const Icon = config.icon
                                const esSelf = u.id === selfId
                                const isExpanded = expandedId === u.id

                                return (
                                    <>
                                        <tr
                                            key={u.id}
                                            className={`hover:bg-gray-50 transition-colors cursor-pointer ${esSelf ? "bg-brand-50" : ""} ${!u.activo ? "opacity-50" : ""}`}
                                            onClick={() => setExpandedId(isExpanded ? null : u.id)}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0 relative overflow-hidden">
                                                        {u.avatar_url ? (
                                                            <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            u.nombre?.charAt(0)?.toUpperCase() || "?"
                                                        )}
                                                        {!u.activo && (
                                                            <div className="absolute -bottom-0.5 -right-0.5 bg-red-500 rounded-full p-0.5 border-2 border-white">
                                                                <Ban className="w-2 h-2 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`font-semibold truncate ${!u.activo ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                            {u.nombre || "Sin nombre"}
                                                            {esSelf && <span className="ml-2 text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded-full font-bold">Tú</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">{u.telefono || "—"}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
                                                    <Icon className="w-3 h-3" /> {config.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right hidden md:table-cell">
                                                <span className="text-gray-900 font-bold text-xs">${u.totalGastado.toLocaleString("es-CL")}</span>
                                                <span className="text-gray-400 text-[10px] block font-medium">{u.totalPedidos} pedidos</span>
                                            </td>
                                            <td className="px-5 py-4 text-right hidden md:table-cell">
                                                {u.deuda > 0 ? (
                                                    <span className="text-red-500 font-bold text-xs">${u.deuda.toLocaleString("es-CL")}</span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
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
                                                    <div className="bg-gray-50 border-t border-gray-100 p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                                                        {/* Stats rápidos */}
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="bg-white rounded-xl p-3 border border-gray-200 text-center shadow-sm">
                                                                <ShoppingBag className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                                                                <p className="font-bold text-gray-900 text-lg">{u.totalPedidos}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Pedidos</p>
                                                            </div>
                                                            <div className="bg-white rounded-xl p-3 border border-gray-200 text-center shadow-sm">
                                                                <DollarSign className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                                                                <p className="font-bold text-emerald-600 text-lg">${u.totalGastado.toLocaleString("es-CL")}</p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total</p>
                                                            </div>
                                                            <div className="bg-white rounded-xl p-3 border border-gray-200 text-center shadow-sm">
                                                                <BookOpen className="w-4 h-4 text-red-500 mx-auto mb-1" />
                                                                <p className={`font-bold text-lg ${u.deuda > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                                    ${u.deuda.toLocaleString("es-CL")}
                                                                </p>
                                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Deuda</p>
                                                            </div>
                                                        </div>

                                                        {/* Últimos pedidos */}
                                                        <div>
                                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Últimos Pedidos</h4>
                                                            {u.ultimosPedidos.length === 0 ? (
                                                                <p className="text-sm text-gray-500">Sin pedidos aún.</p>
                                                            ) : (
                                                                <ul className="space-y-2">
                                                                    {u.ultimosPedidos.map((p) => (
                                                                        <li key={p.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
                                                                            <div className="min-w-0 flex-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-bold text-gray-900 text-xs">#{String(p.numero_pedido).padStart(5, "0")}</span>
                                                                                    <span className="text-[10px] text-gray-500 font-medium">
                                                                                        {new Date(p.created_at).toLocaleDateString("es-CL", { timeZone: 'America/Santiago', day: '2-digit', month: 'short' })}
                                                                                    </span>
                                                                                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{p.tipo_entrega === 'delivery' ? '🛵' : '🏪'}</span>
                                                                                </div>
                                                                                <p className="text-[10px] text-gray-500 truncate mt-0.5">{p.items}</p>
                                                                            </div>
                                                                            <div className="flex items-center gap-3 shrink-0 ml-3">
                                                                                <span className="text-xs font-bold text-gray-900">${p.total.toLocaleString("es-CL")}</span>
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
