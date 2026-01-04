import { Suspense } from "react"

import SearchInterface from "@/components/search/search-interface"
import { auth } from "@/lib/auth/session"
import { weatherApiKey } from "@/lib/env/server"

export default async function HomePage() {
  const hasWeatherApi = !!weatherApiKey
  const session = await auth()

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchInterface
        mode="home"
        session={session || null}
        hasWeatherApi={hasWeatherApi}
      />
    </Suspense>
  )
}
