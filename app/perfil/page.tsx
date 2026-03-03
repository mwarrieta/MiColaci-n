import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { ShieldCheck, User as UserIcon, LogOut, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { logout } from "@/app/(auth)/login/actions"
import { PerfilForm } from "./PerfilForm"

export default async function PerfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Obtener datos del perfil extendido
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    const isAdmin = profile?.rol === "admin"
    const isRepartidor = profile?.rol === "repartidor"

    return (
        <main className="min-h-screen bg-wood-50/30 flex flex-col">

            <div className="flex-grow pt-28 pb-16 px-4">
                <div className="max-w-2xl mx-auto space-y-8">

                    {/* Header y Logout */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/menu" className="p-2 -ml-2 hover:bg-wood-100 rounded-full transition-colors text-wood-500">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-2xl font-heading font-bold text-wood-900">Mi Cuenta</h1>
                        </div>

                        <form action={logout}>
                            <button className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Cerrar Sesión</span>
                            </button>
                        </form>
                    </div>

                    {/* Tarjeta de Información e Identidad */}
                    <div className="bg-white rounded-3xl shadow-sm border border-wood-100 p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row gap-6 sm:items-center mb-8 pb-8 border-b border-wood-100">
                            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-3xl shrink-0">
                                {profile?.nombre?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="space-y-1.5 flex-1 p-2">
                                <h2 className="text-xl font-bold text-wood-900">{profile?.nombre || "Sin nombre"}</h2>
                                <p className="text-wood-500 text-sm hidden sm:block">{user.email}</p>

                                {/* Badges de Roles */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                        <UserIcon className="w-3.5 h-3.5" />
                                        Cliente
                                    </span>
                                    {isAdmin && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Administrador
                                        </span>
                                    )}
                                    {isRepartidor && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            Repartidor
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Formulario Interactivo Client-Side */}
                        <PerfilForm profile={profile} />

                    </div>
                </div>
            </div>
        </main>
    )
}
