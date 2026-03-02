"use client"

import { useState, useTransition } from "react"
import { Plus, Edit2, Trash2, Power, Check, X } from "lucide-react"
import { toggleItemActivo, eliminarItemMenu, guardarItemMenu } from "./actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/Button"

// Tipos basados en nuestra BD
type Categoria = { id: string; nombre: string }
type ItemMenu = {
    id: string
    nombre: string
    descripcion: string | null
    precio: number
    imagen_url: string | null
    categoria_id: string
    activo: boolean
    stock: number | null
    agotado_manual: boolean
}

interface MenuManagerProps {
    items: ItemMenu[]
    categorias: Categoria[]
}

export function MenuManager({ items, categorias }: MenuManagerProps) {
    const [isPending, startTransition] = useTransition()

    // Editar / Modal
    const [modalOpen, setModalOpen] = useState(false)
    const [itemEditar, setItemEditar] = useState<ItemMenu | null>(null)

    // Filtro
    const [catSeleccionada, setCatSeleccionada] = useState<string>("todas")

    // Manejo de estado Agotado Manual
    const handleToggleManual = (id: string, agotadoAcual: boolean) => {
        startTransition(async () => {
            const formData = new FormData()
            formData.append('id', id)
            formData.append('toggle_agotado', 'true')
            formData.append('agotado_manual', String(!agotadoAcual))

            const res = await guardarItemMenu(formData)
            if (res?.error) toast.error("Error", { description: res.error })
            else toast.success(`Item ${!agotadoAcual ? "marcado como agotado" : "reactivado"}`)
        })
    }

    // Eliminar
    const handleEliminar = (id: string) => {
        if (!confirm("¿Seguro que deseas eliminar este ítem permanentemente? Si ya tiene pedidos históricos, dará error.")) return

        startTransition(async () => {
            const res = await eliminarItemMenu(id)
            if (res?.error) toast.error("No se pudo eliminar", { description: res.error })
            else toast.success("Ítem eliminado correctamente")
        })
    }

    // Guardar (Crear/Editar) vía Form Action
    const handleSubmit = (formData: FormData) => {
        startTransition(async () => {
            const res = await guardarItemMenu(formData)
            if (res?.error) {
                toast.error("Error al guardar", { description: res.error })
            } else {
                toast.success(itemEditar ? "Ítem actualizado" : "Nuevo ítem creado")
                setModalOpen(false)
                setItemEditar(null)
            }
        })
    }

    const itemsFiltrados = catSeleccionada === "todas"
        ? items
        : items.filter(i => i.categoria_id === catSeleccionada)

    return (
        <div className="space-y-6">
            {/* Barra de Controles */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide pb-2 sm:pb-0">
                    <button
                        onClick={() => setCatSeleccionada("todas")}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${catSeleccionada === "todas" ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                        Todos
                    </button>
                    {categorias.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setCatSeleccionada(c.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${catSeleccionada === c.id ? "bg-brand-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                            {c.nombre}
                        </button>
                    ))}
                </div>

                <Button
                    variant="primary"
                    className="w-full sm:w-auto px-5 py-2.5"
                    onClick={() => { setItemEditar(null); setModalOpen(true); }}
                >
                    <Plus className="w-5 h-5 mr-2" /> Añadir Plato
                </Button>
            </div>

            {/* Tabla/Lista de Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-5 py-4">Plato</th>
                                <th className="px-5 py-4">Precio</th>
                                <th className="px-5 py-4">Stock</th>
                                <th className="px-5 py-4">Disponibilidad</th>
                                <th className="px-5 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {itemsFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                                        No hay platos en esta categoría.
                                    </td>
                                </tr>
                            ) : (
                                itemsFiltrados.map(item => (
                                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.activo ? "opacity-60 bg-gray-50/50" : ""}`}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                {item.imagen_url ? (
                                                    <img src={item.imagen_url} alt={item.nombre} className="w-12 h-12 rounded-xl object-cover border border-gray-100 bg-gray-100" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 text-xs">Sin Foto</div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.nombre}</p>
                                                    <p className="text-xs text-gray-500 max-w-[200px] truncate">{item.descripcion || "Sin descripción"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-gray-900">
                                            ${item.precio.toLocaleString("es-CL")}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-gray-900">
                                            {item.stock !== null ? item.stock : "∞"}
                                        </td>
                                        <td className="px-5 py-4">
                                            {!item.activo ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-xs font-bold">
                                                    <X className="w-3 h-3" /> Oculto (Catálogo)
                                                </span>
                                            ) : item.agotado_manual ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold">
                                                    <X className="w-3 h-3" /> Agotado (Manual)
                                                </span>
                                            ) : item.stock === 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold">
                                                    <X className="w-3 h-3" /> Agotado (Sin Stock)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                                                    <Check className="w-3 h-3" /> Disponible
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2 text-gray-400">
                                                {/* Toggle Agotado Manual */}
                                                <button
                                                    onClick={() => handleToggleManual(item.id, item.agotado_manual)}
                                                    disabled={isPending}
                                                    className="p-2 hover:bg-gray-100 hover:text-brand-600 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                                    title={item.agotado_manual ? "Reactivar" : "Forzar Agotado"}
                                                >
                                                    <Power className={`w-4 h-4 ${item.agotado_manual ? "text-gray-400" : "text-emerald-500"}`} />
                                                </button>

                                                {/* Editar */}
                                                <button
                                                    onClick={() => { setItemEditar(item); setModalOpen(true); }}
                                                    disabled={isPending}
                                                    className="p-2 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>

                                                {/* Eliminar */}
                                                <button
                                                    onClick={() => handleEliminar(item.id)}
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
            </div>

            {/* Modal Crear/Editar */}
            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-heading font-bold text-xl">{itemEditar ? "Editar Plato" : "Nuevo Plato"}</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form action={handleSubmit} className="p-6 space-y-5">
                            {itemEditar && <input type="hidden" name="id" value={itemEditar.id} />}

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nombre del plato *</label>
                                <input required name="nombre" defaultValue={itemEditar?.nombre} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-medium" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Precio *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                                        <input required type="number" name="precio" defaultValue={itemEditar?.precio} className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-medium" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Categoría *</label>
                                    <select required name="categoria_id" defaultValue={itemEditar?.categoria_id} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-medium bg-white">
                                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descripción</label>
                                <textarea name="descripcion" rows={2} defaultValue={itemEditar?.descripcion || ""} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-medium resize-none" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2" title="Deja en blanco para stock infinito">Stock Disponible</label>
                                    <input type="number" name="stock" placeholder="∞" defaultValue={itemEditar?.stock !== null ? itemEditar?.stock : ""} min="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none font-medium" />
                                </div>
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="checkbox" name="agotado_manual" defaultChecked={itemEditar?.agotado_manual} className="w-5 h-5 text-brand-500 rounded focus:ring-brand-500" />
                                        <span className="text-sm font-bold text-gray-700">Forzar Agotado</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input type="checkbox" name="activo" defaultChecked={itemEditar ? itemEditar.activo : true} className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500" />
                                        <span className="text-sm font-bold text-gray-700 flex-1">Visible en Catálogo</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">FOTO DEL PLATO</label>
                                {itemEditar?.imagen_url && (
                                    <div className="mb-3">
                                        <img src={itemEditar.imagen_url} alt="Actual" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                                        <input type="hidden" name="imagen_url" value={itemEditar.imagen_url} />
                                    </div>
                                )}
                                <input type="file" name="imagen" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 transition-colors" />
                                <p className="text-xs text-gray-400 mt-2">Formatos: JPG, PNG, WEBP (Se subirá a Supabase Storage)</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="ghost" className="w-full" onClick={() => setModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
                                    {isPending ? "Guardando..." : "Guardar Plato"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
