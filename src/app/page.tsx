import { Suspense } from "react"

import SearchInterface from "@/components/search/search-interface"

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchInterface mode="home" />
    </Suspense>
  )
}
