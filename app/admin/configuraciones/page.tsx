import { createClient } from "@/lib/supabase/server"
import { Settings, Save, Truck } from "lucide-react"
import { actualizarConfiguraciones } from "./actions"

export default async function ConfiguracionesAdmin() {
    const supabase = await createClient()

    // Cargar configuraciones actuales
    const { data: confs } = await supabase.from('configuraciones').select('*')

    // Convertir a mapa
    const configMap = confs?.reduce((acc, curr) => {
        acc[curr.clave] = curr.valor
        return acc
    }, {} as Record<string, string>) || {}

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold font-heading text-gray-900">Ajustes Generales</h2>
                    <p className="text-sm text-gray-500">Administra los parámetros de la plataforma</p>
                </div>
                <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <Settings className="w-6 h-6 text-gray-600" />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
                <p>Las configuraciones de logística han sido movidas a la pestaña superior de <strong>Delivery</strong> para tu comodidad.</p>
            </div>

            {/* Hint Fiado */}
            <div className="max-w-2xl bg-brand-500/10 border border-brand-500/20 rounded-2xl p-6">
                <h4 className="font-bold text-brand-400 mb-2">¿Buscas el Límite de Fiados?</h4>
                <p className="text-sm text-brand-300/80 leading-relaxed">
                    El límite de <strong>Pedidos en la Libreta</strong> ahora es personalizado por cliente para darte mayor flexibilidad.
                    Puedes aumentarle el crédito a tus clientes de confianza o restringir a los problemáticos desde la pestaña <strong>Usuarios</strong>.
                </p>
            </div>

        </div>
    )
}
