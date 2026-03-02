"use client"

import { useTransition, useState } from "react"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import { Play, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { prepararMenuManana } from "./actions"

export default function SeederMananaPage() {
    const [isPending, startTransition] = useTransition()
    const [logs, setLogs] = useState<string[]>([])

    const handlePreparar = () => {
        if (!confirm("⚠️ ¿Estás seguro? Esto OCULTARÁ todos tus platos actuales y subirá las 3 opciones de mañana directamente de las fotos de tu computadora.")) return

        setLogs(prev => [...prev, "Iniciando secuencia de preparación..."])
        startTransition(async () => {
            setLogs(prev => [...prev, "Ejecutando Server Action remoto con permisos de Administrador..."])

            const result = await prepararMenuManana()

            if (result?.error) {
                toast.error("Error Crítico", { description: result.error })
                setLogs(prev => [...prev, "❌ Error: " + result.error])
            } else {
                toast.success("¡Menú de Mañana Preparado con Éxito!")
                setLogs(prev => [...prev, "✅ Secuencia exitosa. Platos activos y fotos subidas. Ya puedes volver al menú."])
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 p-4">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Carga Mágica del Menú</h1>
                    <p className="text-gray-500 mt-1">
                        Herramienta temporal para configurar el menú de mañana en 1 clic.
                    </p>
                </div>
                <Link href="/admin/menu">
                    <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Volver</Button>
                </Link>
            </header>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm border border-emerald-100">
                    <strong className="block mb-2 text-emerald-900">¿Qué hará este botón?</strong>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Ocultará absolutamente todo el catálogo actual.</li>
                        <li>Tratará de leer <strong>Carbonada.jpeg</strong> y <strong>Ensalada Mixta de Huevo y Atún.jpeg</strong> de tu carpeta secreta <code>Platos</code> en OneDrive.</li>
                        <li>Subirá estas fotos a la nube usando tu sesión de seguridad (saltando RLS).</li>
                        <li>Creará/Actualizará la Carbonada ($3500), Ensalada ($3500) y Fruta con Yogurt ($2500) y las dejará Visibles Inmediatamente.</li>
                    </ul>
                </div>

                <Button
                    variant="primary"
                    className="w-full py-4 text-lg"
                    onClick={handlePreparar}
                    disabled={isPending}
                >
                    {isPending ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Procesando Autoinstalación...</>
                    ) : (
                        <><Play className="w-5 h-5 mr-2" /> ¡Preparar Menú de Mañana!</>
                    )}
                </Button>

                {logs.length > 0 && (
                    <div className="mt-8 bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1">{`> ${log}`}</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
