"use client"

import { useEffect } from "react"

interface UseSearchKeyboardProps {
  mode: "home" | "results"
  isViewerOpen: boolean
  selectedImageIndex: number | null
  setCategory: (category: string) => void
  handleNext: () => void
  handlePrevious: () => void
  handleClose: () => void
}

export const useSearchKeyboard = ({
  mode,
  isViewerOpen,
  selectedImageIndex,
  setCategory,
  handleNext,
  handlePrevious,
  handleClose,
}: UseSearchKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        const searchInput = document.querySelector(
          'input[type="search"], input[type="text"]',
        )
        if (searchInput instanceof HTMLInputElement) {
          searchInput.focus()
        }
      }

      if (e.key === "/" && mode === "results") {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]')
        if (searchInput instanceof HTMLInputElement) {
          searchInput.focus()
        }
      }

      if (e.key === "Escape") {
        const searchInput = document.querySelector(
          'input[type="search"], input[type="text"]',
        )
        if (
          searchInput instanceof HTMLInputElement &&
          searchInput === document.activeElement
        ) {
          searchInput.blur()
        }
      }

      if (isViewerOpen && selectedImageIndex !== null) {
        if (e.key === "ArrowRight" || e.key === "l") {
          e.preventDefault()
          handleNext()
        }
        if (e.key === "ArrowLeft" || e.key === "h") {
          e.preventDefault()
          handlePrevious()
        }
        if (e.key === "Escape") {
          e.preventDefault()
          handleClose()
        }
      }

      if (mode === "results") {
        if (e.key === "1") {
          e.preventDefault()
          void setCategory("general")
        } else if (e.key === "2") {
          e.preventDefault()
          void setCategory("images")
        } else if (e.key === "3") {
          e.preventDefault()
          void setCategory("news")
        } else if (e.key === "4") {
          e.preventDefault()
          void setCategory("videos")
        } else if (e.key === "5") {
          e.preventDefault()
          void setCategory("music")
        } else if (e.key === "6") {
          e.preventDefault()
          void setCategory("map")
        } else if (e.key === "7") {
          e.preventDefault()
          void setCategory("science")
        } else if (e.key === "8") {
          e.preventDefault()
          void setCategory("tech")
        } else if (e.key === "9") {
          e.preventDefault()
          void setCategory("files")
        } else if (e.key === "0") {
          e.preventDefault()
          void setCategory("social_media")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    mode,
    isViewerOpen,
    selectedImageIndex,
    setCategory,
    handleNext,
    handlePrevious,
    handleClose,
  ])
}
