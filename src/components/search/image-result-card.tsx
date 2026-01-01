"use client"

import { useState } from "react"
import Image from "next/image"

interface ImageResult {
  title: string
  url: string
  img_src?: string
  thumbnail?: string
  thumbnail_src?: string
}

interface ImageResultCardProps {
  result: ImageResult
  onImageClick?: () => void
}

const ImageResultCard = ({ result, onImageClick }: ImageResultCardProps) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(1)

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

  const ROW_HEIGHT = 200

  return (
    <button
      onClick={onImageClick}
      className="bg-muted group relative block cursor-pointer overflow-hidden rounded-lg"
      style={{
        height: `${ROW_HEIGHT}px`,
        flex: `${aspectRatio * 200} 1 ${ROW_HEIGHT * aspectRatio}px`,
      }}
    >
      <Image
        src={imageUrl}
        alt={result.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover transition-all duration-300 group-hover:scale-105 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        unoptimized
        onLoad={(e) => {
          const img = e.target as HTMLImageElement
          const ratio = img.naturalWidth / img.naturalHeight
          setAspectRatio(ratio)
          setImageLoaded(true)
        }}
        onError={() => setImageError(true)}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-muted-foreground/20 h-8 w-8 animate-pulse rounded-full" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
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
    </button>
  )
}

export default ImageResultCard
