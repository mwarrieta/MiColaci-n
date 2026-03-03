"use client"

import { useState, useTransition } from "react"
import { actualizarLimiteFiado } from "../actions"
import { toast } from "sonner"
import { BookOpen } from "lucide-react"

export function GestionFiadoBtn({ userId, limiteActual, disabled }: { userId: string, limiteActual: number, disabled?: boolean }) {
    const [isPending, startTransition] = useTransition()
    const [showMenu, setShowMenu] = useState(false)

    // Opciones rápidas de fiado
    const OPCIONES = [0, 1, 3, 5, 10]

    const cambiarLimite = (nuevoLimite: number) => {
        setShowMenu(false)
        startTransition(async () => {
            const result = await actualizarLimiteFiado(userId, nuevoLimite)
            if (result?.error) {
                toast.error("Error al cambiar límite", { description: result.error })
            } else {
                toast.success(`Crédito actualizado a ${nuevoLimite} pedidos.`)
            }
        })
    }

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setShowMenu(!showMenu)}
                disabled={isPending || disabled}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-200 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[50px] gap-1"
                title="Editar límite de fiados"
            >
                {isPending ? "..." : (
                    <>
                        <BookOpen className="w-3.5 h-3.5" />
                        {limiteActual}
                    </>
                )}
            </button>

            {showMenu && (
                <>
                    {/* Overlay para cerrar */}
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 min-w-32">
                        <div className="px-4 py-2 text-[10px] uppercase font-bold text-gray-400 border-b border-gray-50 bg-gray-50/50">Límite Fiados</div>
                        {OPCIONES.map((limite) => (
                            <button
                                key={limite}
                                onClick={() => cambiarLimite(limite)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium transition-colors ${limiteActual === limite ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'}`}
                            >
                                {limiteActual === limite && "✓ "}{limite} {limite === 1 ? 'pedido' : 'pedidos'}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
