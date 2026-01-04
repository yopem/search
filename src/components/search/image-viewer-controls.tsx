"use client"

import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  X as XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DialogClose } from "@/components/ui/dialog"
import { cn } from "@/lib/utils/style"

interface ImageViewerControlsProps {
  currentIndex: number
  totalImages: number
  onNext: () => void
  onPrevious: () => void
  onClose: () => void
}

const ImageViewerControls = ({
  currentIndex,
  totalImages,
  onNext,
  onPrevious,
  onClose,
}: ImageViewerControlsProps) => {
  return (
    <>
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
        onClick={(e) => {
          e.stopPropagation()
          onPrevious()
        }}
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
          currentIndex === totalImages - 1 && "cursor-not-allowed opacity-50",
        )}
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        disabled={currentIndex === totalImages - 1}
        aria-label="Next image"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </Button>
    </>
  )
}

export default ImageViewerControls
