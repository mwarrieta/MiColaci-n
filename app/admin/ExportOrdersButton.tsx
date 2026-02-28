"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { downloadVentasCSV } from "./actions"

export function ExportOrdersButton() {
    const [isLoading, setIsLoading] = useState(false)

    const handleExport = async () => {
        setIsLoading(true)
        const toastId = toast.loading("Generando reporte de ventas...")

        try {
            const data = await downloadVentasCSV()

            if (data.error) {
                toast.error("Error al exportar", { id: toastId, description: data.error })
                return
            }

            if (data.csvString) {
                // Crear y descargar BLOB desde String 
                const blob = new Blob([data.csvString], { type: 'text/csv;charset=utf-8;' })
                const url = window.URL.createObjectURL(blob)

                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `reporte_ventas_${new Date().toISOString().split("T")[0]}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                toast.success("¡Reporte descargado!", { id: toastId, description: "Puedes abrirlo con Excel o Google Sheets." })
            }

        } catch (error) {
            toast.error("Ocurrió un error inesperado", { id: toastId })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300 font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
        >
            <Download className={`w-4 h-4 ${isLoading ? 'animate-bounce' : ''}`} />
            {isLoading ? "Exportando..." : "Exportar Todas"}
        </button>
    )
}
