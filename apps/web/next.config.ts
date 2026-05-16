import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilita análise de pacotes em build
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Variáveis de ambiente públicas (acessíveis no browser)
  env: {
    NEXT_PUBLIC_APP_NAME: "NexCargo",
    NEXT_PUBLIC_APP_VERSION: "0.1.0",
  },
};

export default nextConfig;
