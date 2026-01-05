import { Suspense } from "react"
import { redirect } from "next/navigation"

import SearchInterface from "@/components/search/search-interface"
import { auth } from "@/lib/auth/session"
import { weatherApiKey } from "@/lib/env/server"
import { serverApi } from "@/lib/orpc/server"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const hasWeatherApi = !!weatherApiKey
  const session = await auth()
  const params = await searchParams

  if (session) {
    const settings = await serverApi.userSettings.get()

    const hasLangParam = "lang" in params
    const hasTimeRangeParam = "timeRange" in params
    const hasSafeSearchParam = "safeSearch" in params

    if (!hasLangParam || !hasTimeRangeParam || !hasSafeSearchParam) {
      const urlParams = new URLSearchParams()

      if (settings.defaultLanguage) {
        urlParams.set("lang", settings.defaultLanguage)
      }

      if (settings.defaultTimeRange) {
        urlParams.set("timeRange", settings.defaultTimeRange)
      }

      if (settings.defaultSafeSearch) {
        urlParams.set("safeSearch", settings.defaultSafeSearch)
      }

      const queryString = urlParams.toString()
      if (queryString) {
        redirect(`/?${queryString}`)
      }
    }
  }

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
