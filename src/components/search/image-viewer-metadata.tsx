"use client"

import { ExternalLink as ExternalLinkIcon } from "lucide-react"

interface ImageViewerMetadataProps {
  title: string
  url: string
  resolution?: string
  imgFormat?: string
  openInNewTab?: boolean
}

const extractDomain = (url: string) => {
  try {
    const domain = new URL(url).hostname
    return domain.replace("www.", "")
  } catch {
    return ""
  }
}

const ImageViewerMetadata = ({
  title,
  url,
  resolution,
  imgFormat,
  openInNewTab = true,
}: ImageViewerMetadataProps) => {
  return (
    <div className="flex max-w-2xl flex-col items-center gap-2 rounded-lg bg-black/50 px-4 py-3">
      <p className="line-clamp-2 text-center font-medium text-white">{title}</p>
      <div className="flex flex-col items-center gap-2">
        {(resolution ?? imgFormat) && (
          <div className="flex items-center gap-2 text-sm text-white/90">
            {resolution && <span>{resolution}</span>}
            {resolution && imgFormat && (
              <span className="text-white/50">•</span>
            )}
            {imgFormat && <span>{imgFormat}</span>}
          </div>
        )}
        <div className="flex items-center gap-3">
          {extractDomain(url) && (
            <p className="text-sm text-white/70">{extractDomain(url)}</p>
          )}
          <a
            href={url}
            target={openInNewTab ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-white transition-colors hover:text-white/80"
          >
            <ExternalLinkIcon className="h-4 w-4" />
            View Source
          </a>
        </div>
      </div>
    </div>
  )
}

export default ImageViewerMetadata
