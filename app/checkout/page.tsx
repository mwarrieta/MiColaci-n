"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, CheckCircle2, ChevronRight, MapPin, Store, CreditCard } from "lucide-react"
import Link from "next/link"
import { processOrder } from "./actions"
import { toast } from "sonner"

export default function CheckoutPage() {
    const router = useRouter()
    const { items, getTotal, clearCart } = useCartStore()
    const [isPending, startTransition] = useTransition()

    const [tipoEntrega, setTipoEntrega] = useState<"delivery" | "retiro">("delivery")
    const subtotal = getTotal()
    const costoDelivery = tipoEntrega === "delivery" ? 1500 : 0
    const total = subtotal + costoDelivery

    // Evita entrar al checkout con el carrito vacío
    if (items.length === 0) {
        router.push("/carrito")
        return null
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        // Anexar los metadatos dinámicos del carrito local a la acción
        const cartItems = items.map(item => ({
            id: item.id,
            precio: item.precio,
            cantidad: item.cantidad
        }))

        startTransition(async () => {
            // Las Server Actions devuelven objeto con error si fallan u ocurre una redirección si triunfan por transferencia
            const result = await processOrder(formData, cartItems)

            if (result?.error) {
                toast.error("Error al procesar", { description: result.error })
            } else if (result?.rawUrl) {
                clearCart()
                // Redirigir la ventana a MercadoPago
                window.location.href = result.rawUrl
            } else {
                clearCart()
                // El enrutamiento a success lo hace la Server Action via 'redirect'
            }
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center sticky top-0 z-50 shadow-sm">
                <Link href="/carrito" className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Volver</span>
                </Link>
                <div className="flex-1 text-center">
                    <h1 className="text-xl font-heading font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
                        Finalizar Pedido
                    </h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* 1. Tipo de Entrega */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold font-heading text-gray-900 mb-4">1. Entrega</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <label
                                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${tipoEntrega === 'delivery' ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                            >
                                <input type="radio" name="tipoEntrega" value="delivery" className="sr-only" checked={tipoEntrega === 'delivery'} onChange={() => setTipoEntrega('delivery')} />
                                <MapPin className={`w-8 h-8 ${tipoEntrega === 'delivery' ? 'text-brand-500' : 'text-gray-400'}`} />
                                <span className={`font-semibold text-sm ${tipoEntrega === 'delivery' ? 'text-brand-700' : 'text-gray-600'}`}>Delivery</span>
                                {tipoEntrega === 'delivery' && <CheckCircle2 className="w-5 h-5 text-brand-500 absolute top-2 right-2" />}
                            </label>

                            <label
                                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${tipoEntrega === 'retiro' ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                            >
                                <input type="radio" name="tipoEntrega" value="retiro" className="sr-only" checked={tipoEntrega === 'retiro'} onChange={() => setTipoEntrega('retiro')} />
                                <Store className={`w-8 h-8 ${tipoEntrega === 'retiro' ? 'text-brand-500' : 'text-gray-400'}`} />
                                <span className={`font-semibold text-sm ${tipoEntrega === 'retiro' ? 'text-brand-700' : 'text-gray-600'}`}>Retiro en local</span>
                                {tipoEntrega === 'retiro' && <CheckCircle2 className="w-5 h-5 text-brand-500 absolute top-2 right-2" />}
                            </label>
                        </div>

                        {tipoEntrega === 'delivery' && (
                            <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-semibold text-gray-700">Dinos tu oficina o área de entrega</label>
                                <input
                                    type="text"
                                    name="direccion"
                                    required
                                    placeholder="Ej: Oficina central, 3er piso"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                />
                            </div>
                        )}
                    </section>

                    {/* 2. Pago */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold font-heading text-gray-900 mb-4">2. Método de Pago</h2>
                        <div className="space-y-4">

                            {/* Mercado Pago */}
                            <label className="flex items-center gap-3 p-4 border border-blue-500 bg-blue-50/50 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                                <input type="radio" name="metodoPago" value="mercadopago" defaultChecked className="w-4 h-4 text-brand-500" />
                                <div className="w-8 h-8 bg-[#009EE3] rounded-full flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="w-4 h-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <span className="block font-bold text-gray-900">Tarjeta o Mercado Pago</span>
                                    <span className="block text-xs text-gray-500">Serás redirigido de forma segura para pagar.</span>
                                </div>
                            </label>

                            {/* Transferencia */}
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <input type="radio" name="metodoPago" value="transferencia" className="w-4 h-4 text-brand-500" />
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Store className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1">
                                    <span className="block font-semibold text-gray-900">Transferencia Bancaria</span>
                                    <span className="block text-xs text-gray-500">Los datos aparecerán luego de confirmar.</span>
                                </div>
                            </label>

                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Notas para el local (opcional)</label>
                            <textarea
                                name="notas"
                                rows={2}
                                placeholder="Ej: Sin sal, tenedor por favor..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition-all"
                            />
                        </div>
                    </section>

                    {/* Resumen Final */}
                    <section className="bg-gray-100/50 rounded-2xl p-6">
                        <div className="space-y-3 text-sm text-gray-600 mb-4">
                            <div className="flex justify-between">
                                <span>Subtotal ({items.reduce((acc, i) => acc + i.cantidad, 0)} items)</span>
                                <span>${subtotal.toLocaleString("es-CL")}</span>
                            </div>
                            {tipoEntrega === 'delivery' && (
                                <div className="flex justify-between text-brand-600">
                                    <span>Costo de Delivery</span>
                                    <span>+${costoDelivery.toLocaleString("es-CL")}</span>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Total</span>
                            <span className="text-2xl font-bold font-heading text-brand-600">
                                ${total.toLocaleString("es-CL")}
                            </span>
                        </div>
                    </section>

                    {/* Floater CTA */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
                        <div className="max-w-3xl mx-auto">
                            <Button type="submit" variant="primary" disabled={isPending} className="w-full py-4 text-lg font-bold shadow-brand-500/25">
                                {isPending ? "Procesando..." : "Confirmar Pedido"}
                                {!isPending && <ChevronRight className="w-5 h-5 ml-1" />}
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    )
}
