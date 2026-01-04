"use client"

import { useEffect, useRef, useState } from "react"

interface UseInfiniteScrollProps {
  category: string
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export const useInfiniteScroll = ({
  category,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseInfiniteScrollProps) => {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [isInfiniteScrollEnabled, setIsInfiniteScrollEnabled] =
    useState<boolean>(false)

  useEffect(() => {
    if (category === "images") {
      setIsInfiniteScrollEnabled(true)
    }
  }, [category])

  useEffect(() => {
    if (!isInfiniteScrollEnabled) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isInfiniteScrollEnabled])

  return {
    loadMoreRef,
    isInfiniteScrollEnabled,
    setIsInfiniteScrollEnabled,
  }
}
