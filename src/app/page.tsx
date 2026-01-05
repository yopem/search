import { Suspense } from "react"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"

import SearchInterface from "@/components/search/search-interface"
import { auth } from "@/lib/auth/session"
import { db } from "@/lib/db"
import { userSettingsTable } from "@/lib/db/schema"
import { weatherApiKey } from "@/lib/env/server"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
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
