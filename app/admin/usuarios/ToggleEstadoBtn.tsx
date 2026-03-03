"use client"

import { useTransition } from "react"
import { toggleUsuarioActivo } from "../actions"
import { toast } from "sonner"
import { Ban, CheckCircle } from "lucide-react"

interface ToggleEstadoBtnProps {
    userId: string
    isActivo: boolean
}

export function ToggleEstadoBtn({ userId, isActivo }: ToggleEstadoBtnProps) {
    const [isPending, startTransition] = useTransition()

    const cambiarEstado = () => {
        const nuevoEstado = !isActivo
        const confirmMsg = nuevoEstado
            ? "¿Seguro que deseas reactivar a este usuario?"
            : "¿Seguro que deseas desactivar a este usuario? Perderá acceso a funciones."

        if (!window.confirm(confirmMsg)) return

        startTransition(async () => {
            const result = await toggleUsuarioActivo(userId, nuevoEstado)
            if (result?.error) {
                toast.error("Error al cambiar estado", { description: result.error })
            } else {
                toast.success(nuevoEstado ? "Usuario reactivado" : "Usuario desactivado")
            }
        })
    }

    return (
        <button
            onClick={cambiarEstado}
            disabled={isPending}
            title={isActivo ? "Desactivar usuario" : "Reactivar usuario"}
            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${isActivo
                    ? "text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200"
                    : "text-emerald-500 hover:bg-emerald-50 border border-emerald-200 bg-emerald-50"
                }`}
        >
            {isActivo ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
        </button>
    )
}
