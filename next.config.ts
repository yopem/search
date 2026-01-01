import type { NextConfig } from "next"

const config: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  serverExternalPackages: ["pg", "pg-pool", "pg-native"],
  reactCompiler: true,
  reactStrictMode: true,
  compress: true,
  typescript: { ignoreBuildErrors: true },
  productionBrowserSourceMaps: false,
  compiler: {
    ...(process.env["APP_ENV"] === "production"
      ? {
          removeConsole: {
            exclude: ["error", "warn"],
          },
        }
      : {}),
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "*",
      },
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
}

export default config
