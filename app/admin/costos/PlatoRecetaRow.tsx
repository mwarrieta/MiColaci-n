"use client"

import { useState, useTransition } from "react"
import { ChevronDown, Plus, Trash2 } from "lucide-react"
import { agregarIngredienteAReceta, quitarIngredienteDeReceta } from "./actions"
import { toast } from "sonner"

interface Ingrediente {
    id: string
    nombre: string
    unidad_medida: string
    costo_por_unidad: number
}

interface PlatoRecetaRowProps {
    plato: {
        id: string
        nombre: string
        precio: number
        costoUnitario: number
        margen: number
        recetas: {
            id: string
            cantidad: number
            ingredientes: Ingrediente | null
        }[]
    }
    ingredientesDisponibles: Ingrediente[]
}

export function PlatoRecetaRow({ plato, ingredientesDisponibles }: PlatoRecetaRowProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [showAddForm, setShowAddForm] = useState(false)
    const [selectedIngrediente, setSelectedIngrediente] = useState("")
    const [cantidad, setCantidad] = useState("")

    const margenColor = plato.margen >= 50 ? 'text-emerald-400' : plato.margen >= 30 ? 'text-amber-400' : 'text-red-400'
    const margenBg = plato.margen >= 50 ? 'bg-emerald-500/10 border-emerald-500/20' : plato.margen >= 30 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'

    const handleAgregar = () => {
        if (!selectedIngrediente || !cantidad) return
        startTransition(async () => {
            const result = await agregarIngredienteAReceta(plato.id, selectedIngrediente, parseFloat(cantidad))
            if (result?.error) {
                toast.error("Error", { description: result.error })
            } else {
                toast.success("Ingrediente agregado a la receta")
                setShowAddForm(false)
                setSelectedIngrediente("")
                setCantidad("")
            }
        })
    }

    const handleQuitar = (recetaId: string) => {
        startTransition(async () => {
            const result = await quitarIngredienteDeReceta(recetaId)
            if (result?.error) {
                toast.error("Error", { description: result.error })
            } else {
                toast.success("Ingrediente quitado")
            }
        })
    }

    return (
        <div className="bg-admin-surface rounded-2xl border border-white/5 overflow-hidden">
            {/* Cabecera */}
            <div
                className="p-4 sm:p-5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setOpen(!open)}
            >
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{plato.nombre}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{plato.recetas.length} ingrediente{plato.recetas.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Venta</p>
                        <p className="font-bold text-white text-sm">${plato.precio.toLocaleString("es-CL")}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Costo</p>
                        <p className="font-bold text-gray-300 text-sm">${plato.costoUnitario.toLocaleString("es-CL")}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${margenBg} ${margenColor}`}>
                        {plato.margen}%
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
            </div>

            {/* Detalle receta */}
            {open && (
                <div className="border-t border-white/5 p-4 sm:p-5 space-y-3 animate-in fade-in slide-in-from-top-2">
                    {plato.recetas.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Sin ingredientes definidos. Agrega el primero.</p>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="text-left py-2">Ingrediente</th>
                                    <th className="text-right py-2">Cantidad</th>
                                    <th className="text-right py-2">$/Uni</th>
                                    <th className="text-right py-2">Subtotal</th>
                                    <th className="w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {plato.recetas.map((r) => {
                                    const ing = r.ingredientes
                                    if (!ing) return null
                                    const subtotal = ing.costo_por_unidad * r.cantidad
                                    return (
                                        <tr key={r.id} className="hover:bg-white/5 transition-colors">
                                            <td className="py-2 text-gray-300">{ing.nombre}</td>
                                            <td className="py-2 text-right text-gray-400">{r.cantidad} {ing.unidad_medida}</td>
                                            <td className="py-2 text-right text-gray-400">${ing.costo_por_unidad.toLocaleString("es-CL")}</td>
                                            <td className="py-2 text-right font-bold text-white">${Math.round(subtotal).toLocaleString("es-CL")}</td>
                                            <td className="py-2 text-right">
                                                <button
                                                    onClick={() => handleQuitar(r.id)}
                                                    disabled={isPending}
                                                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}

                    {/* Agregar ingrediente */}
                    {!showAddForm ? (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-1.5 text-xs font-bold text-brand-400 bg-brand-500/10 hover:bg-brand-500/20 px-3 py-1.5 rounded-lg transition-all border border-brand-500/20"
                        >
                            <Plus className="w-3.5 h-3.5" /> Agregar Ingrediente
                        </button>
                    ) : (
                        <div className="flex flex-wrap items-end gap-3 bg-white/5 p-3 rounded-xl">
                            <div className="flex-1 min-w-[140px]">
                                <label className="text-xs font-bold text-gray-400 block mb-1">Ingrediente</label>
                                <select
                                    value={selectedIngrediente}
                                    onChange={(e) => setSelectedIngrediente(e.target.value)}
                                    className="w-full bg-admin-surface border border-white/10 text-white px-3 py-2 rounded-lg text-sm"
                                >
                                    <option value="">Seleccionar...</option>
                                    {ingredientesDisponibles.map(ing => (
                                        <option key={ing.id} value={ing.id}>
                                            {ing.nombre} ({ing.unidad_medida}) — ${ing.costo_por_unidad.toLocaleString("es-CL")}/{ing.unidad_medida}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="text-xs font-bold text-gray-400 block mb-1">Cantidad</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={cantidad}
                                    onChange={(e) => setCantidad(e.target.value)}
                                    placeholder="0.5"
                                    className="w-full bg-admin-surface border border-white/10 text-white px-3 py-2 rounded-lg text-sm"
                                />
                            </div>
                            <button
                                onClick={handleAgregar}
                                disabled={isPending || !selectedIngrediente || !cantidad}
                                className="bg-brand-500 text-white font-bold px-4 py-2 rounded-lg text-sm hover:bg-brand-600 transition-colors disabled:opacity-50"
                            >
                                {isPending ? "..." : "Agregar"}
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="text-xs text-gray-400 hover:text-gray-300 px-3 py-2"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
