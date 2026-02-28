"use client"

import { useState, useTransition } from "react"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ChevronDown } from "lucide-react"
import { actualizarEstadoPedido, type EstadoPedido } from "../actions"
import { toast } from "sonner"

const ESTADOS: EstadoPedido[] = ["pendiente", "confirmado", "preparando", "en_camino", "entregado", "cancelado"]

const LABELS: Record<EstadoPedido, string> = {
    pendiente: "Pendiente",
    confirmado: "Confirmado",
    preparando: "Preparando",
    en_camino: "En Camino",
    entregado: "Entregado",
    cancelado: "Cancelado",
}

interface PedidoRowProps {
    pedido: {
        id: string
        numero_pedido: number
        estado: string
        total: number
        tipo_entrega: string
        direccion_entrega: string | null
        notas: string | null
        created_at: string
        cliente_nombre: string
        detalle_pedidos: { cantidad: number; precio_unitario: number; items_menu: { nombre: string } | null }[]
    }
}

export function PedidoRow({ pedido }: PedidoRowProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    const cambiarEstado = (nuevoEstado: EstadoPedido) => {
        startTransition(async () => {
            const result = await actualizarEstadoPedido(pedido.id, nuevoEstado)
            if (result?.error) {
                toast.error("Error al actualizar", { description: result.error })
            } else {
                toast.success(`Pedido #${String(pedido.numero_pedido).padStart(5, "0")} → ${LABELS[nuevoEstado]}`)
            }
        })
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Cabecera del pedido */}
            <div
                className="p-4 sm:p-5 flex flex-wrap items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(!open)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-gray-900">
                            #{String(pedido.numero_pedido).padStart(5, "0")}
                        </span>
                        <span className="text-xs text-gray-500">
                            {new Date(pedido.created_at).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            {pedido.tipo_entrega === "delivery" ? "🛵 Delivery" : "🏪 Retiro"}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{pedido.cliente_nombre}</p>
                    {pedido.direccion_entrega && (
                        <p className="text-xs text-gray-400 truncate mt-0.5">📍 {pedido.direccion_entrega}</p>
                    )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <span className="font-bold text-lg text-gray-900">${pedido.total.toLocaleString("es-CL")}</span>
                    <StatusBadge status={pedido.estado as any} />
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
            </div>

            {/* Detalle expandible */}
            {open && (
                <div className="border-t border-gray-100 p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                    {/* Items del pedido */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Items</h4>
                        <ul className="space-y-2">
                            {pedido.detalle_pedidos.map((d, i) => (
                                <li key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{d.cantidad}x {d.items_menu?.nombre || "Item"}</span>
                                    <span className="text-gray-500">${(d.precio_unitario * d.cantidad).toLocaleString("es-CL")}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {pedido.notas && (
                        <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800 border border-amber-100">
                            <span className="font-bold">Nota:</span> {pedido.notas}
                        </div>
                    )}

                    {/* Cambiar estado */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cambiar Estado</h4>
                        <div className="flex flex-wrap gap-2">
                            {ESTADOS.filter(e => e !== pedido.estado).map((estado) => (
                                <button
                                    key={estado}
                                    disabled={isPending}
                                    onClick={() => cambiarEstado(estado)}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-500 hover:text-brand-600 transition-colors disabled:opacity-50"
                                >
                                    → {LABELS[estado]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
