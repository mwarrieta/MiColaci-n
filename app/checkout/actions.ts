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
    const horaSolicitada = formData.get("hora_solicitada") as string
    const direccionEntrega = formData.get("direccion_entrega") as string

    // Validación básica
    if (tipoEntrega === 'delivery' && !direccionEntrega) {
        return { error: 'Debes proporcionar una dirección de entrega' }
    }

    if (metodoPago === 'mercadopago' && !process.env.MP_ACCESS_TOKEN) {
        return { error: 'Mercado Pago no está configurado en el servidor.' }
    }

    // 2.5 Validación de Stock en BD
    const itemIds = cartItems.map(item => item.id)
    const { data: dbItems, error: itemsError } = await supabase
        .from('items_menu')
        .select('id, nombre, stock, agotado_manual, activo')
        .in('id', itemIds)

    if (itemsError || !dbItems) {
        return { error: 'Error al verificar disponibilidad del menú.' }
    }

    for (const cartItem of cartItems) {
        const dbItem = dbItems.find(i => i.id === cartItem.id)
        if (!dbItem) {
            return { error: `El producto ${cartItem.nombre || 'solicitado'} ya no existe.` }
        }
        if (!dbItem.activo || dbItem.agotado_manual) {
            return { error: `El producto ${dbItem.nombre} se ha agotado recién.` }
        }
        if (dbItem.stock !== null && cartItem.cantidad > dbItem.stock) {
            return { error: `Solo quedan ${dbItem.stock} unidades de ${dbItem.nombre}.` }
        }
    }

    // 3. Totales (Server Side)
    const subtotal = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)

    // Obtener Costo Delivery global desde BD
    let configDeliveryVal = 1500;
    const { data: conf } = await supabase.from('configuraciones').select('valor').eq('clave', 'costo_delivery').single()
    if (conf?.valor) {
        configDeliveryVal = parseInt(conf.valor)
    }

    const costoDelivery = tipoEntrega === 'delivery' ? configDeliveryVal : 0
    const total = subtotal + costoDelivery

    // 4. Inserción DB
    const { data: nuevoPedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert({
            cliente_id: user.id,
            estado: 'pendiente_pago',
            fecha_pedido: new Date().toISOString().split('T')[0],
            tipo_entrega: tipoEntrega,
            direccion_entrega: direccionEntrega || null,
            metodo_pago: metodoPago,
            notas: notas || null,
            hora_solicitada: horaSolicitada || null,
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
        nombre_item: item.nombre || 'Colación',
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        subtotal: item.precio * item.cantidad
    }))
    const { error: detalleError } = await supabase.from('items_pedido').insert(detalleRows)

    if (detalleError) {
        console.error("Error detalle", detalleError)
        // Eliminar el pedido principal para evitar huérfanos sin dependencias
        await supabase.from('pedidos').delete().eq('id', nuevoPedido.id)
        return { error: 'Error parcial guardando ítems. Intenta nuevamente.' }
    }

    // 4.5 Deducción de Stock
    for (const cartItem of cartItems) {
        const dbItem = dbItems.find(i => i.id === cartItem.id)
        if (dbItem && dbItem.stock !== null) {
            const nuevoStock = Math.max(0, dbItem.stock - cartItem.cantidad)
            await supabase.from('items_menu').update({ stock: nuevoStock }).eq('id', cartItem.id)
        }
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
