'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { Button } from '@/components/ui/Button'
import { Utensils } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
    const [isRegistro, setIsRegistro] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        const result = isRegistro ? await signup(formData) : await login(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-brand-500/5 border border-gray-100 p-8 sm:p-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/Logo_La_Cocina_de_Elvira.jpeg"
                            alt="La Cocina de Elvira"
                            width={80}
                            height={80}
                            className="rounded-full shadow-lg border-2 border-brand-500 object-cover"
                        />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">La Cocina de Elvira</h1>
                    <p className="text-gray-500 mt-2 text-sm">
                        {isRegistro ? 'Crea tu cuenta para empezar a pedir' : 'Inicia sesión para ver el menú'}
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-5">
                    {isRegistro && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                                    Nombre completo
                                </label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                                    Celular
                                </label>
                                <input
                                    id="telefono"
                                    name="telefono"
                                    type="tel"
                                    required
                                    className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="+56 9..."
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-gray-50/50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-gray-400"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm font-medium rounded-xl p-3 border border-red-100 flex items-start">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 text-[15px] mt-2"
                    >
                        {loading ? 'Cargando...' : isRegistro ? 'Crear cuenta' : 'Ingresar'}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegistro(!isRegistro)
                            setError(null)
                        }}
                        className="text-brand-600 hover:text-brand-700 text-sm font-semibold transition"
                    >
                        {isRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo por aquí? Regístrate'}
                    </button>
                </div>
            </div>
        </div>
    )
}
