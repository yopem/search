"use client"

import { Card, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchSkeletonProps {
  category?: "general" | "images" | "videos" | "news"
}

const SearchSkeleton = ({ category = "general" }: SearchSkeletonProps) => {
  if (category === "images") {
    return (
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton
            key={i}
            className="rounded-lg"
            style={{
              height: "200px",
              flex: `${1 + Math.random()} 1 ${200 * (1 + Math.random())}px`,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

export default SearchSkeleton
