import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "La Cocina de Elvira — Pide tu almuerzo fácil",
  description:
    "Plataforma de pedidos de colaciones y almuerzos. Pide rápido, paga fácil, recibe en tu lugar de trabajo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased text-[#2D2319] bg-[#FAF7F2]`}>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
