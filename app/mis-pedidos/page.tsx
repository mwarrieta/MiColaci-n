import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Clock, MapPin, Receipt, ShoppingBag } from "lucide-react"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { BottomNav } from "@/components/BottomNav"

export default async function MisPedidosPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Obtener pedidos del usuario ordenados por fecha de creación descendente
    const { data: pedidos } = await supabase
        .from("pedidos")
        .select("*, detalle_pedidos(*, items_menu(nombre, imagen_url))")
        .eq("cliente_id", user.id)
        .order("created_at", { ascending: false })

    const { data: profile } = await supabase.from('profiles').select('rol').eq('id', user.id).single()
    const userRole = profile?.rol || 'cliente'

    return (
        <div className="min-h-screen bg-gray-50 pb-32 sm:pb-0 sm:pt-20">
            <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center sticky top-0 z-50 shadow-sm sm:hidden">
                <Link href="/" className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Volver</span>
                </Link>
                <div className="flex-1 text-center">
                    <h1 className="text-xl font-heading font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">
                        Mis Pedidos
                    </h1>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                {(!pedidos || pedidos.length === 0) ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Receipt className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-bold font-heading text-gray-900 mb-2">Sin historial de pedidos</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Aún no has realizado ninguna compra en La Cocina de Elvira.
                        </p>
                        <Link href="/" className="inline-block bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-brand-500/25 shadow-md">
                            Ver Menú de Hoy
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pedidos.map((pedido) => (
                            <div key={pedido.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Header del Pedido */}
                                <div className="p-4 sm:p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-gray-900">
                                                Pedido #{String(pedido.numero_pedido).padStart(5, '0')}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                • {new Date(pedido.created_at).toLocaleDateString("es-CL", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                            {pedido.tipo_entrega === 'delivery' ? (
                                                <><MapPin className="w-4 h-4 text-brand-500" /> Delivery: {pedido.direccion_entrega}</>
                                            ) : (
                                                <><ShoppingBag className="w-4 h-4 text-brand-500" /> Retiro en Local</>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <span className="font-bold text-lg text-brand-600">
                                            ${pedido.total.toLocaleString("es-CL")}
                                        </span>
                                        <StatusBadge status={pedido.estado as any} />
                                    </div>
                                </div>

                                {/* Items del Pedido */}
                                <div className="p-4 sm:p-5">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Detalles</h4>
                                    <ul className="space-y-3">
                                        {pedido.detalle_pedidos.map((detalle: any) => (
                                            <li key={detalle.id} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{detalle.cantidad}x</span>
                                                    <span className="text-gray-600">{detalle.items_menu?.nombre || 'Plato'}</span>
                                                </div>
                                                <span className="text-gray-500">${detalle.subtotal.toLocaleString("es-CL")}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {pedido.notas && (
                                        <div className="mt-4 pt-4 border-t border-dashed border-gray-100">
                                            <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">Notas:</span> {pedido.notas}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {pedido.metodo_pago === 'transferencia' && (pedido.estado === 'pendiente_pago' || pedido.estado === 'pago_en_revision') && (
                                    <div className="bg-amber-50 px-4 py-3 border-t border-amber-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-amber-800 text-sm">
                                            <Clock className="w-4 h-4" /> <span>Esperando comprobante de pago</span>
                                        </div>
                                        <Link href={`/checkout/success?id=${pedido.id}`} className="text-xs font-bold bg-amber-200 text-amber-900 px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">
                                            Ver Instrucciones
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Nav */}
            <BottomNav userRole={userRole} isLoggedIn={!!user} />
        </div>
    )
}
