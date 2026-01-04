"use client"

import { useCallback, useEffect, useState } from "react"

import ImageViewerControls from "@/components/search/image-viewer-controls"
import ImageViewerMetadata from "@/components/search/image-viewer-metadata"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogBackdrop,
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
  nextImage?: {
    title: string
    url: string
    img_src?: string
    thumbnail?: string
    thumbnail_src?: string
    resolution?: string
    img_format?: string
  }
  previousImage?: {
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
  openInNewTab?: boolean
}

const ImageViewer = ({
  isOpen,
  onClose,
  currentIndex,
  totalImages,
  image,
  nextImage,
  previousImage,
  onNext,
  onPrevious,
  openInNewTab = true,
}: ImageViewerProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const rawImageUrl =
    image.img_src ?? image.thumbnail_src ?? image.thumbnail ?? ""

  const imageUrl = rawImageUrl.startsWith("//")
    ? `https:${rawImageUrl}`
    : rawImageUrl

  const getImageUrl = useCallback((img: typeof image) => {
    const raw = img.img_src ?? img.thumbnail_src ?? img.thumbnail ?? ""
    return raw.startsWith("//") ? `https:${raw}` : raw
  }, [])

  useEffect(() => {
    setImageLoaded(false)
    setImageError(false)
  }, [currentIndex])

  useEffect(() => {
    if (nextImage) {
      const img = new Image()
      img.src = getImageUrl(nextImage)
    }
    if (previousImage) {
      const img = new Image()
      img.src = getImageUrl(previousImage)
    }
  }, [nextImage, previousImage, getImageUrl])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === "ArrowLeft" || e.key === "h") {
        e.preventDefault()
        if (currentIndex > 0) {
          onPrevious()
        }
      } else if (e.key === "ArrowRight" || e.key === "l") {
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
            <ImageViewerControls
              currentIndex={currentIndex}
              totalImages={totalImages}
              onNext={onNext}
              onPrevious={onPrevious}
              onClose={onClose}
            />

            <div
              className="flex max-h-screen max-w-screen flex-col items-center justify-center p-16"
              onClick={(e) => e.stopPropagation()}
            >
              {!imageLoaded && !imageError && (
                <div className="flex items-center justify-center">
                  <Spinner className="h-12 w-12 text-white" />
                </div>
              )}

              {(imageError || !imageUrl) && (
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

              {!imageError && imageUrl && (
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
                    <ImageViewerMetadata
                      title={image.title}
                      url={image.url}
                      resolution={image.resolution}
                      imgFormat={image.img_format}
                      openInNewTab={openInNewTab}
                    />
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
