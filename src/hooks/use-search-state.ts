"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs"

interface UseSearchStateProps {
  mode: "home" | "results"
}

export const useSearchState = ({ mode }: UseSearchStateProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [category, setCategory] = useQueryState(
    "category",
    parseAsStringLiteral([
      "general",
      "images",
      "videos",
      "news",
      "music",
      "map",
      "science",
      "files",
      "social_media",
      "tech",
    ] as const)
      .withDefault("general")
      .withOptions({
        shallow: false,
      }),
  )

  const [timeRange, setTimeRange] = useQueryState(
    "timeRange",
    parseAsString.withDefault(""),
  )

  const [region, setRegion] = useQueryState(
    "region",
    parseAsString.withDefault(""),
  )

  const [safeSearch, setSafeSearch] = useQueryState(
    "safeSearch",
    parseAsString.withDefault("2"),
  )

  const [language, setLanguage] = useQueryState(
    "lang",
    parseAsString.withDefault(""),
  )

  const [page, setPage] = useQueryState("page", parseAsString)

  useEffect(() => {
    if (mode !== "results") {
      return
    }

    if (!page) {
      void setPage("1", { history: "replace" })
      return
    }

    const pageNumber = parseInt(page)

    if (isNaN(pageNumber) || pageNumber < 1) {
      void setPage("1", { history: "replace" })
      return
    }
  }, [mode, page, setPage])

  const handleCategoryChange = (newCategory: string) => {
    void setCategory(newCategory as "general" | "images" | "videos" | "news")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) return

    if (trimmedQuery.length > 500) {
      return
    }

    void queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "search" && query.queryKey[1] === "query",
    })

    const params = new URLSearchParams()
    params.set("q", trimmedQuery)
    params.set("category", category)
    params.set("page", "1")

    if (language) {
      params.set("lang", language)
    }

    if (timeRange) {
      params.set("timeRange", timeRange)
    }

    if (safeSearch) {
      params.set("safeSearch", safeSearch)
    }

    if (region) {
      params.set("region", region)
    }

    router.push(`/search?${params.toString()}`)
  }

  return {
    category,
    setCategory,
    timeRange,
    setTimeRange,
    region,
    setRegion,
    safeSearch,
    setSafeSearch,
    language,
    setLanguage,
    page,
    setPage,
    handleCategoryChange,
    handleSearch,
  }
}
