"use client"

import { useTransition } from "react"
import { MapPin, Phone, MessageCircle, Clock, CheckCircle2, ChevronRight, Navigation } from "lucide-react"
import { marcarEnCamino, marcarEntregado } from "./actions"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Pedido {
    id: string
    numero_pedido: number
    estado: string
    tipo_entrega: string
    direccion_envio: string | null
    telefono_contacto: string | null
    notas: string | null
    total: number
    created_at: string
}

export function PedidoDeliveryCard({ pedido }: { pedido: Pedido }) {
    const [isPending, startTransition] = useTransition()

    // Acción dependiendo del estado
    const handleAction = () => {
        startTransition(async () => {
            let res;
            if (pedido.estado === "en_preparacion") {
                res = await marcarEnCamino(pedido.id)
            } else if (pedido.estado === "en_delivery") {
                res = await marcarEntregado(pedido.id)
            }

            if (res?.error) {
                toast.error("Error al actualizar", { description: res.error })
            } else {
                toast.success(
                    pedido.estado === "en_preparacion"
                        ? "Pedido marcado como EN CAMINO"
                        : "Pedido marcado como ENTREGADO"
                )
            }
        })
    }

    const isPreparando = pedido.estado === "en_preparacion"

    // Limpiar el teléfono para el link de WhatsApp (quitar +, espacios)
    const cleanPhone = pedido.telefono_contacto?.replace(/[^0-9]/g, "") || ""

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-4">
            {/* Cabecera Tarjeta */}
            <div className={`px-5 py-4 border-b ${isPreparando ? 'bg-amber-50/50 border-amber-100/50' : 'bg-brand-50/50 border-brand-100/50'} flex items-center justify-between`}>
                <div>
                    <span className="font-heading font-bold text-gray-900 text-lg">
                        #{String(pedido.numero_pedido).padStart(5, "0")}
                    </span>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                        {format(new Date(pedido.created_at), "HH:mm", { locale: es })}
                    </p>
                </div>
                <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold leading-none
            ${isPreparando ? 'bg-amber-100 text-amber-700' : 'bg-brand-100 text-brand-700'}`}>
                        {isPreparando ? (
                            <><Clock className="w-3.5 h-3.5" /> Recoger</>
                        ) : (
                            <><Navigation className="w-3.5 h-3.5" /> En Tránsito</>
                        )}
                    </span>
                </div>
            </div>

            {/* Cuerpo Tarjeta */}
            <div className="p-5 space-y-4">

                {/* Dirección */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl mt-0.5">
                        <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Dirección de Entrega</p>
                        <p className="font-semibold text-gray-900 leading-snug">
                            {pedido.tipo_entrega === "retiro"
                                ? "Retiro en Local"
                                : (pedido.direccion_envio || "Sin dirección especificada")}
                        </p>
                    </div>
                </div>

                {/* Contacto */}
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl mt-0.5">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Contacto</p>
                        <p className="font-semibold text-gray-900 leading-snug">
                            {pedido.telefono_contacto || "Sin teléfono"}
                        </p>
                    </div>
                    {pedido.telefono_contacto && (
                        <div className="flex gap-2">
                            <a
                                href={`tel:${pedido.telefono_contacto}`}
                                className="p-2.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                            <a
                                href={`https://wa.me/${cleanPhone}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Notas (si hay) */}
                {pedido.notas && (
                    <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-800">
                        <span className="font-bold flex items-center gap-1.5 mb-1">
                            <MessageCircle className="w-4 h-4" /> Nota del Cliente:
                        </span>
                        <p className="leading-relaxed">{pedido.notas}</p>
                    </div>
                )}

            </div>

            {/* Botón de Acción Principal */}
            <div className="p-5 pt-0">
                <button
                    onClick={handleAction}
                    disabled={isPending}
                    className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isPending
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isPreparando
                            ? "bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-200"
                            : "bg-brand-500 text-white hover:bg-brand-600 shadow-xl shadow-brand-200"
                        }`}
                >
                    {isPending ? (
                        "Actualizando..."
                    ) : isPreparando ? (
                        <><Navigation className="w-5 h-5" /> Iniciar Ruta de Entrega</>
                    ) : (
                        <><CheckCircle2 className="w-5 h-5" /> Confirmar Entrega</>
                    )}
                </button>
            </div>

        </div>
    )
}

function UserIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
