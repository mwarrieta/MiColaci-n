"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface VentasChartProps {
    data: { date: string; amount: number; count: number }[]
}

export function VentasChart({ data }: VentasChartProps) {
    // Formatear las fechas para que se vean bonitas (ej: "Lun", "Mar")
    const chartData = useMemo(() => {
        return data.map((item) => {
            const dateObj = new Date(item.date + 'T00:00:00')
            return {
                name: dateObj.toLocaleDateString("es-CL", { weekday: "short" }),
                total: item.amount,
                pedidos: item.count
            }
        })
    }, [data])

    if (!data.length) {
        return <div className="h-64 flex items-center justify-center text-gray-400">Sin datos de ventas aún</div>
    }

    return (
        <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6B7280", fontSize: 12, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: '#F3F4F6' }}
                        content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-3">
                                        <p className="font-bold text-gray-900 mb-1 capitalize">{label}</p>
                                        <p className="text-brand-600 font-bold text-sm">
                                            Ventas: ${payload[0].value?.toLocaleString('es-CL')}
                                        </p>
                                        <p className="text-gray-500 text-xs font-semibold mt-1">
                                            {payload[0].payload.pedidos} pedidos totales
                                        </p>
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Bar
                        dataKey="total"
                        fill="#f97316"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
