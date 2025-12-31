import { Suspense } from "react"

import { SearchPageClient } from "@/components/search/search-page-client"
import { SearchSkeleton } from "@/components/search/search-skeleton"

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchPageClient />
    </Suspense>
  )
}
