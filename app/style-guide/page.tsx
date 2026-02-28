import { Button } from "@/components/ui/Button"
import { MenuCard } from "@/components/ui/MenuCard"
import { StatusBadge } from "@/components/ui/StatusBadge"

export default function StyleGuidePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-16">

                {/* Header */}
                <div>
                    <h1 className="text-4xl font-bold font-heading text-gray-900 mb-2">💎 Style Guide Mi Colación</h1>
                    <p className="text-gray-500">Componentes base, tipografías y colores. Diseño premium y cálido.</p>
                </div>

                {/* Fonts */}
                <section>
                    <h2 className="text-2xl font-bold border-b border-gray-200 pb-2 mb-6 font-heading">Tipografía</h2>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Heading (Outfit)</p>
                            <h1 className="text-4xl font-bold font-heading">La comida más rica en tu lugar de trabajo</h1>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Body (Inter)</p>
                            <p className="text-lg text-gray-800">
                                Ofrecemos menús caseros, preparados con ingredientes frescos cada día. Pide antes de las 11:30 AM y recibe tu almuerzo calientito directamente en tu oficina.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Buttons */}
                <section>
                    <h2 className="text-2xl font-bold border-b border-gray-200 pb-2 mb-6 font-heading">Botones</h2>
                    <div className="flex flex-wrap gap-4 items-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <Button variant="primary">Continuar al pago</Button>
                        <Button variant="secondary">Ver detalles</Button>
                        <Button variant="outline">Modificar pedido</Button>
                        <Button variant="ghost">Cancelar</Button>
                        <Button variant="primary" disabled>Agotado</Button>
                    </div>
                </section>

                {/* Badges */}
                <section>
                    <h2 className="text-2xl font-bold border-b border-gray-200 pb-2 mb-6 font-heading">Estados de Pedido</h2>
                    <div className="flex flex-wrap gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <StatusBadge status="pendiente" />
                        <StatusBadge status="confirmado" />
                        <StatusBadge status="preparando" />
                        <StatusBadge status="en_camino" />
                        <StatusBadge status="entregado" />
                        <StatusBadge status="cancelado" />
                    </div>
                </section>

                {/* Cards */}
                <section>
                    <h2 className="text-2xl font-bold border-b border-gray-200 pb-2 mb-6 font-heading">Tarjetas (MenuCard)</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <MenuCard
                            id="1"
                            titulo="Pollo asado c/ puré picante"
                            descripcion="Cuarto de pollo asado al horno con puré de papas casero y ensalada chilena."
                            precio={4500}
                        />
                        <MenuCard
                            id="2"
                            titulo="Lasaña Boloñesa Premium"
                            descripcion="Lasaña artesanal con abundante salsa boloñesa, doble queso mozzarella y un toque de albahaca, horneada a la perfección para disfrutar como en Italia."
                            precio={5200}
                        />
                        <MenuCard
                            id="3"
                            titulo="Ensalada César con Pollo"
                            descripcion="Mix de lechugas hidropónicas, crutones caseros, pollo grillado y dressing original."
                            precio={4000}
                            disponible={false}
                        />
                    </div>
                </section>

            </div>
        </div>
    )
}
