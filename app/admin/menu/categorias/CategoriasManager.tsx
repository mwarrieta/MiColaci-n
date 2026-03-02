"use client"

import { useState, useTransition } from "react"
import { Plus, Edit2, Trash2, X, ArrowLeft } from "lucide-react"
import { guardarCategoria, eliminarCategoria } from "../actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/Button"
import Link from "next/link"

type Categoria = { id: string; nombre: string; orden: number }

export function CategoriasManager({ categorias }: { categorias: Categoria[] }) {
    const [isPending, startTransition] = useTransition()

    const [modalOpen, setModalOpen] = useState(false)
    const [catEditar, setCatEditar] = useState<Categoria | null>(null)

    const handleEliminar = (id: string) => {
        if (!confirm("¿Seguro que deseas eliminar esta categoría? Solo se puede si NO tiene platos asignados.")) return

        startTransition(async () => {
            const res = await eliminarCategoria(id)
            if (res?.error) toast.error("Error", { description: res.error })
            else toast.success("Categoría eliminada")
        })
    }

    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const res = await guardarCategoria(formData)
            if (res?.error) {
                toast.error("Error al guardar", { description: res.error })
            } else {
                toast.success(catEditar ? "Categoría actualizada" : "Categoría creada")
                setModalOpen(false)
                setCatEditar(null)
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Controles */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
                <Link href="/admin/menu" className="text-gray-500 hover:text-gray-900 font-semibold text-sm flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Volver a Platos
                </Link>
                <Button
                    variant="primary"
                    className="w-full sm:w-auto px-5 py-2.5"
                    onClick={() => { setCatEditar(null); setModalOpen(true); }}
                >
                    <Plus className="w-5 h-5 mr-2" /> Nueva Categoría
                </Button>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-5 py-4 w-16 text-center">Orden</th>
                            <th className="px-5 py-4">Nombre</th>
                            <th className="px-5 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {categorias.length === 0 ? (
                            <tr><td colSpan={3} className="px-5 py-12 text-center text-gray-400">No hay categorías.</td></tr>
                        ) : (
                            categorias.map(cat => (
                                <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4 text-center font-bold text-gray-400">
                                        #{cat.orden}
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-gray-900">
                                        {cat.nombre}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2 text-gray-400">
                                            <button
                                                onClick={() => { setCatEditar(cat); setModalOpen(true); }}
                                                disabled={isPending}
                                                className="p-2 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(cat.id)}
                                                disabled={isPending}
                                                className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white text-gray-900 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-heading font-bold text-xl">{catEditar ? "Editar Categoría" : "Nueva Categoría"}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form action={handleSubmit} className="p-6 space-y-5">
                            {catEditar && <input type="hidden" name="id" value={catEditar.id} />}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre *</label>
                                <input required name="nombre" defaultValue={catEditar?.nombre} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-medium text-gray-900 bg-white" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Orden (Opcional)</label>
                                <input type="number" name="orden" defaultValue={catEditar?.orden} placeholder="Ej: 1, 2, 3..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-medium text-gray-900 bg-white" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="ghost" className="w-full" onClick={() => setModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
                                    {isPending ? "Guardando..." : "Guardar"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
