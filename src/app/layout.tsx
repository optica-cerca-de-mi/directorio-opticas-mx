import type { Metadata } from "next";
import "./globals.css";
import GlobalProviders from "@/components/GlobalProviders";

export const metadata: Metadata = {
  title: {
    default: "La Óptica Cerca de mí | Directorio de Ópticas en México",
    template: "%s | La Óptica Cerca de mí",
  },
  description:
    "Encuentra la óptica perfecta cerca de ti. Reseñas reales de Google, horarios en vivo, ubicación y contacto directo. El directorio #1 de ópticas en México.",
  icons: {
    icon: "/icon",  // Esto apunta automáticamente al icon.tsx
  },
  keywords: [
    "óptica",
    "lentes",
    "armazones",
    "examen de la vista",
    "directorios de ópticas",
    "ópticas cerca de mí",
    "lentes de contacto",
  ],
  authors: [{ name: "La Óptica Cerca de mí" }],
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "La Óptica Cerca de mí",
    title: "La Óptica Cerca de mí | Directorio de Ópticas en México",
    description:
      "Encuentra la óptica perfecta cerca de ti. Reseñas reales, horarios en vivo y contacto directo.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased bg-gray-50 text-gray-900 flex flex-col min-h-screen">
        <GlobalProviders>
          {children}
        </GlobalProviders>
      </body>
    </html>
  );
}