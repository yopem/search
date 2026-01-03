"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageOff as ImageOffIcon } from "lucide-react"

interface ImageCarouselCardProps {
  image: {
    title: string
    url: string
    img_src?: string
    thumbnail?: string
    thumbnail_src?: string
    source?: string
  }
  onClick?: () => void
}

const ImageCarouselCard = ({ image, onClick }: ImageCarouselCardProps) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const rawImageUrl =
    image.img_src ?? image.thumbnail_src ?? image.thumbnail ?? ""

  if (!rawImageUrl || imageError) {
    return (
      <div className="bg-muted flex h-full w-full flex-col items-center justify-center rounded-lg">
        <ImageOffIcon className="text-muted-foreground h-8 w-8" />
        <span className="text-muted-foreground mt-2 text-xs">
          Image unavailable
        </span>
      </div>
    )
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
    <button
      onClick={onClick}
      className="bg-muted group relative block h-full w-full cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105"
    >
      <Image
        src={imageUrl}
        alt={image.title}
        fill
        sizes="(max-width: 768px) 120px, 150px"
        className={`object-cover transition-opacity ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        unoptimized
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-muted-foreground/20 h-6 w-6 animate-pulse rounded-full" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/20" />
      <div className="absolute right-0 bottom-0 left-0 translate-y-full bg-gradient-to-t from-black/90 to-transparent p-2 transition-transform group-hover:translate-y-0">
        <p className="line-clamp-2 text-xs font-medium text-white">
          {image.title}
        </p>
        {extractDomain(image.url) && (
          <p className="mt-0.5 text-xs text-white/70">
            {extractDomain(image.url)}
          </p>
        )}
      </div>
    </button>
  )
}

export default ImageCarouselCard
