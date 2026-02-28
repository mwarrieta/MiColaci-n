"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MercadoPagoConfig, Preference } from "mercadopago"

// Configurar cliente MercadoPago con el Access Token
const mpClient = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' })

export async function processOrder(formData: FormData, cartItems: { id: string, precio: number, cantidad: number, nombre?: string }[]) {
    const supabase = await createClient()

    // 1. Validar el usuario
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("No autorizado")
    }

    // 2. Extraer datos del formulario
    const tipoEntrega = formData.get("tipoEntrega") as "retiro" | "delivery"
    const metodoPago = formData.get("metodoPago") as "transferencia" | "mercadopago" | "efectivo"
    const direccion = formData.get("direccion") as string
    const notas = formData.get("notas") as string

    // Validación básica
    if (tipoEntrega === 'delivery' && !direccion) {
        return { error: 'Debes proporcionar una dirección de entrega' }
    }

    if (metodoPago === 'mercadopago' && !process.env.MP_ACCESS_TOKEN) {
        return { error: 'Mercado Pago no está configurado en el servidor.' }
    }

    // 3. Totales (Server Side)
    const subtotal = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
    const costoDelivery = tipoEntrega === 'delivery' ? 1500 : 0
    const total = subtotal + costoDelivery

    // 4. Inserción DB
    const { data: nuevoPedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
            cliente_id: user.id,
            estado: 'pendiente',
            tipo_entrega: tipoEntrega,
            direccion_entrega: direccion || null,
            metodo_pago: metodoPago,
            notas: notas || null,
            subtotal,
            costo_delivery: costoDelivery,
            total,
        })
        .select()
        .single()

    if (pedidoError || !nuevoPedido) {
        console.error("Error al crear pedido", pedidoError)
        return { error: 'Error al procesar pedido. Intenta nuevamente.' }
    }

    // Detalle
    const detalleRows = cartItems.map(item => ({
        pedido_id: nuevoPedido.id,
        item_menu_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.precio * item.cantidad
    }))
    const { error: detalleError } = await supabase.from('detalle_pedidos').insert(detalleRows)

    if (detalleError) {
        console.error("Error detalle", detalleError)
        return { error: 'Error parcial guardando ítems.' }
    }

    // 5. MANEJAR MERCADO PAGO O TRANSFERENCIA
    if (metodoPago === 'mercadopago') {
        try {
            const preference = new Preference(mpClient)

            // Construir Items para MercadoPago
            const mpItems = cartItems.map(item => ({
                id: item.id,
                title: item.nombre || 'Colación',
                quantity: item.cantidad,
                unit_price: item.precio,
                currency_id: 'CLP'
            }))

            // Agregar el costo de envío como un item extra
            if (costoDelivery > 0) {
                mpItems.push({
                    id: 'DELIVERY',
                    title: 'Costo de Envío',
                    quantity: 1,
                    unit_price: costoDelivery,
                    currency_id: 'CLP'
                })
            }

            // Crear la Preferencia
            // ATENCIÓN: En prod, localhost debe cambiar a la URL real ej. https://micolacion.cl
            const base_url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
            const response = await preference.create({
                body: {
                    items: mpItems,
                    metadata: {
                        pedido_id: nuevoPedido.id
                    },
                    back_urls: {
                        success: `${base_url}/checkout/success?id=${nuevoPedido.id}&status=mp_success`,
                        failure: `${base_url}/carrito?estado=fallo_pago`,
                        pending: `${base_url}/checkout/success?id=${nuevoPedido.id}&status=mp_pending`
                    },
                    auto_return: "approved",
                }
            })

            // Retornamos la URL al cliente para que el navegador lo redirija a MercadoPago
            return { rawUrl: response.init_point! }

        } catch (err) {
            console.error(err)
            return { error: 'Error al iniciar Mercado Pago. Revisa el Token.' }
        }
    }

    // SI ES TRANSFERENCIA (Default action)
    redirect(`/checkout/success?id=${nuevoPedido.id}`)
}
