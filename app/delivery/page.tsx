import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PedidoDeliveryCard } from "./PedidoDeliveryCard"
import { Bike, CheckCircle2, Navigation } from "lucide-react"

export default async function DeliveryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single()
    if (profile?.rol !== "admin" && profile?.rol !== "repartidor") {
        redirect("/")
    }

    // Obtener pedidos del día que están en preparando o en_camino, 
    // que sean de tipo "delivery" (no retiro)
    const hoy = new Date().toISOString().split("T")[0]

    const { data: pedidosDelivery } = await supabase
        .from("pedidos")
        .select("id, numero_pedido, estado, tipo_entrega, direccion_envio, telefono_contacto, notas, total, created_at")
        .gte("created_at", `${hoy}T00:00:00`)
        .in("estado", ["preparando", "en_camino"])
        .in("tipo_entrega", ["delivery"])
        .order("created_at", { ascending: true })

    const pedidos = pedidosDelivery || []

    // Agrupamos
    const paraRecoger = pedidos.filter(p => p.estado === "preparando")
    const enRuta = pedidos.filter(p => p.estado === "en_camino")

    return (
        <div className="space-y-6">
            {/* Header Mobile */}
            <div className="bg-brand-500 rounded-3xl p-6 text-white shadow-lg shadow-brand-500/20 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-2xl font-heading font-black">Mi Ruta</h1>
                    <p className="text-brand-100 font-medium text-sm mt-1">
                        {enRuta.length} en tránsito • {paraRecoger.length} por recoger
                    </p>
                </div>
                <Bike className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10" />
            </div>

            {/* Tabs / Secciones */}
            <div className="space-y-8">

                {/* En Ruta */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                            <Navigation className="w-4 h-4 text-brand-600" />
                        </div>
                        <h2 className="font-heading font-bold text-gray-900 text-lg">Entregas en Curso</h2>
                        <span className="ml-auto bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {enRuta.length}
                        </span>
                    </div>

                    {enRuta.length === 0 ? (
                        <div className="bg-white border md:border-dashed border-gray-200 rounded-3xl p-8 text-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm font-medium">No tienes entregas activas.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {enRuta.map(p => <PedidoDeliveryCard key={p.id} pedido={p} />)}
                        </div>
                    )}
                </section>

                {/* Para Recoger (Preparando en cocina) */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Bike className="w-4 h-4 text-amber-600" />
                        </div>
                        <h2 className="font-heading font-bold text-gray-900 text-lg">Para Recoger</h2>
                        <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {paraRecoger.length}
                        </span>
                    </div>

                    {paraRecoger.length === 0 ? (
                        <div className="bg-white border md:border-dashed border-gray-200 rounded-3xl p-8 text-center opacity-80">
                            <p className="text-gray-400 text-sm font-medium">La cocina está al día.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paraRecoger.map(p => <PedidoDeliveryCard key={p.id} pedido={p} />)}
                        </div>
                    )}
                </section>

            </div>
        </div>
    )
}
