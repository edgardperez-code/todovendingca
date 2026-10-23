import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  // El repositorio padre tiene su propio package-lock; fijamos la raíz del proyecto.
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async redirects() {
    return [
      // Dominio antiguo → nuevo (301 permanente, conserva la ruta). Para que
      // funcione, digital.todovendingca.com debe apuntar (CNAME) a este mismo servicio.
      {
        source: "/:path*",
        has: [{ type: "host", value: "digital.todovendingca.com" }],
        destination: "https://www.todowebdigital.com/:path*",
        permanent: true,
      },
      // Sin www → con www (canónico único).
      {
        source: "/:path*",
        has: [{ type: "host", value: "todowebdigital.com" }],
        destination: "https://www.todowebdigital.com/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/(portafolio|logo.png|apple-touch-icon.png)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
