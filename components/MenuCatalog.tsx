"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MenuCard } from "@/components/ui/MenuCard"

interface ItemMenu {
    id: string
    nombre: string
    descripcion: string | null
    precio: number
    imagen_url: string | null
    activo: boolean
}

interface CategoriaConItems {
    id: string
    nombre: string
    descripcion: string | null
    items: ItemMenu[]
}

interface MenuCatalogProps {
    categorias: CategoriaConItems[]
    isLoggedIn: boolean
}

export function MenuCatalog({ categorias, isLoggedIn }: MenuCatalogProps) {
    const router = useRouter()

    const handleAdd = (id: string, nombre: string) => {
        if (!isLoggedIn) {
            toast.error("Inicia sesión para pedir", {
                description: "Necesitas una cuenta para agregar al carrito.",
                action: {
                    label: "Ingresar",
                    onClick: () => router.push("/login"),
                },
            })
            return
        }

        // Aquí irá la lógica de agregar al carrito en la Fase 5
        toast.success("Agregado al pedido", {
            description: `Se añadió "${nombre}" a tu selección.`,
        })
    }

    return (
        <div className="space-y-12">
            {categorias.map((categoria) => (
                <section key={categoria.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold font-heading text-gray-900">{categoria.nombre}</h3>
                        {categoria.descripcion && (
                            <p className="text-gray-500 mt-1">{categoria.descripcion}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoria.items.map((item) => (
                            <MenuCard
                                key={item.id}
                                id={item.id}
                                titulo={item.nombre}
                                descripcion={item.descripcion || ''}
                                precio={item.precio}
                                imageUrl={item.imagen_url || undefined}
                                disponible={item.activo}
                                onAdd={() => handleAdd(item.id, item.nombre)}
                            />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}
