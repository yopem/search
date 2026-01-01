"use client"

import { Skeleton } from "@/components/ui/skeleton"

const SearchSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchSkeleton
