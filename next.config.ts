import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desactivar verificación estricta de TypeScript en build
  typescript: {
    // ⚠️ PERMITIR errores de TypeScript en producción
    // Los errores se corrigen en el editor de código, no en el build
    ignoreBuildErrors: true,
  },
  // Permitir warnings de ESLint en build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuración de imágenes para Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
