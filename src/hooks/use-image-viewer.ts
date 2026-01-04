"use client"

import { useCallback, useState } from "react"

export const useImageViewer = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  )
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setIsViewerOpen(true)
  }

  const handleNext = useCallback(
    (totalImages: number) => {
      if (selectedImageIndex !== null && selectedImageIndex < totalImages - 1) {
        setSelectedImageIndex(selectedImageIndex + 1)
      }
    },
    [selectedImageIndex],
  )

  const handlePrevious = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }, [selectedImageIndex])

  const handleClose = useCallback(() => {
    setIsViewerOpen(false)
    setSelectedImageIndex(null)
  }, [])

  return {
    selectedImageIndex,
    isViewerOpen,
    handleImageClick,
    handleNext,
    handlePrevious,
    handleClose,
  }
}
