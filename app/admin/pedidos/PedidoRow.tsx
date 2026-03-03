"use client"

import { useState, useTransition } from "react"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ChevronDown, Pencil, Trash2, Save, X } from "lucide-react"
import { actualizarEstadoPedido, editarItemPedido, editarPedido, eliminarPedido, type EstadoPedido } from "../actions"
import { toast } from "sonner"

const ESTADOS: EstadoPedido[] = ["pendiente_pago", "pago_en_revision", "confirmado", "en_preparacion", "en_delivery", "entregado", "cancelado"]

const LABELS: Record<EstadoPedido, string> = {
    pendiente_pago: "Pendiente de Pago",
    pago_en_revision: "Pago en Revisión",
    confirmado: "Confirmado",
    en_preparacion: "En Preparación",
    en_delivery: "En Camino",
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
        hora_solicitada: string | null
        notas: string | null
        created_at: string
        cliente_nombre: string
        cliente_telefono?: string | null
        detalle_pedidos: { id?: string; cantidad: number; precio_unitario: number; items_menu: { nombre: string } | null }[]
    }
}

export function PedidoRow({ pedido }: PedidoRowProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Estado editable de notas/dirección
    const [editNotas, setEditNotas] = useState(pedido.notas || "")
    const [editDireccion, setEditDireccion] = useState(pedido.direccion_entrega || "")

    // Estado editable de items
    const [editItems, setEditItems] = useState(
        pedido.detalle_pedidos.map(d => ({
            id: d.id || "",
            cantidad: d.cantidad,
            precio_unitario: d.precio_unitario,
            nombre: d.items_menu?.nombre || "Item",
        }))
    )

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

    const guardarCambios = () => {
        startTransition(async () => {
            // 1. Guardar cambios de items
            for (const item of editItems) {
                if (!item.id) continue
                const original = pedido.detalle_pedidos.find(d => d.id === item.id)
                if (original && (original.cantidad !== item.cantidad || original.precio_unitario !== item.precio_unitario)) {
                    const result = await editarItemPedido(item.id, pedido.id, {
                        cantidad: item.cantidad,
                        precio_unitario: item.precio_unitario
                    })
                    if (result?.error) {
                        toast.error("Error editando item", { description: result.error })
                        return
                    }
                }
            }

            // 2. Guardar notas/dirección si cambiaron
            if (editNotas !== (pedido.notas || "") || editDireccion !== (pedido.direccion_entrega || "")) {
                const result = await editarPedido(pedido.id, {
                    notas: editNotas,
                    direccion_entrega: editDireccion
                })
                if (result?.error) {
                    toast.error("Error editando pedido", { description: result.error })
                    return
                }
            }

            toast.success("¡Cambios guardados, cariño!")
            setIsEditing(false)
        })
    }

    const handleEliminar = () => {
        startTransition(async () => {
            const result = await eliminarPedido(pedido.id)
            if (result?.error) {
                toast.error("Error al cancelar", { description: result.error })
            } else {
                toast.success("Pedido cancelado")
                setShowDeleteConfirm(false)
            }
        })
    }

    const updateItemCantidad = (idx: number, val: number) => {
        setEditItems(prev => prev.map((item, i) => i === idx ? { ...item, cantidad: Math.max(1, val) } : item))
    }

    const updateItemPrecio = (idx: number, val: number) => {
        setEditItems(prev => prev.map((item, i) => i === idx ? { ...item, precio_unitario: Math.max(0, val) } : item))
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                        <span className="text-xs text-gray-500 font-medium">
                            {new Date(pedido.created_at).toLocaleString("es-CL", { timeZone: 'America/Santiago', hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                            {pedido.tipo_entrega === "delivery" ? "🛵 Delivery" : "🏪 Retiro"}
                        </span>
                        {pedido.hora_solicitada && (
                            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-bold border border-brand-200">
                                ⏰ Para las {pedido.hora_solicitada}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-700 font-bold truncate">{pedido.cliente_nombre}</p>
                    {pedido.direccion_entrega && (
                        <p className="text-xs font-semibold text-gray-500 truncate mt-0.5">📍 <span className="text-gray-600 font-medium">{pedido.direccion_entrega}</span></p>
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
                <div className="border-t border-gray-100 bg-gray-50 p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                    {/* Toolbar de edición */}
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items del Pedido</h4>
                        <div className="flex items-center gap-2">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-all border border-brand-200"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Editar
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={guardarCambios}
                                        disabled={isPending}
                                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all border border-emerald-200 disabled:opacity-50"
                                    >
                                        <Save className="w-3.5 h-3.5" /> {isPending ? "Guardando..." : "Guardar"}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false)
                                            setEditNotas(pedido.notas || "")
                                            setEditDireccion(pedido.direccion_entrega || "")
                                            setEditItems(pedido.detalle_pedidos.map(d => ({
                                                id: d.id || "", cantidad: d.cantidad,
                                                precio_unitario: d.precio_unitario, nombre: d.items_menu?.nombre || "Item"
                                            })))
                                        }}
                                        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                    >
                                        <X className="w-3.5 h-3.5" /> Cancelar
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <ul className="space-y-2">
                        {editItems.map((d, i) => (
                            <li key={i} className="flex items-center justify-between text-sm gap-2">
                                {isEditing ? (
                                    <>
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="number"
                                                min={1}
                                                value={d.cantidad}
                                                onChange={(e) => updateItemCantidad(i, parseInt(e.target.value) || 1)}
                                                className="w-14 bg-white border border-gray-200 text-gray-900 px-2 py-1 rounded-lg text-center text-xs font-bold shadow-sm"
                                            />
                                            <span className="text-gray-700 font-medium">× {d.nombre}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-500 text-xs font-bold">$</span>
                                            <input
                                                type="number"
                                                min={0}
                                                value={d.precio_unitario}
                                                onChange={(e) => updateItemPrecio(i, parseInt(e.target.value) || 0)}
                                                className="w-20 bg-white border border-gray-200 text-gray-900 px-2 py-1 rounded-lg text-right text-xs font-bold shadow-sm"
                                            />
                                        </div>
                                        <span className="text-gray-500 text-xs w-20 text-right font-bold">
                                            = ${(d.cantidad * d.precio_unitario).toLocaleString("es-CL")}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-gray-700 font-medium">{d.cantidad}x {d.nombre}</span>
                                        <span className="text-gray-500 font-bold">${(d.precio_unitario * d.cantidad).toLocaleString("es-CL")}</span>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* Notas y Dirección editables */}
                    {isEditing ? (
                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Notas</label>
                                <textarea
                                    value={editNotas}
                                    onChange={(e) => setEditNotas(e.target.value)}
                                    rows={2}
                                    className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-xl text-sm placeholder:text-gray-400 resize-none shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
                                    placeholder="Sin notas..."
                                />
                            </div>
                            {pedido.tipo_entrega === "delivery" && (
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Dirección</label>
                                    <input
                                        type="text"
                                        value={editDireccion}
                                        onChange={(e) => setEditDireccion(e.target.value)}
                                        className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-xl text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        pedido.notas && (
                            <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800 border border-amber-200 shadow-sm">
                                <span className="font-bold">Nota:</span> {pedido.notas}
                            </div>
                        )
                    )}

                    {/* Cambiar estado */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cambiar Estado</h4>
                        <div className="flex flex-wrap gap-2">
                            {ESTADOS.filter(e => e !== pedido.estado).map((estado) => (
                                <button
                                    key={estado}
                                    disabled={isPending}
                                    onClick={() => cambiarEstado(estado)}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 shadow-sm transition-all disabled:opacity-50"
                                >
                                    → {LABELS[estado]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Eliminar pedido */}
                    <div className="pt-2 border-t border-gray-200">
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-all border border-red-200"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Cancelar Pedido
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-red-600 font-bold">¿Segura que querís cancelar este pedido?</span>
                                <button
                                    onClick={handleEliminar}
                                    disabled={isPending}
                                    className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isPending ? "Cancelando..." : "Sí, cancelar"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="text-xs font-bold text-gray-500 hover:text-gray-700"
                                >
                                    No, volver
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
