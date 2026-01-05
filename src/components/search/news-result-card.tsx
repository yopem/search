"use client"

import { useState } from "react"
import Image from "next/image"
import {
  ExternalLinkIcon,
  Globe as GlobeIcon,
  NewspaperIcon,
} from "lucide-react"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useOpenGraphImage } from "@/hooks/use-opengraph-image"

interface NewsResult {
  title: string
  url: string
  content?: string
  publishedDate?: string
  author?: string
  thumbnail?: string
  thumbnail_src?: string
  img_src?: string
}

const NewsResultCard = ({
  result,
  openInNewTab = true,
}: {
  result: NewsResult
  openInNewTab?: boolean
}) => {
  const [faviconError, setFaviconError] = useState(false)
  const [thumbnailError, setThumbnailError] = useState(false)
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false)

  const displayUrl = new URL(result.url).hostname.replace("www.", "")
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${displayUrl}&sz=32`
  const publishedDate = result.publishedDate
    ? new Date(result.publishedDate).toLocaleDateString()
    : null

  const rawThumbnailUrl =
    result.img_src ?? result.thumbnail_src ?? result.thumbnail ?? ""
  const searxngThumbnailUrl = rawThumbnailUrl.startsWith("//")
    ? `https:${rawThumbnailUrl}`
    : rawThumbnailUrl

  const { data: ogImageUrl } = useOpenGraphImage(
    result.url,
    !searxngThumbnailUrl,
  )

  const thumbnailUrl = searxngThumbnailUrl
    ? searxngThumbnailUrl
    : (ogImageUrl ?? "")
  const hasThumbnail = !!thumbnailUrl && !thumbnailError

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardHeader className="p-3">
        <div className="flex items-start justify-between gap-2">
          {hasThumbnail && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md">
              <Image
                src={thumbnailUrl}
                alt={result.title}
                fill
                sizes="80px"
                className={`object-cover transition-opacity duration-300 ${
                  thumbnailLoaded ? "opacity-100" : "opacity-0"
                }`}
                loading="lazy"
                unoptimized
                onLoad={() => setThumbnailLoaded(true)}
                onError={() => setThumbnailError(true)}
              />
              {!thumbnailLoaded && (
                <div className="bg-muted absolute inset-0 flex items-center justify-center">
                  <div className="bg-muted-foreground/20 h-4 w-4 animate-pulse rounded-full" />
                </div>
              )}
            </div>
          )}
          <div className="flex-1 space-y-1">
            <a
              href={result.url}
              target={openInNewTab ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group"
            >
              <div className="flex items-center gap-2">
                <NewspaperIcon className="text-muted-foreground h-3 w-3 shrink-0" />
                <CardTitle className="text-base leading-snug font-normal group-hover:underline">
                  {result.title}
                </CardTitle>
              </div>
            </a>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              {!faviconError ? (
                <Image
                  src={faviconUrl}
                  alt={`${displayUrl} favicon`}
                  width={14}
                  height={14}
                  className="rounded-sm"
                  onError={() => setFaviconError(true)}
                  unoptimized
                />
              ) : (
                <GlobeIcon className="text-muted-foreground h-3 w-3" />
              )}
              <span className="text-green-700 dark:text-green-500">
                {displayUrl}
              </span>
              {publishedDate && <span>• {publishedDate}</span>}
              {result.author && <span>• {result.author}</span>}
            </div>
            {result.content && (
              <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                {result.content}
              </CardDescription>
            )}
          </div>
          {openInNewTab && (
            <ExternalLinkIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          )}
        </div>
      </CardHeader>
    </Card>
  )
}

export default NewsResultCard
