export default function DeliveryPage() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Entregas</h2>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <p className="text-gray-400 text-lg">
                    🚗 No tienes entregas asignadas por el momento.
                </p>
                <p className="text-gray-300 text-sm mt-2">
                    Las entregas aparecerán aquí cuando el admin te las asigne.
                </p>
            </div>
        </div>
    )
}
