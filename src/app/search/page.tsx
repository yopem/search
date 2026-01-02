import { Suspense } from "react"
import { redirect } from "next/navigation"

import SearchInterface from "@/components/search/search-interface"
import SearchSkeleton from "@/components/search/search-skeleton"
import { auth } from "@/lib/auth/session"
import { weatherApiKey } from "@/lib/env/server"
import { serverApi } from "@/lib/orpc/server"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams

  if (!params.q) {
    redirect("/")
  }

  const session = await auth()

  let openInNewTab = true
  if (session) {
    try {
      const settings = await serverApi.userSettings.get({})
      openInNewTab = settings.openInNewTab
    } catch {
      openInNewTab = true
    }
  }

  const hasWeatherApi = !!weatherApiKey

  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchInterface
        mode="results"
        session={session || null}
        openInNewTab={openInNewTab}
        hasWeatherApi={hasWeatherApi}
      />
    </Suspense>
  )
}
