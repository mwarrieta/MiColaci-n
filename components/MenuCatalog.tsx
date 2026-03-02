"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { MenuCard } from "@/components/ui/MenuCard"
import { useCartStore } from "@/store/cartStore"

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
    const addItem = useCartStore((state) => state.addItem)

    const handleAdd = (item: ItemMenu) => {
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

        addItem({
            id: item.id,
            nombre: item.nombre,
            precio: item.precio,
            imagen_url: item.imagen_url
        })

        toast.success("Agregado al pedido", {
            description: `Se añadió "${item.nombre}" a tu selección.`,
            action: {
                label: "Ver Carrito",
                onClick: () => router.push("/carrito"),
            }
        })
    }

    return (
        <div className="space-y-12">
            {categorias.map((categoria, index) => (
                <motion.section
                    key={categoria.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold font-heading text-wood-700">{categoria.nombre}</h3>
                        {categoria.descripcion && (
                            <p className="text-wood-500 mt-1 font-medium">{categoria.descripcion}</p>
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
                                onAdd={() => handleAdd(item)}
                            />
                        ))}
                    </div>
                </motion.section>
            ))}
        </div>
    )
}
