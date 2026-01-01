"use client"

import { useEffect, useRef, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { queryApi } from "@/lib/orpc/query"

const ExampleInfite = () => {
  const [isInfiniteScrollEnabled, setIsInfiniteScrollEnabled] =
    useState<boolean>(false)

  const {
    data: examples,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    queryApi.example.infinite.infiniteOptions({
      input: (page: number) => ({ cursor: page }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }),
  )

  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isInfiniteScrollEnabled) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
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

  if (isError) {
    return <p>Something went wrong</p>
  }

  const allItems = examples?.pages.flatMap((page) => page.items)

  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="mx-auto max-w-sm rounded-md border p-4">
          <div className="space-y-2">
            {allItems?.map((example) => (
              <div key={example.id} className="border-b p-2 last:border-b-0">
                {example.title}
              </div>
            ))}
          </div>

          {!isInfiniteScrollEnabled && hasNextPage && (
            <div className="flex justify-center py-4">
              <Button
                onClick={() => {
                  void fetchNextPage()
                  setIsInfiniteScrollEnabled(true)
                }}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    <span className="ml-2">Loading...</span>
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}

          {isFetchingNextPage && isInfiniteScrollEnabled && (
            <div className="flex justify-center py-4">
              <Spinner className="h-4 w-4" />
              <span className="ml-2 text-sm text-gray-500">
                Loading more...
              </span>
            </div>
          )}

          <div ref={loadMoreRef} className="h-4" />

          {!hasNextPage && allItems !== undefined && allItems.length > 0 && (
            <div className="flex justify-center py-4">
              <div className="text-sm text-gray-500">No more items to load</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExampleInfite
