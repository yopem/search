"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface SearchSkeletonProps {
  category?:
    | "general"
    | "images"
    | "videos"
    | "news"
    | "music"
    | "map"
    | "science"
    | "files"
    | "social_media"
    | "tech"
}

const SearchSkeleton = ({ category = "general" }: SearchSkeletonProps) => {
  if (category === "images") {
    return (
      <div className="flex flex-wrap gap-2 after:flex-auto after:content-['']">
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

  if (category === "videos") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-3">
            <div className="flex gap-3">
              <Skeleton className="h-24 w-40 shrink-0 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (category === "news") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-24" />
                <span className="text-muted-foreground text-xs">•</span>
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export default SearchSkeleton
