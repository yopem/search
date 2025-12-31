"use client"

import Image from "next/image"

import { Card } from "@/components/ui/card"

interface ImageResult {
  title: string
  url: string
  img_src?: string
  thumbnail?: string
  thumbnail_src?: string
}

export function ImageResultCard({ result }: { result: ImageResult }) {
  const rawImageUrl =
    result.img_src ?? result.thumbnail_src ?? result.thumbnail ?? ""

  if (!rawImageUrl) {
    return null
  }

  const imageUrl = rawImageUrl.startsWith("//")
    ? `https:${rawImageUrl}`
    : rawImageUrl

  return (
    <Card className="group hover:ring-primary overflow-hidden transition-all hover:ring-2">
      <a href={result.url} target="_blank" rel="noopener noreferrer">
        <div className="relative aspect-square">
          <Image
            src={imageUrl}
            alt={result.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        </div>
        <div className="p-2">
          <p className="text-muted-foreground group-hover:text-foreground line-clamp-2 text-xs transition-colors">
            {result.title}
          </p>
        </div>
      </a>
    </Card>
  )
}
