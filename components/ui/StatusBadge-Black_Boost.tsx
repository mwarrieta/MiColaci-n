import * as React from "react"

export type OrderStatus = "pendiente_pago" | "pago_en_revision" | "confirmado" | "en_preparacion" | "en_delivery" | "entregado" | "cancelado"

interface StatusBadgeProps {
    status: OrderStatus | string
    className?: string
}

const statusConfig: Record<string, { label: string; icon: string; styles: string }> = {
    pendiente_pago: {
        label: "Pendiente de Pago",
        icon: "⏳",
        styles: "bg-amber-50 text-amber-700 border border-amber-200/50",
    },
    pago_en_revision: {
        label: "Pago en Revisión",
        icon: "🔍",
        styles: "bg-yellow-50 text-yellow-700 border border-yellow-200/50",
    },
    confirmado: {
        label: "Confirmado",
        icon: "✅",
        styles: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    },
    en_preparacion: {
        label: "En Preparación",
        icon: "👨‍🍳",
        styles: "bg-brand-50 text-brand-700 border border-brand-200/50",
    },
    en_delivery: {
        label: "En Camino",
        icon: "🛵",
        styles: "bg-blue-50 text-blue-700 border border-blue-200/50",
    },
    entregado: {
        label: "Entregado",
        icon: "🎉",
        styles: "bg-gray-100 text-gray-600 border border-gray-200",
    },
    cancelado: {
        label: "Cancelado",
        icon: "❌",
        styles: "bg-red-50 text-red-700 border border-red-200/50",
    },
}

const fallback = {
    label: "Desconocido",
    icon: "❓",
    styles: "bg-gray-100 text-gray-600 border border-gray-200",
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const config = statusConfig[status] || fallback

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.styles} ${className}`}
        >
            <span>{config.icon}</span>
            {config.label}
        </span>
    )
}
