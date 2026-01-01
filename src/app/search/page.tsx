import { Suspense } from "react"
import { redirect } from "next/navigation"

import SearchInterface from "@/components/search/search-interface"
import SearchSkeleton from "@/components/search/search-skeleton"
import { auth } from "@/lib/auth/session"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams

  if (!params.q) {
    redirect("/")
  }

  const session = await auth()

  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchInterface mode="results" session={session || null} />
    </Suspense>
  )
}
