import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    nombre: string
    precio: number
    cantidad: number
    imagen_url?: string | null
}

interface CartState {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'cantidad'>) => void
    removeItem: (id: string) => void
    decreaseItem: (id: string) => void
    clearCart: () => void
    getTotal: () => number
    getTotalItems: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => {
                set((state) => {
                    const existingItem = state.items.find((i) => i.id === newItem.id)
                    if (existingItem) {
                        return {
                            items: state.items.map((i) =>
                                i.id === newItem.id ? { ...i, cantidad: i.cantidad + 1 } : i
                            ),
                        }
                    }
                    return { items: [...state.items, { ...newItem, cantidad: 1 }] }
                })
            },
            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id),
                }))
            },
            decreaseItem: (id) => {
                set((state) => {
                    const existingItem = state.items.find((i) => i.id === id)
                    if (existingItem && existingItem.cantidad > 1) {
                        return {
                            items: state.items.map((i) =>
                                i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i
                            ),
                        }
                    } else {
                        return {
                            items: state.items.filter((i) => i.id !== id),
                        }
                    }
                })
            },
            clearCart: () => set({ items: [] }),
            getTotal: () => {
                return get().items.reduce((total, item) => total + item.precio * item.cantidad, 0)
            },
            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.cantidad, 0)
            },
        }),
        {
            name: 'cart-storage',
        }
    )
)
