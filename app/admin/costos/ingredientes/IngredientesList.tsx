"use client"

import { useState, useTransition } from "react"
import { crearIngrediente, editarIngrediente, eliminarIngrediente } from "../actions"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Save, X, Package } from "lucide-react"

interface Ingrediente {
    id: string
    nombre: string
    unidad_medida: string
    costo_por_unidad: number
    stock_actual: number
    stock_minimo: number
}

export function IngredientesList({ ingredientes }: { ingredientes: Ingrediente[] }) {
    const [isPending, startTransition] = useTransition()
    const [showForm, setShowForm] = useState(false)
    const [editId, setEditId] = useState<string | null>(null)

    const handleCreate = (formData: FormData) => {
        startTransition(async () => {
            const result = await crearIngrediente(formData)
            if (result?.error) {
                toast.error("Error", { description: result.error })
            } else {
                toast.success("¡Ingrediente creado!")
                setShowForm(false)
            }
        })
    }

    const handleEdit = (id: string, formData: FormData) => {
        startTransition(async () => {
            const result = await editarIngrediente(id, formData)
            if (result?.error) {
                toast.error("Error", { description: result.error })
            } else {
                toast.success("Ingrediente actualizado")
                setEditId(null)
            }
        })
    }

    const handleDelete = (id: string) => {
        if (!confirm("¿Segura que querís borrar este ingrediente?")) return
        startTransition(async () => {
            const result = await eliminarIngrediente(id)
            if (result?.error) {
                toast.error("Error", { description: result.error })
            } else {
                toast.success("Ingrediente eliminado")
            }
        })
    }

    return (
        <div className="space-y-4">
            {/* Botón crear */}
            <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-brand-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors text-sm shadow-lg shadow-brand-500/20"
            >
                <Plus className="w-4 h-4" /> Nuevo Ingrediente
            </button>

            {/* Formulario de creación */}
            {showForm && (
                <form action={handleCreate} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 shadow-sm">
                    <h3 className="font-heading font-bold text-gray-900">Nuevo Ingrediente</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Nombre *</label>
                            <input name="nombre" required placeholder="Ej: Papa" className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Unidad *</label>
                            <select name="unidad_medida" required className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm">
                                <option value="kg">Kilogramo (kg)</option>
                                <option value="lt">Litro (lt)</option>
                                <option value="uni">Unidad (uni)</option>
                                <option value="gr">Gramos (gr)</option>
                                <option value="ml">Mililitros (ml)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Costo por Unidad ($)</label>
                            <input name="costo_por_unidad" type="number" step="1" defaultValue="0" className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Stock Actual</label>
                            <input name="stock_actual" type="number" step="0.01" defaultValue="0" className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1">Stock Mínimo</label>
                            <input name="stock_minimo" type="number" step="0.01" defaultValue="0" className="w-full bg-white border border-gray-200 text-gray-900 px-3 py-2 rounded-lg text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" disabled={isPending} className="bg-brand-500 text-white font-bold px-5 py-2 rounded-lg text-sm hover:bg-brand-600 disabled:opacity-50">
                            {isPending ? "Guardando..." : "Crear Ingrediente"}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 text-sm font-bold">
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Tabla */}
            {ingredientes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 font-medium">Aún no hay ingredientes, cariño. ¡Empieza creando uno!</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider">Ingrediente</th>
                                    <th className="text-left px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider">Unidad</th>
                                    <th className="text-right px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider">Costo/Uni</th>
                                    <th className="text-right px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Stock</th>
                                    <th className="text-right px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Mín.</th>
                                    <th className="text-right px-5 py-3.5 font-bold text-gray-600 text-xs uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {ingredientes.map((ing) => {
                                    const isEditing = editId === ing.id
                                    const stockBajo = ing.stock_actual <= ing.stock_minimo && ing.stock_minimo > 0

                                    if (isEditing) {
                                        return (
                                            <tr key={ing.id} className="bg-gray-50">
                                                <td colSpan={6} className="p-4">
                                                    <form action={(fd) => handleEdit(ing.id, fd)} className="grid sm:grid-cols-5 gap-3 items-end">
                                                        <input name="nombre" defaultValue={ing.nombre} required className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all" />
                                                        <select name="unidad_medida" defaultValue={ing.unidad_medida} className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all">
                                                            <option value="kg">kg</option>
                                                            <option value="lt">lt</option>
                                                            <option value="uni">uni</option>
                                                            <option value="gr">gr</option>
                                                            <option value="ml">ml</option>
                                                        </select>
                                                        <input name="costo_por_unidad" type="number" step="1" defaultValue={ing.costo_por_unidad} className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all" />
                                                        <input name="stock_actual" type="number" step="0.01" defaultValue={ing.stock_actual} className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all" />
                                                        <input name="stock_minimo" type="number" step="0.01" defaultValue={ing.stock_minimo} className="bg-white border border-gray-300 text-gray-900 px-3 py-2 rounded-lg text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all" />
                                                        <div className="sm:col-span-5 flex items-center gap-2">
                                                            <button type="submit" disabled={isPending} className="flex items-center gap-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 font-bold px-3 py-1.5 rounded-lg text-xs disabled:opacity-50 transition-colors">
                                                                <Save className="w-3.5 h-3.5" /> Guardar
                                                            </button>
                                                            <button type="button" onClick={() => setEditId(null)} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-xs font-bold">
                                                                <X className="w-3.5 h-3.5" /> Cancelar
                                                            </button>
                                                        </div>
                                                    </form>
                                                </td>
                                            </tr>
                                        )
                                    }

                                    return (
                                        <tr key={ing.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-5 py-3.5 font-bold text-gray-900">{ing.nombre}</td>
                                            <td className="px-5 py-3.5 text-gray-600 font-medium">{ing.unidad_medida}</td>
                                            <td className="px-5 py-3.5 text-right font-bold text-gray-900">${ing.costo_por_unidad.toLocaleString("es-CL")}</td>
                                            <td className={`px-5 py-3.5 text-right hidden sm:table-cell ${stockBajo ? 'text-red-600 font-bold' : 'text-gray-500 font-medium'}`}>
                                                {ing.stock_actual}
                                            </td>
                                            <td className="px-5 py-3.5 text-right text-gray-500 font-medium hidden sm:table-cell">{ing.stock_minimo}</td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditId(ing.id)} className="text-gray-400 hover:text-brand-600 hover:bg-brand-50 p-1.5 rounded-md transition-colors">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDelete(ing.id)} disabled={isPending} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors disabled:opacity-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
