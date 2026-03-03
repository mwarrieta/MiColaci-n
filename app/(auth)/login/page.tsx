'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { Button } from '@/components/ui/Button'
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
        <div className="relative min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
            {/* Imagen de fondo artesanal */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/images/login-bg.png"
                    alt="Cocina Casera"
                    fill
                    className="object-cover object-center"
                    priority
                />
                {/* Overlay oscurecedor para legibilidad */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 border border-white/20 p-8 sm:p-10">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/Logo_La_Cocina_de_Elvira.jpeg"
                            alt="La Cocina de Elvira"
                            width={100}
                            height={100}
                            className="rounded-full shadow-lg border-2 border-brand-500/50 object-cover"
                        />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-wood-900 tracking-tight">La Cocina de Elvira</h1>
                    <p className="text-wood-600 mt-2 text-sm font-medium">
                        {isRegistro ? 'Crea tu cuenta para empezar a pedir' : 'Inicia sesión para ver el menú'}
                    </p>
                </div>

                <form action={handleSubmit} className="space-y-5">
                    {isRegistro && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-wood-700 mb-1.5 ml-1">
                                    Nombre completo
                                </label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 bg-brand-50/30 rounded-xl border border-wood-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-wood-500/50"
                                    placeholder="Tu nombre"
                                />
                            </div>
                            <div>
                                <label htmlFor="telefono" className="block text-sm font-medium text-wood-700 mb-1.5 ml-1">
                                    Celular
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-wood-500 font-medium">+56 9</span>
                                    </div>
                                    <input
                                        id="telefono"
                                        name="telefono"
                                        type="tel"
                                        required
                                        maxLength={8}
                                        pattern="[0-9]{8}"
                                        title="Ingresa 8 dígitos numéricos válidos"
                                        className="w-full pl-16 pr-4 py-3 bg-brand-50/30 rounded-xl border border-wood-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-wood-500/50"
                                        placeholder="1234 5678"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="direccion" className="block text-sm font-medium text-wood-700 mb-1.5 ml-1">
                                    Dirección de entrega frecuente
                                </label>
                                <input
                                    id="direccion"
                                    name="direccion"
                                    type="text"
                                    className="w-full px-4 py-3 bg-brand-50/30 rounded-xl border border-wood-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-wood-500/50"
                                    placeholder="Ej: Arauco 234, Oficina 4..."
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-wood-700 mb-1.5 ml-1">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-brand-50/30 rounded-xl border border-wood-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-wood-500/50"
                            placeholder="tu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-wood-700 mb-1.5 ml-1">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-brand-50/30 rounded-xl border border-wood-100 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-wood-500/50"
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

                <div className="mt-8 pt-6 border-t border-wood-100 text-center">
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
