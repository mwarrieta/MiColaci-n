"use client"

import { useCartStore } from "@/store/cartStore"
import { Button } from "@/components/ui/Button"
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function CarritoPage() {
    const { items, addItem, decreaseItem, removeItem, getTotal, clearCart } = useCartStore()

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center sticky top-0 z-50">
                    <Link href="/" className="text-gray-500 hover:text-gray-900 transition flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Volver</span>
                    </Link>
                </header>
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold font-heading text-gray-900 mb-2">Tu carrito está vacío</h2>
                    <p className="text-gray-500 mb-8 max-w-sm">
                        Aún no has agregado ninguna colación a tu pedido. Revisa el menú del día.
                    </p>
                    <Link href="/">
                        <Button variant="primary" className="px-8">
                            Ver Menú
                        </Button>
                    </Link>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-gray-500 hover:text-gray-900 transition">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-heading font-bold text-gray-900">Tu Pedido</h1>
                </div>
                <button
                    onClick={clearCart}
                    className="text-sm font-medium text-red-500 hover:text-red-700 transition"
                >
                    Vaciar
                </button>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 sm:p-4 mb-6">
                    <ul className="divide-y divide-gray-100">
                        {items.map((item) => (
                            <li key={item.id} className="py-4 flex items-center gap-4">
                                {/* Imagen del item miniatura */}
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                                    {item.imagen_url ? (
                                        <Image src={item.imagen_url} alt={item.nombre} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                {/* Info del Item */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate pr-4">{item.nombre}</h3>
                                    <p className="text-brand-600 font-semibold text-sm mt-1">
                                        ${item.precio.toLocaleString("es-CL")}
                                    </p>
                                </div>

                                {/* Controles de Cantidad */}
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => decreaseItem(item.id)}
                                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-semibold text-gray-900 select-none">
                                            {item.cantidad}
                                        </span>
                                        <button
                                            onClick={() => addItem(item)}
                                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-xs text-red-500 font-medium hover:text-red-700 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" /> Eliminar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resumen */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div className="flex justify-between items-center text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">${getTotal().toLocaleString("es-CL")}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-200 pt-4 flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total a pagar</span>
                        <span className="text-2xl font-bold font-heading text-brand-600">
                            ${getTotal().toLocaleString("es-CL")}
                        </span>
                    </div>
                </div>
            </main>

            {/* Floating Checkout Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <div className="hidden sm:block flex-1">
                        <p className="text-sm text-gray-500 font-medium">Total ({items.reduce((acc, i) => acc + i.cantidad, 0)} colaciones)</p>
                        <p className="text-xl font-bold text-gray-900">${getTotal().toLocaleString("es-CL")}</p>
                    </div>
                    <Link href="/checkout" className="flex-1 sm:flex-none">
                        <Button variant="primary" className="w-full sm:w-auto px-8 py-3.5 text-base shadow-brand-500/25">
                            Proceder al Checkout
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
