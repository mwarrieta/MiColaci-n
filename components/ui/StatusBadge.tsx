import * as React from "react"

export type OrderStatus = "pendiente" | "confirmado" | "preparando" | "en_camino" | "entregado" | "cancelado"

interface StatusBadgeProps {
    status: OrderStatus
    className?: string
}

const statusConfig: Record<OrderStatus, { label: string; icon: string; styles: string }> = {
    pendiente: {
        label: "Pendiente",
        icon: "⏳",
        styles: "bg-amber-50 text-amber-700 border border-amber-200/50",
    },
    confirmado: {
        label: "Confirmado",
        icon: "✅",
        styles: "bg-emerald-50 text-emerald-700 border border-emerald-200/50",
    },
    preparando: {
        label: "Preparando",
        icon: "👨‍🍳",
        styles: "bg-brand-50 text-brand-700 border border-brand-200/50",
    },
    en_camino: {
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

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
    const config = statusConfig[status]

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.styles} ${className}`}
        >
            <span>{config.icon}</span>
            {config.label}
        </span>
    )
}
