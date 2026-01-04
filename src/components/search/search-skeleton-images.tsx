"use client"

import { Skeleton } from "@/components/ui/skeleton"

const SearchSkeletonImages = () => {
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

export default SearchSkeletonImages
