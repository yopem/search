"use client"

import { useEffect, useState } from "react"
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExternalLink as ExternalLinkIcon,
  X as XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogPortal,
  DialogViewport,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils/style"

interface ImageViewerProps {
  isOpen: boolean
  onClose: () => void
  currentIndex: number
  totalImages: number
  image: {
    title: string
    url: string
    img_src?: string
    thumbnail?: string
    thumbnail_src?: string
    resolution?: string
    img_format?: string
  }
  onNext: () => void
  onPrevious: () => void
}

const ImageViewer = ({
  isOpen,
  onClose,
  currentIndex,
  totalImages,
  image,
  onNext,
  onPrevious,
}: ImageViewerProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const rawImageUrl =
    image.img_src ?? image.thumbnail_src ?? image.thumbnail ?? ""

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

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [currentIndex])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "ArrowLeft") {
        e.preventDefault()
        if (currentIndex > 0) {
          onPrevious()
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        if (currentIndex < totalImages - 1) {
          onNext()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, totalImages, onNext, onPrevious])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogBackdrop onClick={onClose} />
        <DialogViewport className="grid-rows-1 p-0">
          <div
            className="relative flex h-screen w-screen items-center justify-center"
            onClick={onClose}
          >
            <DialogClose
              aria-label="Close"
              className="absolute top-4 left-4 z-10"
              onClick={onClose}
              render={
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-black/50 text-white hover:bg-black/70"
                />
              }
            >
              <XIcon />
            </DialogClose>

            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <div className="rounded-md bg-black/50 px-3 py-1.5 text-sm font-medium text-white">
                {currentIndex + 1} / {totalImages}
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "absolute left-4 z-10 bg-black/50 text-white hover:bg-black/70",
                currentIndex === 0 && "cursor-not-allowed opacity-50",
              )}
              onClick={onPrevious}
              disabled={currentIndex === 0}
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "absolute right-4 z-10 bg-black/50 text-white hover:bg-black/70",
                currentIndex === totalImages - 1 &&
                  "cursor-not-allowed opacity-50",
              )}
              onClick={onNext}
              disabled={currentIndex === totalImages - 1}
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </Button>

            <div
              className="flex max-h-screen max-w-screen flex-col items-center justify-center p-16"
              onClick={(e) => e.stopPropagation()}
            >
              {!imageLoaded && !imageError && (
                <div className="flex items-center justify-center">
                  <Spinner className="h-12 w-12 text-white" />
                </div>
              )}

              {imageError && (
                <div className="flex flex-col items-center gap-4 text-white">
                  <p className="text-lg">Failed to load image</p>
                  <Button
                    variant="ghost"
                    className="bg-black/50 text-white hover:bg-black/70"
                    onClick={() => {
                      setImageError(false)
                      setImageLoaded(false)
                    }}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {!imageError && (
                <div className="flex flex-col items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={image.title}
                    className={cn(
                      "max-h-[calc(100vh-12rem)] max-w-full object-contain",
                      imageLoaded ? "opacity-100" : "opacity-0",
                    )}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                  />

                  {imageLoaded && (
                    <div className="flex max-w-2xl flex-col items-center gap-2 rounded-lg bg-black/50 px-4 py-3">
                      <p className="line-clamp-2 text-center font-medium text-white">
                        {image.title}
                      </p>
                      <div className="flex flex-col items-center gap-2">
                        {(image.resolution ?? image.img_format) && (
                          <div className="flex items-center gap-2 text-sm text-white/90">
                            {image.resolution && (
                              <span>{image.resolution}</span>
                            )}
                            {image.resolution && image.img_format && (
                              <span className="text-white/50">•</span>
                            )}
                            {image.img_format && (
                              <span>{image.img_format}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          {extractDomain(image.url) && (
                            <p className="text-sm text-white/70">
                              {extractDomain(image.url)}
                            </p>
                          )}
                          <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-white transition-colors hover:text-white/80"
                          >
                            <ExternalLinkIcon className="h-4 w-4" />
                            View Source
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  )
}

export default ImageViewer
