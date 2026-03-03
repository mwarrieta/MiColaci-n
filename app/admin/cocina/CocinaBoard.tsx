"use client"

import { useState, useTransition } from "react"
import { actualizarEstadoPedido, type EstadoPedido } from "../actions"
import { toast } from "sonner"
import { Clock, ChefHat, Truck, CheckCircle2, MapPin, Phone } from "lucide-react"

interface PedidoCocina {
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
    cliente_telefono: string | null
    items: { cantidad: number; nombre: string }[]
}

const COLUMNAS = [
    {
        estado: "confirmado",
        titulo: "📋 Por Preparar",
        siguienteEstado: "en_preparacion" as EstadoPedido,
        btnLabel: "Empezar a Cocinar",
        btnIcon: ChefHat,
        headerBg: "bg-amber-500/10 border-amber-500/20",
        headerText: "text-amber-400",
        cardBg: "border-amber-500/10",
        dotColor: "bg-amber-400",
    },
    {
        estado: "en_preparacion",
        titulo: "🔥 En Preparación",
        siguienteEstado: "en_delivery" as EstadoPedido,
        btnLabel: "Listo pa' Despacho",
        btnIcon: Truck,
        headerBg: "bg-brand-500/10 border-brand-500/20",
        headerText: "text-brand-400",
        cardBg: "border-brand-500/10",
        dotColor: "bg-brand-500",
    },
    {
        estado: "en_delivery",
        titulo: "🚀 Listos / En Camino",
        siguienteEstado: "entregado" as EstadoPedido,
        btnLabel: "Marcar Entregado",
        btnIcon: CheckCircle2,
        headerBg: "bg-emerald-500/10 border-emerald-500/20",
        headerText: "text-emerald-400",
        cardBg: "border-emerald-500/10",
        dotColor: "bg-emerald-400",
    },
]

export function CocinaBoard({ pedidos }: { pedidos: PedidoCocina[] }) {
    const [isPending, startTransition] = useTransition()

    const avanzarEstado = (pedidoId: string, numeroPedido: number, nuevoEstado: EstadoPedido, label: string) => {
        startTransition(async () => {
            const result = await actualizarEstadoPedido(pedidoId, nuevoEstado)
            if (result?.error) {
                toast.error("Error", { description: result.error })
            } else {
                toast.success(`#${String(numeroPedido).padStart(5, "0")} → ${label}`)
            }
        })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {COLUMNAS.map((col) => {
                const pedidosCol = pedidos.filter(p => p.estado === col.estado)
                const BtnIcon = col.btnIcon

                return (
                    <div key={col.estado} className="space-y-3">
                        {/* Header de columna */}
                        <div className={`rounded-2xl border p-4 ${col.headerBg}`}>
                            <div className="flex items-center justify-between">
                                <h2 className={`font-heading font-bold text-sm ${col.headerText}`}>{col.titulo}</h2>
                                <span className={`w-6 h-6 rounded-full ${col.headerBg.split(" ")[0]} flex items-center justify-center text-xs font-black ${col.headerText}`}>
                                    {pedidosCol.length}
                                </span>
                            </div>
                        </div>

                        {/* Columna vacía */}
                        {pedidosCol.length === 0 && (
                            <div className="bg-admin-surface rounded-2xl border border-white/5 p-8 text-center">
                                <p className="text-gray-500 text-sm font-medium">Sin pedidos aquí</p>
                            </div>
                        )}

                        {/* Tarjetas */}
                        {pedidosCol.map((pedido) => (
                            <div
                                key={pedido.id}
                                className={`bg-admin-surface rounded-2xl border ${col.cardBg} p-4 space-y-3 transition-all hover:border-white/20`}
                            >
                                {/* Encabezado */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${col.dotColor} animate-pulse`} />
                                            <span className="font-heading font-bold text-white text-sm">
                                                #{String(pedido.numero_pedido).padStart(5, "0")}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">{pedido.cliente_nombre}</p>
                                    </div>
                                    <div className="text-right">
                                        {pedido.hora_solicitada && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                                                <Clock className="w-3 h-3" /> {pedido.hora_solicitada}
                                            </span>
                                        )}
                                        <span className="block text-xs text-gray-500 mt-1">
                                            {pedido.tipo_entrega === "delivery" ? "🛵 Delivery" : "🏪 Retiro"}
                                        </span>
                                    </div>
                                </div>

                                {/* Items */}
                                <ul className="space-y-1 bg-white/5 rounded-xl p-3">
                                    {pedido.items.map((item, i) => (
                                        <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                                            <span className="font-bold text-white text-xs bg-white/10 w-5 h-5 rounded flex items-center justify-center shrink-0">
                                                {item.cantidad}
                                            </span>
                                            <span className="truncate">{item.nombre}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Notas */}
                                {pedido.notas && (
                                    <div className="text-xs text-amber-300/80 bg-amber-500/10 p-2 rounded-lg border border-amber-500/10">
                                        💬 {pedido.notas}
                                    </div>
                                )}

                                {/* Dirección delivery */}
                                {pedido.tipo_entrega === "delivery" && pedido.direccion_entrega && (
                                    <div className="text-xs text-gray-400 flex items-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
                                        <span>{pedido.direccion_entrega}</span>
                                    </div>
                                )}

                                {/* Contacto WA */}
                                {pedido.cliente_telefono && (
                                    <a
                                        href={`https://wa.me/${pedido.cliente_telefono.replace('+', '')}?text=${encodeURIComponent(`¡Hola ${pedido.cliente_nombre}! 👩‍🍳 Soy la Tía Elvira, te escribo por tu pedido #${String(pedido.numero_pedido).padStart(5, "0")}.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-xs font-bold text-green-400 hover:text-green-300 transition-colors"
                                    >
                                        <Phone className="w-3 h-3" /> WhatsApp
                                    </a>
                                )}

                                {/* Botón avanzar */}
                                <button
                                    onClick={() => avanzarEstado(pedido.id, pedido.numero_pedido, col.siguienteEstado, col.btnLabel)}
                                    disabled={isPending}
                                    className={`w-full flex items-center justify-center gap-2 font-bold text-sm py-2.5 rounded-xl transition-all disabled:opacity-50 ${col.headerBg} ${col.headerText} hover:opacity-80`}
                                >
                                    <BtnIcon className="w-4 h-4" />
                                    {isPending ? "Actualizando..." : col.btnLabel}
                                </button>
                            </div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
}
