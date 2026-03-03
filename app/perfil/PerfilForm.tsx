"use client"

import { useState, useTransition } from "react"
import { actualizarPerfilUsuario } from "./actions"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Save, User, MapPin, Phone, ShieldCheck, User as UserIcon, Camera } from "lucide-react"

export function PerfilForm({
    profile,
    userEmail,
    isAdmin,
    isRepartidor
}: {
    profile: any,
    userEmail: string | undefined,
    isAdmin: boolean,
    isRepartidor: boolean
}) {
    const [isPending, startTransition] = useTransition()
    const [isEditing, setIsEditing] = useState(false)

    // Extraemos el +569 si ya viene en el perfil para mostrar solo los 8 dígitos
    const savedPhone = profile?.telefono || ""
    const initialPhone = savedPhone.startsWith("+569") ? savedPhone.slice(4) : savedPhone

    // Valores locales
    const [nombre, setNombre] = useState(profile?.nombre || "")
    const [telefono, setTelefono] = useState(initialPhone)
    const [direccion, setDireccion] = useState(profile?.direccion || "")
    const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null)
    const [isUploading, setIsUploading] = useState(false)

    const supabase = createClient()

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Debes seleccionar una imagen.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${profile.id}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
            setAvatarUrl(data.publicUrl)
            toast.success("Foto subida correctamente. Dale a Guardar Cambios.")
        } catch (error: any) {
            toast.error("Error al subir imagen", { description: error.message })
        } finally {
            setIsUploading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append("nombre", nombre)
        formData.append("telefono", telefono ? `+569${telefono.trim()}` : "")
        formData.append("direccion", direccion)
        if (avatarUrl) {
            formData.append("avatar_url", avatarUrl)
        }

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

            {/* Cabecera Interactiva de Identidad (Avatar + Roles + Email) */}
            <div className="flex flex-col sm:flex-row gap-6 sm:items-center mb-8 pb-8 border-b border-wood-100">
                <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-3xl shrink-0 overflow-hidden border border-brand-100">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            profile?.nombre?.charAt(0).toUpperCase() || "?"
                        )}
                    </div>

                    {/* Botón de edición de avatar */}
                    {isEditing && (
                        <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                {isUploading ? 'Subiendo...' : 'Cambiar'}
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={isUploading}
                            />
                        </label>
                    )}
                </div>

                <div className="space-y-1.5 flex-1 p-2">
                    <h2 className="text-xl font-bold text-wood-900">{profile?.nombre || "Sin nombre"}</h2>

                    {/* Correo visible en readonly */}
                    <div className="mt-2 mb-4 max-w-sm">
                        <label className="text-xs font-bold text-wood-400 uppercase tracking-wider">Correo Vinculado</label>
                        <input
                            type="email"
                            disabled
                            value={userEmail || ""}
                            className="w-full mt-1 bg-gray-50/50 border border-gray-100 text-gray-500 px-3 py-2 rounded-xl text-sm font-medium outline-none"
                        />
                    </div>

                    {/* Badges de Roles */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            <UserIcon className="w-3.5 h-3.5" /> Cliente
                        </span>
                        {isAdmin && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                <ShieldCheck className="w-3.5 h-3.5" /> Administrador
                            </span>
                        )}
                        {isRepartidor && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                <ShieldCheck className="w-3.5 h-3.5" /> Repartidor
                            </span>
                        )}
                    </div>
                </div>
            </div>

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
                        Celular
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-wood-500 font-medium">+56 9</span>
                        </div>
                        <input
                            type="tel"
                            disabled={!isEditing}
                            value={telefono}
                            onChange={e => setTelefono(e.target.value)}
                            maxLength={8}
                            pattern="[0-9]{8}"
                            title="Ingresa 8 dígitos numéricos válidos"
                            placeholder="1234 5678"
                            className="w-full pl-16 pr-4 py-3 bg-wood-50/50 rounded-xl border border-wood-100 disabled:opacity-75 disabled:bg-gray-50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-wood-400 font-medium text-wood-900"
                        />
                    </div>
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
                                setTelefono(initialPhone)
                                setDireccion(profile?.direccion || "")
                                setAvatarUrl(profile?.avatar_url || null)
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
