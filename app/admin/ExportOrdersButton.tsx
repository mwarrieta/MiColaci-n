"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { obtenerDatosExportacion } from "./actions"
import * as XLSX from "xlsx"

export function ExportOrdersButton() {
    const [isLoading, setIsLoading] = useState(false)

    const handleExport = async () => {
        setIsLoading(true)
        const toastId = toast.loading("Generando Excel de ventas...")

        try {
            const result = await obtenerDatosExportacion()

            if (result.error) {
                toast.error("Error al exportar", { id: toastId, description: result.error })
                return
            }

            if (result.rows && result.rows.length > 0) {
                // Crear workbook
                const wb = XLSX.utils.book_new()

                // Crear la hoja principal
                const ws = XLSX.utils.json_to_sheet(result.rows, {
                    header: ["pedido", "fecha", "hora", "cliente", "email", "tipo_entrega", "estado", "metodo_pago", "total"],
                })

                // Estilizar headers bonitos
                ws["!cols"] = [
                    { wch: 10 },  // pedido
                    { wch: 12 },  // fecha
                    { wch: 8 },   // hora
                    { wch: 25 },  // cliente
                    { wch: 30 },  // email
                    { wch: 14 },  // tipo_entrega
                    { wch: 18 },  // estado
                    { wch: 14 },  // metodo_pago
                    { wch: 12 },  // total
                ]

                // Renombrar headers
                const headerMap: Record<string, string> = {
                    pedido: "N° Pedido",
                    fecha: "Fecha",
                    hora: "Hora",
                    cliente: "Cliente",
                    email: "Email",
                    tipo_entrega: "Tipo Entrega",
                    estado: "Estado",
                    metodo_pago: "Método Pago",
                    total: "Total ($)",
                }
                const headerKeys = Object.keys(headerMap)
                headerKeys.forEach((key, i) => {
                    const cell = XLSX.utils.encode_cell({ r: 0, c: i })
                    if (ws[cell]) ws[cell].v = headerMap[key]
                })

                XLSX.utils.book_append_sheet(wb, ws, "Ventas")

                // Descargar
                const fechaArchivo = new Date().toISOString().split("T")[0]
                XLSX.writeFile(wb, `reporte_ventas_${fechaArchivo}.xlsx`)

                toast.success("¡Listo, cariño! Excel descargado 📊", {
                    id: toastId,
                    description: `${result.rows.length} pedidos exportados.`,
                })
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
            className="flex items-center gap-2 bg-admin-surface border border-white/10 text-gray-300 hover:text-white hover:border-white/20 font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
            <Download className={`w-4 h-4 ${isLoading ? 'animate-bounce' : ''}`} />
            {isLoading ? "Exportando..." : "Excel"}
        </button>
    )
}
