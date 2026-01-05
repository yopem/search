"use client"

import { Card, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const SearchSkeletonVideos = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="hover:bg-accent/50 transition-colors">
          <CardHeader className="p-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 shrink-0" />
                <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-3 w-3 rounded-sm" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="ml-1 h-5 w-12 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}

export default SearchSkeletonVideos
