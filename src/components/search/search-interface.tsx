"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import SearchInterfaceHome from "@/components/search/search-interface-home"
import SearchInterfaceResults from "@/components/search/search-interface-results"
import { useBangDetection } from "@/hooks/use-bang-detection"
import { useImageViewer } from "@/hooks/use-image-viewer"
import { useSearchKeyboard } from "@/hooks/use-search-keyboard"
import { useSearchState } from "@/hooks/use-search-state"
import { queryApi } from "@/lib/orpc/query"
import { detectLanguage } from "@/lib/utils/language-detection"

interface SearchInterfaceProps {
  mode: "home" | "results"
  session?: {
    id: string
    email: string
    name: string | null
  } | null
  openInNewTab?: boolean
  hasWeatherApi?: boolean
}

const SearchInterface = ({
  mode,
  session,
  openInNewTab = true,
  hasWeatherApi = false,
}: SearchInterfaceProps) => {
  const searchParams = useSearchParams()
  const initialQuery = mode === "results" ? (searchParams.get("q") ?? "") : ""

  const [query, setQuery] = useState("")

  const { data: resolvedBangs } = useQuery({
    ...queryApi.bangs.getResolved.queryOptions({
      input: {},
    }),
    enabled: !!session,
  })

  const { data: userSettings } = useQuery({
    ...queryApi.userSettings.get.queryOptions({
      input: {},
    }),
    enabled: !!session,
  })

  const {
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
    handleSearch: baseHandleSearch,
  } = useSearchState({ mode })

  const { detectAndHandleBang } = useBangDetection({ resolvedBangs })

  const {
    selectedImageIndex,
    isViewerOpen,
    handleNext: imageViewerHandleNext,
    handlePrevious,
    handleClose,
  } = useImageViewer()

  useEffect(() => {
    if (mode === "results") {
      setQuery(initialQuery)
    }
  }, [initialQuery, mode])

  useEffect(() => {
    if (!userSettings) {
      return
    }

    const urlParams = new URLSearchParams(window.location.search)
    const hasLanguageParam = urlParams.has("lang")
    const hasTimeRangeParam = urlParams.has("timeRange")
    const hasSafeSearchParam = urlParams.has("safeSearch")

    if (!hasLanguageParam && userSettings.defaultLanguage) {
      void setLanguage(userSettings.defaultLanguage)
    }

    if (!hasTimeRangeParam && userSettings.defaultTimeRange) {
      void setTimeRange(userSettings.defaultTimeRange)
    }

    if (!hasSafeSearchParam && userSettings.defaultSafeSearch) {
      void setSafeSearch(userSettings.defaultSafeSearch)
    }
  }, [userSettings, setLanguage, setTimeRange, setSafeSearch])

  useEffect(() => {
    if (!userSettings || !session || category === "general") {
      return
    }

    const categoryEnabledMap: Record<string, boolean | undefined> = {
      images: userSettings.showImagesCategory,
      news: userSettings.showNewsCategory,
      videos: userSettings.showVideosCategory,
      music: userSettings.showMusicCategory,
      map: userSettings.showMapCategory,
      science: userSettings.showScienceCategory,
      files: userSettings.showFilesCategory,
      social_media: userSettings.showSocialMediaCategory,
      tech: userSettings.showTechCategory,
    }

    const isEnabled = categoryEnabledMap[category]
    if (isEnabled === false) {
      void setCategory("general")
    }
  }, [userSettings, session, category, setCategory])

  const detectedLanguage = detectLanguage(query)
  const autocompleteLanguage = detectedLanguage ?? (language || undefined)

  const handleSearch = (searchQuery?: string) => {
    const trimmedQuery = (searchQuery ?? query).trim()

    if (!trimmedQuery) return

    if (trimmedQuery.length > 500) {
      return
    }

    if (detectAndHandleBang(trimmedQuery)) {
      return
    }

    baseHandleSearch(trimmedQuery)
  }

  const handleNext = () => {
    imageViewerHandleNext(0)
  }

  useSearchKeyboard({
    mode,
    isViewerOpen,
    selectedImageIndex,
    setCategory: (cat: string) =>
      void setCategory(cat as "general" | "images" | "videos" | "news"),
    handleNext,
    handlePrevious,
    handleClose,
  })

  if (mode === "home") {
    return (
      <SearchInterfaceHome
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        language={autocompleteLanguage}
      />
    )
  }

  return (
    <SearchInterfaceResults
      initialQuery={initialQuery}
      category={category}
      timeRange={timeRange}
      region={region}
      safeSearch={safeSearch}
      language={language}
      page={page}
      session={session}
      openInNewTab={openInNewTab}
      hasWeatherApi={hasWeatherApi}
      onCategoryChange={handleCategoryChange}
      onTimeRangeChange={(value) => void setTimeRange(value)}
      onRegionChange={(value) => void setRegion(value)}
      onSafeSearchChange={(value) => void setSafeSearch(value)}
      onLanguageChange={(value) => void setLanguage(value)}
      onClearFilters={() => {
        void setTimeRange("")
        void setRegion("")
        void setSafeSearch("2")
        void setLanguage("")
      }}
      onSearch={handleSearch}
      query={query}
      onQueryChange={setQuery}
      setPage={(p, opts) => void setPage(p, opts as never)}
    />
  )
}

export default SearchInterface
