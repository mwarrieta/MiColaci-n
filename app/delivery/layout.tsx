export default function DeliveryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
            <main className="max-w-md mx-auto relative pt-4 px-4 sm:pt-6">
                {children}
            </main>
        </div>
    )
}
