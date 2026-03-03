"use client"

import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, CheckCircle2, ChevronRight, MapPin, Store, CreditCard, Clock, BookOpen } from "lucide-react"
import Link from "next/link"
import { processOrder } from "./actions"
import { toast } from "sonner"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

export default function CheckoutPage() {
    const router = useRouter()
    const { items, getTotal, clearCart } = useCartStore()
    const [isPending, startTransition] = useTransition()
    const supabase = createClient()

    const [sysConfig, setSysConfig] = useState({ costoDelivery: 1500, limiteFiado: 3, deudas: 0, loading: true })

    const [tipoEntrega, setTipoEntrega] = useState<"delivery" | "retiro">("delivery")
    const subtotal = getTotal()
    const costoDelivery = tipoEntrega === "delivery" ? sysConfig.costoDelivery : 0
    const total = subtotal + costoDelivery

    // Estado para capturar dirección, hora solicitada y notas
    const [direccion, setDireccion] = useState<string>("")
    const [horaSolicitada, setHoraSolicitada] = useState<string>("")
    const [notas, setNotas] = useState<string>("")

    // Evita entrar al checkout con el carrito vacío
    useEffect(() => {
        if (items.length === 0) {
            router.push("/carrito")
        }
    }, [items.length, router])

    // Cargar configuraciones de Delivery y Fiado
    useEffect(() => {
        async function loadConfig() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Costo global delivery
            const { data: conf } = await supabase.from('configuraciones').select('valor').eq('clave', 'costo_delivery').single()

            // Perfil para el límite de fiado individual
            const { data: prof } = await supabase.from('profiles').select('limite_fiado').eq('id', user.id).single()

            // Conteo de deudas activas (pedidos sin pagar)
            const { count: deudas } = await supabase.from('pedidos')
                .select('*', { count: 'exact', head: true })
                .eq('cliente_id', user.id)
                .in('estado', ['pendiente_pago', 'pago_en_revision'])

            setSysConfig({
                costoDelivery: conf?.valor ? parseInt(conf.valor) : 1500,
                limiteFiado: prof?.limite_fiado ?? 3,
                deudas: deudas || 0,
                loading: false
            })
        }
        loadConfig()
    }, [supabase])

    // Modales de confirmación
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        // Validación de hora
        if (!horaSolicitada) {
            toast.error("Por favor indícanos a qué hora deseas tu pedido.")
            return
        }

        // Validación de dirección en delivery
        if (tipoEntrega === 'delivery' && !direccion.trim()) {
            toast.error("Para Delivery, debes indicar una dirección de entrega válida.")
            return
        }

        // Anexar los metadatos dinámicos del carrito local a la acción
        const cartItems = items.map(item => ({
            id: item.id,
            precio: item.precio,
            cantidad: item.cantidad
        }))

        // Anexar los nuevos campos al formData
        formData.append('hora_solicitada', horaSolicitada)
        formData.append('direccion_entrega', direccion)
        formData.append('notas', notas)


        setFormDataToSubmit(formData)
        setShowConfirmModal(true)
    }

    const ejecutarCheckoutReal = () => {
        if (!formDataToSubmit) return
        startTransition(async () => {
            const cartItems = items.map(item => ({ id: item.id, precio: item.precio, cantidad: item.cantidad }))
            const result = await processOrder(formDataToSubmit, cartItems)

            if (result?.error) {
                toast.error("Error al procesar", { description: result.error })
                setShowConfirmModal(false)
            } else if (result?.rawUrl) {
                if (typeof window !== "undefined") {
                    window.location.href = result.rawUrl
                }
                clearCart()
            } else {
                clearCart() // Server action redirige
            }
        })
    }

    if (items.length === 0 || sysConfig.loading) return <div className="min-h-screen bg-gray-50 animate-pulse pb-32" />

    const puedeFiar = sysConfig.deudas < sysConfig.limiteFiado

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <header className="relative border-b border-white/20 px-4 py-8 sm:py-10 flex items-center shadow-xl overflow-hidden -mt-1">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/prep-bg.png"
                        alt="Preparando tu pedido casero"
                        fill
                        className="object-cover object-center"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 backdrop-blur-[1px]" />
                </div>
                <div className="relative z-10 w-full max-w-3xl mx-auto flex items-center">
                    <Link href="/carrito" className="text-white/90 hover:text-white transition flex items-center gap-2 drop-shadow-md bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold text-sm">Volver</span>
                    </Link>
                    <div className="flex-1 text-center">
                        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white absolute left-1/2 -translate-x-1/2 drop-shadow-lg shadow-black tracking-wide">
                            Finalizar Pedido
                        </h1>
                    </div>
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

                        {/* Input de Hora Solicitada */}
                        <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-semibold text-gray-700">¿A qué hora deseas tu pedido? <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                </div>
                                <select
                                    value={horaSolicitada}
                                    onChange={(e) => setHoraSolicitada(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none bg-white"
                                >
                                    <option value="" disabled>Selecciona un horario disponible</option>
                                    <option value="12:00">12:00 hrs</option>
                                    <option value="12:30">12:30 hrs</option>
                                    <option value="13:00">13:00 hrs</option>
                                    <option value="13:30">13:30 hrs</option>
                                    <option value="14:00">14:00 hrs</option>
                                    <option value="14:30">14:30 hrs</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 ml-1">Para organizar nuestro tiempo, indícanos a qué hora vienes o te lo enviamos.</p>
                        </div>

                        {tipoEntrega === 'delivery' && (
                            <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-semibold text-gray-700">Tu dirección de entrega <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="direccion"
                                    required
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    placeholder="Ej: Oficina central, 3er piso"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                />
                            </div>
                        )}

                        {/* Notas movidas a Entrega */}
                        <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Notas para el local (opcional)</label>
                            <textarea
                                name="notas"
                                value={notas}
                                onChange={(e) => setNotas(e.target.value)}
                                rows={2}
                                placeholder="Ej: Sin sal, tenedor por favor..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none transition-all"
                            />
                        </div>
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

                            {/* Anotar en Libreta / Fiado */}
                            {puedeFiar ? (
                                <label className="flex items-center gap-3 p-4 border border-brand-200 bg-brand-50/20 rounded-xl cursor-pointer hover:bg-brand-50 transition-colors relative overflow-hidden">
                                    <input type="radio" name="metodoPago" value="transferencia" className="w-4 h-4 text-brand-500" />
                                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-4 h-4 text-brand-600" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block font-bold text-brand-800">Anotar en la Libreta</span>
                                        <span className="block text-xs text-brand-600/80">Tu límite de confianza: {sysConfig.limiteFiado - sysConfig.deudas} pedidos disponibles.</span>
                                    </div>
                                </label>
                            ) : (
                                <div className="flex items-center gap-3 p-4 border border-red-100 bg-red-50/50 rounded-xl opacity-75">
                                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-4 h-4 text-red-500 opacity-50" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block font-bold text-gray-500 line-through decoration-red-500/50">Anotar en la Libreta</span>
                                        <span className="block text-xs text-red-600">Alcanzaste tu límite de pedidos pendientes de pago ({sysConfig.deudas}/{sysConfig.limiteFiado}).</span>
                                    </div>
                                </div>
                            )}

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
                            <Button type="submit" variant="primary" disabled={isPending || items.length === 0} className="w-full py-4 text-lg font-bold shadow-brand-500/25">
                                {isPending ? "Procesando..." : "Confirmar Pedido"}
                                {!isPending && <ChevronRight className="w-5 h-5 ml-1" />}
                            </Button>
                        </div>
                    </div>
                </form>
            </main>

            {/* Modal de Confirmación de Compra Local */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">
                                ¿Gusto confirmado?
                            </h3>
                            <p className="text-sm text-gray-600 mb-6 font-medium">
                                Revisamos todo. El valor total de tu orden es de <span className="font-bold text-gray-900">${total.toLocaleString('es-CL')}</span>.
                                ¿Listo para enviarlo al Mesón de Tía Elvira?
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="primary"
                                    onClick={ejecutarCheckoutReal}
                                    disabled={isPending}
                                    className="w-full py-3.5 text-base font-bold shadow-md"
                                >
                                    {isPending ? 'Evíando...' : 'Sí, confirmar y Pagar'}
                                </Button>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    disabled={isPending}
                                    className="w-full py-3 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    No, volver a revisar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}
