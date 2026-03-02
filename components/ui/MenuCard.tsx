"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "./Button"

interface MenuCardProps {
    id: string
    titulo: string
    descripcion: string
    precio: number
    imageUrl?: string
    disponible?: boolean
    onAdd?: (id: string) => void
}

export function MenuCard({
    id,
    titulo,
    descripcion,
    precio,
    imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    disponible = true,
    onAdd,
}: MenuCardProps) {
    return (
        <div className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-wood-100 shadow-md shadow-wood-500/8 hover:shadow-xl hover:shadow-wood-500/15 hover:-translate-y-1.5 transition-all duration-300">
            {/* Imagen Header */}
            <div className="relative h-52 w-full overflow-hidden bg-brand-50">
                <Image
                    src={imageUrl}
                    alt={titulo}
                    fill
                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${!disponible && "grayscale opacity-80"}`}
                />
                {!disponible && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-black/75 text-white px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide">
                            AGOTADO
                        </span>
                    </div>
                )}
            </div>

            {/* Contenido */}
            <div className="flex flex-col flex-1 p-5 sm:p-6">
                <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="font-heading text-xl font-bold text-wood-700 leading-tight mt-1">
                        {titulo}
                    </h3>
                    <span className="font-heading font-bold text-brand-600 text-lg whitespace-nowrap bg-accent-400/15 px-3 py-1 rounded-xl border border-accent-400/20">
                        ${precio.toLocaleString('es-CL')}
                    </span>
                </div>

                <p className="text-wood-500 text-sm line-clamp-2 mb-5 flex-1 font-medium">
                    {descripcion}
                </p>

                <Button
                    variant="primary"
                    className="w-full mt-auto"
                    disabled={!disponible}
                    onClick={() => onAdd?.(id)}
                >
                    {disponible ? "🛒 Agregar" : "No disponible"}
                </Button>
            </div>
        </div>
    )
}
