import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { CheckCircle, MessageCircle } from "lucide-react"

export default async function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ id?: string }>
}) {
    const { id } = await searchParams

    if (!id) redirect("/")

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Obtener el pedido para validar que pertenece al usuario
    const { data: pedido } = await supabase
        .from("pedidos")
        .select("*, detalle_pedidos(*, items_menu(nombre))")
        .eq("id", id)
        .single()

    if (!pedido || pedido.cliente_id !== user.id) {
        redirect("/")
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-12">
            <main className="flex-1 max-w-lg w-full mx-auto px-4 pb-20">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>

                    <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">¡Pedido Recibido!</h1>
                    <p className="text-gray-500 mb-6">Hemos registrado tu orden <span className="font-semibold text-gray-900">#{String(pedido.numero_pedido).padStart(5, '0')}</span></p>

                    {/* Instrucciones de Pago */}
                    {pedido.metodo_pago === 'transferencia' && (() => {
                        // Construir el mensaje de WhatsApp
                        const itemsTxt = pedido.detalle_pedidos.map((d: any) => `▪️ ${d.cantidad}x ${d.items_menu?.nombre || 'Item'}`).join('%0A')

                        // Formatear dirección
                        let direccionTxt = ""
                        if (pedido.tipo_entrega === "retiro") {
                            direccionTxt = "🏢 Retiro en Local"
                        } else {
                            direccionTxt = `📍 Delivery a: ${pedido.direccion_entrega || 'Sin dirección'}`
                        }

                        // Agregar notas si hay
                        if (pedido.notas) {
                            direccionTxt += ` (Nota: ${pedido.notas})`
                        }

                        const mensajeWhatsApp = `¡Hola! Envío el comprobante de mi pedido #${String(pedido.numero_pedido).padStart(5, '0')} 🧾%0A%0A*DATOS DEL CLIENTE*%0A👤 ${user.user_metadata?.full_name || 'Cliente'}%0A${direccionTxt}%0A%0A*RESUMEN DEL PEDIDO*%0A${itemsTxt}%0A----------------------%0A💰 *TOTAL PAGADO: $${pedido.total.toLocaleString("es-CL")}*%0A%0AAdjunto mi comprobante de transferencia. ¡Gracias!`;
                        const urlWhatsApp = `https://wa.me/56972508272?text=${mensajeWhatsApp}`;

                        return (
                            <div className="bg-brand-50 rounded-2xl p-6 text-left mb-6 border border-brand-100">
                                <h3 className="font-bold text-brand-900 mb-2">Para confirmar tu pedido:</h3>
                                <p className="text-sm text-brand-800 mb-4">
                                    Transfiere el total exacto a la siguiente cuenta y envíanos el comprobante por WhatsApp.
                                </p>

                                <div className="space-y-2 text-sm bg-white p-4 rounded-xl shadow-sm mb-4 border border-brand-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Banco:</span>
                                        <span className="font-medium text-gray-900">Banco Estado</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Tipo:</span>
                                        <span className="font-medium text-gray-900">Cuenta RUT</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">RUT:</span>
                                        <span className="font-medium text-gray-900">12.345.678-9</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Monto:</span>
                                        <span className="font-bold text-brand-600 text-lg">${pedido.total.toLocaleString("es-CL")}</span>
                                    </div>
                                </div>

                                <a
                                    href={urlWhatsApp}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
                                >
                                    <MessageCircle className="w-5 h-5" /> Enviar Comprobante
                                </a>
                            </div>
                        )
                    })()}

                    <div className="space-y-3">
                        <Link href="/mis-pedidos" className="block w-full text-center py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                            Ver estado de mi pedido
                        </Link>
                        <Link href="/" className="block w-full text-center py-3 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
