import type { NextConfig } from "next"

const config: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
    serverSourceMaps: false,
    preloadEntriesOnStart: false,
  },
  serverExternalPackages: ["pg", "ioredis"],
  enablePrerenderSourceMaps: false,
  productionBrowserSourceMaps: false,
  reactCompiler: true,
  reactStrictMode: true,
  // cacheComponents: true,
  typescript: { ignoreBuildErrors: false },
  compiler:
    process.env["APP_ENV"] === "production"
      ? {
          removeConsole: {
            exclude: ["error", "warn"],
          },
        }
      : {},
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
