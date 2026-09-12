import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // BlockSuite menggunakan Web Components — matikan React strict mode
  reactStrictMode: false,
  
  // Output standalone untuk optimalisasi Docker image
  output: 'standalone',

  // Konfigurasi gambar untuk Appwrite Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'appwrite.geladisalam.my.id',
        port: '',
        pathname: '/storage/**',
      },
    ],
  },

  // Header keamanan — izinkan iframe dari blocksuite local dev server
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
              "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
              "img-src 'self' data: blob: https://appwrite.geladisalam.my.id",
              "connect-src 'self' https://appwrite.geladisalam.my.id wss://appwrite.geladisalam.my.id",
              // Izinkan iframe blocksuite (dinamis dari environment variable + hardcode port docker)
              `frame-src 'self' http://localhost:5173 http://localhost:5174 http://localhost:2003 http://192.168.110.124:2003 ${process.env.NEXT_PUBLIC_BLOCKSUITE_URL || ''}`,
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
