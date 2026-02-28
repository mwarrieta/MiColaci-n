"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "primary" | "secondary" | "outline" | "ghost" | "accent"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        // Clases base para todos los botones
        const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95 px-6 py-3"

        // Variantes
        const variants = {
            primary: "bg-brand-500 text-white shadow-sm shadow-brand-500/20 hover:bg-brand-600 hover:-translate-y-0.5",
            secondary: "bg-olive-50 text-olive-700 hover:bg-olive-500/20",
            accent: "bg-accent-400 text-white hover:bg-accent-600",
            outline: "border-2 border-brand-200 bg-transparent text-brand-700 hover:bg-brand-50 hover:border-brand-300",
            ghost: "hover:bg-brand-50 text-[#8A7E6D] hover:text-brand-700",
        }

        const variantStyles = variants[variant]

        return (
            <Comp
                className={`${baseStyles} ${variantStyles} ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
