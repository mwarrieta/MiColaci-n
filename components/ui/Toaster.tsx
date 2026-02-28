"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg rounded-2xl p-4 font-sans",
                    description: "group-[.toast]:text-gray-500",
                    actionButton:
                        "group-[.toast]:bg-brand-500 group-[.toast]:text-white rounded-xl",
                    cancelButton:
                        "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500 rounded-xl",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
