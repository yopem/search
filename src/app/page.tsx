import { Suspense } from "react"

import SearchInterface from "@/components/search/search-interface"
import { weatherApiKey } from "@/lib/env/server"

export default function HomePage() {
  const hasWeatherApi = !!weatherApiKey

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchInterface mode="home" hasWeatherApi={hasWeatherApi} />
    </Suspense>
  )
}
