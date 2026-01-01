"use client"

import { useState } from "react"

interface ImageResult {
  title: string
  url: string
  img_src?: string
  thumbnail?: string
  thumbnail_src?: string
}

const ImageResultCard = ({ result }: { result: ImageResult }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const rawImageUrl =
    result.img_src ?? result.thumbnail_src ?? result.thumbnail ?? ""

  if (!rawImageUrl || imageError) {
    return null
  }

  const imageUrl = rawImageUrl.startsWith("//")
    ? `https:${rawImageUrl}`
    : rawImageUrl

  const extractDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain.replace("www.", "")
    } catch {
      return ""
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-lg">
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-muted-foreground/20 h-8 w-8 animate-pulse rounded-full" />
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={result.title}
            className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
        </div>
        <div className="absolute right-0 bottom-0 left-0 translate-y-full bg-gradient-to-t from-black/80 to-transparent p-3 transition-transform group-hover:translate-y-0">
          <p className="line-clamp-2 text-xs font-medium text-white">
            {result.title}
          </p>
          {extractDomain(result.url) && (
            <p className="mt-1 text-xs text-white/70">
              {extractDomain(result.url)}
            </p>
          )}
        </div>
      </a>
    </div>
  )
}

export default ImageResultCard
