"use client"

import { useState, useTransition } from "react"
import { actualizarRolUsuario } from "../actions"
import { toast } from "sonner"

const ROLES = ["cliente", "admin", "repartidor"] as const
type Rol = typeof ROLES[number]

const ROL_LABELS: Record<Rol, string> = {
    cliente: "Cliente",
    admin: "Admin",
    repartidor: "Repartidor",
}

interface GestionRolBtnProps {
    userId: string
    rolActual: string
}

export function GestionRolBtn({ userId, rolActual }: GestionRolBtnProps) {
    const [isPending, startTransition] = useTransition()
    const [showMenu, setShowMenu] = useState(false)

    const cambiarRol = (nuevoRol: Rol) => {
        setShowMenu(false)
        startTransition(async () => {
            const result = await actualizarRolUsuario(userId, nuevoRol)
            if (result?.error) {
                toast.error("Error al cambiar rol", { description: result.error })
            } else {
                toast.success(`Rol actualizado a ${ROL_LABELS[nuevoRol]}`)
            }
        })
    }

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-50"
            >
                {isPending ? "..." : "Cambiar ▾"}
            </button>

            {showMenu && (
                <>
                    {/* Overlay para cerrar */}
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 min-w-32">
                        {ROLES.filter(r => r !== rolActual).map((rol) => (
                            <button
                                key={rol}
                                onClick={() => cambiarRol(rol)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                → {ROL_LABELS[rol]}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
