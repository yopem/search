"use client"

import { useState } from "react"
import Image from "next/image"

interface InfoboxImageProps {
  src: string
  alt: string
  aspectRatio?: "square" | "video" | "poster" | "logo"
  objectFit?: "cover" | "contain"
}

const InfoboxImage = ({
  src,
  alt,
  aspectRatio = "square",
  objectFit = "cover",
}: InfoboxImageProps) => {
  const [imageError, setImageError] = useState(false)

  if (imageError) return null

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
        ? "aspect-video"
        : aspectRatio === "poster"
          ? "aspect-[2/3]"
          : "aspect-video"

  const objectFitClass =
    objectFit === "cover" ? "object-cover" : "object-contain"

  const maxWidthClass =
    aspectRatio === "square" ||
    aspectRatio === "poster" ||
    aspectRatio === "logo"
      ? "max-w-[200px] mx-auto"
      : ""

  return (
    <div
      className={`bg-muted relative w-full overflow-hidden rounded-md ${aspectClass} ${maxWidthClass}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={objectFitClass}
        onError={() => setImageError(true)}
      />
    </div>
  )
}

export default InfoboxImage
