export default function AdminDashboard() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Pedidos hoy', valor: '0', icon: '📋', color: 'bg-blue-50 text-blue-700' },
                    { label: 'Confirmados', valor: '0', icon: '✅', color: 'bg-green-50 text-green-700' },
                    { label: 'Pendientes', valor: '0', icon: '⏳', color: 'bg-yellow-50 text-yellow-700' },
                    { label: 'Ingresos hoy', valor: '$0', icon: '💰', color: 'bg-orange-50 text-orange-700' },
                ].map((card) => (
                    <div
                        key={card.label}
                        className={`${card.color} rounded-2xl p-6`}
                    >
                        <div className="text-2xl mb-2">{card.icon}</div>
                        <div className="text-3xl font-bold">{card.valor}</div>
                        <div className="text-sm opacity-75 mt-1">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <p className="text-gray-400 text-lg">
                    🚧 Dashboard completo se desarrollará en la Fase 11.
                </p>
            </div>
        </div>
    )
}
