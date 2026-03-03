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
                    <h2 className="text-2xl font-bold font-heading text-admin-text">Ajustes Generales</h2>
                    <p className="text-sm text-gray-400">Administra los parámetros de la plataforma</p>
                </div>
                <div className="p-2 bg-admin-surface rounded-xl border border-white/5">
                    <Settings className="w-6 h-6 text-brand-400" />
                </div>
            </div>

            <div className="max-w-2xl bg-admin-surface rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3 mb-2">
                        <Truck className="w-5 h-5 text-brand-500" />
                        <h3 className="text-lg font-bold text-white">Logística y Delivery</h3>
                    </div>
                    <p className="text-sm text-gray-400">Configura los costos base para el envío a domicilio.</p>
                </div>

                <div className="p-6">
                    <form action={actualizarConfiguraciones} className="space-y-6">

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Costo Base de Delivery ($)
                            </label>
                            <input
                                type="number"
                                name="costo_delivery"
                                required
                                min="0"
                                defaultValue={configMap['costo_delivery'] || "1500"}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Este costo se sumará automáticamente a las órdenes donde el cliente seleccione "Delivery".
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-500/20"
                            >
                                <Save className="w-4 h-4" />
                                Guardar Ajustes
                            </button>
                        </div>

                    </form>
                </div>
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
