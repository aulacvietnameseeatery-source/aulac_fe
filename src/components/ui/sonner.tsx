"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            className="toaster group"
            position="top-center"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast font-serif tracking-wide group-[.toaster]:bg-white group-[.toaster]:text-[#1A2B4C] group-[.toaster]:border-[#C5A059]/30 group-[.toaster]:shadow-xl rounded-xl",
                    description: "group-[.toast]:text-slate-500 font-serif",
                    actionButton:
                        "group-[.toast]:bg-[#C5A059] group-[.toast]:text-white font-serif",
                    cancelButton:
                        "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500",
                    error: "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-700 group-[.toaster]:border-red-200",
                    success: "group-[.toaster]:bg-[#FDFBF7] group-[.toaster]:text-[#1A2B4C] group-[.toaster]:border-[#C5A059]",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }