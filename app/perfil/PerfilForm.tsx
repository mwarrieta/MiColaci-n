"use client"

import { useState, useTransition } from "react"
import { actualizarPerfilUsuario } from "./actions"
import { toast } from "sonner"
import { Save, User, MapPin, Phone } from "lucide-react"

export function PerfilForm({ profile }: { profile: any }) {
    const [isPending, startTransition] = useTransition()
    const [isEditing, setIsEditing] = useState(false)

    // Valores locales
    const [nombre, setNombre] = useState(profile?.nombre || "")
    const [telefono, setTelefono] = useState(profile?.telefono || "")
    const [direccion, setDireccion] = useState(profile?.direccion || "")

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append("nombre", nombre)
        formData.append("telefono", telefono)
        formData.append("direccion", direccion)

        startTransition(async () => {
            const result = await actualizarPerfilUsuario(formData)
            if (result.error) {
                toast.error("Error al guardar perfil", { description: result.error })
            } else {
                toast.success("Perfil actualizado con éxito")
                setIsEditing(false)
            }
        })
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">

                {/* Nombre */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-wood-500 text-sm font-medium ml-1">
                        <User className="w-4 h-4" />
                        Nombre Completo
                    </label>
                    <input
                        type="text"
                        required
                        disabled={!isEditing}
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        className="w-full px-4 py-3 bg-wood-50/50 rounded-xl border border-wood-100 disabled:opacity-75 disabled:bg-gray-50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-wood-400 font-medium text-wood-900"
                    />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-wood-500 text-sm font-medium ml-1">
                        <Phone className="w-4 h-4" />
                        Teléfono
                    </label>
                    <input
                        type="tel"
                        disabled={!isEditing}
                        value={telefono}
                        onChange={e => setTelefono(e.target.value)}
                        placeholder="+56 9..."
                        className="w-full px-4 py-3 bg-wood-50/50 rounded-xl border border-wood-100 disabled:opacity-75 disabled:bg-gray-50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-wood-400 font-medium text-wood-900"
                    />
                </div>

                {/* Dirección Completa (100% ancho) */}
                <div className="sm:col-span-2 space-y-2">
                    <label className="flex items-center gap-2 text-wood-500 text-sm font-medium ml-1">
                        <MapPin className="w-4 h-4" />
                        Dirección para Despacho Frecuente
                    </label>
                    <input
                        type="text"
                        disabled={!isEditing}
                        value={direccion}
                        onChange={e => setDireccion(e.target.value)}
                        placeholder="Ej: Arauco 234, Oficina 4..."
                        className="w-full px-4 py-3 bg-wood-50/50 rounded-xl border border-wood-100 disabled:opacity-75 disabled:bg-gray-50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-wood-400 font-medium text-wood-900"
                    />
                </div>
            </div>

            {/* Controles */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-wood-100 mt-6">
                {!isEditing ? (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="bg-brand-50 text-brand-700 font-bold px-6 py-2.5 rounded-xl hover:bg-brand-100 transition-colors"
                    >
                        Editar Datos
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false)
                                // Revertir campos
                                setNombre(profile?.nombre || "")
                                setTelefono(profile?.telefono || "")
                                setDireccion(profile?.direccion || "")
                            }}
                            disabled={isPending}
                            className="bg-gray-50 text-gray-600 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex items-center gap-2 bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-brand-600 shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isPending ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </>
                )}
            </div>
        </form>
    )
}
