"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface SearchPaginationProps {
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  isInfiniteScrollEnabled: boolean
  loadMoreRef: React.RefObject<HTMLDivElement>
  allResultsCount: number
  onLoadMore: () => void
}

const SearchPagination = ({
  hasNextPage,
  isFetchingNextPage,
  isInfiniteScrollEnabled,
  loadMoreRef,
  allResultsCount,
  onLoadMore,
}: SearchPaginationProps) => {
  return (
    <>
      {!isInfiniteScrollEnabled && hasNextPage && (
        <div className="flex justify-center py-8">
          <Button onClick={onLoadMore} disabled={isFetchingNextPage}>
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
        <div
          className="flex justify-center py-8"
          aria-live="polite"
          aria-busy="true"
        >
          <Spinner className="h-6 w-6" />
          <span className="text-muted-foreground ml-2">
            Loading more results...
          </span>
        </div>
      )}

      {isInfiniteScrollEnabled && (
        <div
          ref={loadMoreRef}
          className="h-20 w-full"
          aria-live="polite"
          aria-busy={isFetchingNextPage}
        />
      )}

      {!hasNextPage && allResultsCount > 0 && (
        <div className="flex justify-center py-8">
          <span className="text-muted-foreground">No more results</span>
        </div>
      )}
    </>
  )
}

export default SearchPagination
