import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: e } = await supabase.from('pedidos').insert({
        cliente_id: user?.id || '00000000-0000-0000-0000-000000000000',
        estado: 'pendiente',
        tipo_entrega: 'delivery',
        direccion_entrega: 'Test Address',
        metodo_pago: 'mercadopago',
        notas: '',
        subtotal: 1000,
        costo_delivery: 1500,
        total: 2500,
    })

    return NextResponse.json({ e })
}
