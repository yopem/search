"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs"

import Logo from "@/components/logo"
import ImageResultCard from "@/components/search/image-result-card"
import ImageViewer from "@/components/search/image-viewer"
import CalculatorWidget from "@/components/search/instant-answer-calculator"
import UnitConverterWidget from "@/components/search/instant-answer-unit-converter"
import WeatherWidget from "@/components/search/instant-answer-weather"
import NewsResultCard from "@/components/search/news-result-card"
import RelatedSearches from "@/components/search/related-searches"
import SearchAutocomplete from "@/components/search/search-autocomplete"
import SearchEmpty from "@/components/search/search-empty"
import SearchError from "@/components/search/search-error"
import SearchFilters from "@/components/search/search-filters"
import SearchHeader from "@/components/search/search-header"
import SearchSkeleton from "@/components/search/search-skeleton"
import VideoResultCard from "@/components/search/video-result-card"
import WebResultCard from "@/components/search/web-result-card"
import { Spinner } from "@/components/ui/spinner"
import { queryApi } from "@/lib/orpc/query"

interface SearchResult {
  title: string
  url: string
  content?: string
  img_src?: string
  thumbnail?: string
  thumbnail_src?: string
  publishedDate?: string
  author?: string
  iframe_src?: string
  duration?: string
  engine?: string
  resolution?: string
  img_format?: string
  source?: string
}

interface SearchInterfaceProps {
  mode: "home" | "results"
  session?: {
    id: string
    email: string
    name: string | null
  } | null
}

const BANG_MAPPINGS: Record<string, string> = {
  g: "https://www.google.com/search?q=",
  gh: "https://github.com/search?q=",
  so: "https://stackoverflow.com/search?q=",
  w: "https://en.wikipedia.org/wiki/Special:Search?search=",
  yt: "https://www.youtube.com/results?search_query=",
  a: "https://www.amazon.com/s?k=",
  r: "https://www.reddit.com/search?q=",
  tw: "https://twitter.com/search?q=",
  mdn: "https://developer.mozilla.org/en-US/search?q=",
  npm: "https://www.npmjs.com/search?q=",
  py: "https://docs.python.org/3/search.html?q=",
  wiki: "https://en.wikipedia.org/wiki/Special:Search?search=",
  imdb: "https://www.imdb.com/find?q=",
  maps: "https://www.google.com/maps/search/",
}

const SearchInterface = ({ mode, session }: SearchInterfaceProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const initialQuery = mode === "results" ? (searchParams.get("q") ?? "") : ""

  const [query, setQuery] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  )
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  const detectInstantAnswer = (
    query: string,
  ): { type: string; data: string } | null => {
    const mathRegex = /^[\d+\-*/().\s^]+$/
    const advancedMathRegex = /(sqrt|pow|sin|cos|tan|log)\(/
    if (mathRegex.test(query) || advancedMathRegex.test(query)) {
      return { type: "calculator", data: query }
    }

    const unitRegex = /(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\s+(?:to|in)\s+([a-zA-Z]+)/i
    if (unitRegex.test(query)) {
      return { type: "unitConverter", data: query }
    }

    const weatherRegex = /weather\s+(?:in\s+)?(.+)|(.+)\s+weather/i
    if (weatherRegex.test(query)) {
      return { type: "weather", data: query }
    }

    return null
  }

  const instantAnswer =
    mode === "results" ? detectInstantAnswer(initialQuery) : null

  const [category, setCategory] = useQueryState(
    "category",
    parseAsStringLiteral(["general", "images", "videos", "news"] as const)
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
    parseAsString.withDefault("1"),
  )

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery(
    queryApi.search.query.infiniteOptions({
      input: (pageParam: number) => ({
        query: initialQuery || "placeholder",
        category,
        page: pageParam,
        timeRange: timeRange || undefined,
        region: region || undefined,
        safeSearch: safeSearch || undefined,
      }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.results.length > 0 ? allPages.length + 1 : undefined
      },
      enabled: mode === "results" && !!initialQuery,
    }),
  )

  const allResults = data?.pages.flatMap((page) => page.results) ?? []

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const queryClient = useQueryClient()

  const detectAndHandleBang = (searchQuery: string): boolean => {
    const trimmedQuery = searchQuery.trim()
    const bangRegex = /^!(\w+)\s+(.+)/
    const bangMatch = bangRegex.exec(trimmedQuery)

    if (bangMatch) {
      const [, bang, query] = bangMatch
      const baseUrl = BANG_MAPPINGS[bang]

      if (baseUrl) {
        window.location.href = baseUrl + encodeURIComponent(query)
        return true
      }
    }

    return false
  }

  const handleSearch = () => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) return

    if (trimmedQuery.length > 500) {
      return
    }

    if (detectAndHandleBang(trimmedQuery)) {
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
    router.push(`/search?${params.toString()}`)
  }

  const handleCategoryChange = (newCategory: string) => {
    void setCategory(newCategory as "general" | "images" | "videos" | "news")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCategoryHover = (newCategory: string) => {
    if (newCategory === category || !initialQuery) return

    void queryClient.prefetchInfiniteQuery(
      queryApi.search.query.infiniteOptions({
        input: () => ({
          query: initialQuery,
          category: newCategory as "general" | "images" | "videos" | "news",
          page: 1,
        }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
          return lastPage.results.length > 0 ? allPages.length + 1 : undefined
        },
      }),
    )
  }

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setIsViewerOpen(true)
  }

  const handleNext = useCallback(() => {
    if (
      selectedImageIndex !== null &&
      selectedImageIndex < allResults.length - 1
    ) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }, [selectedImageIndex, allResults.length])

  const handlePrevious = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }, [selectedImageIndex])

  const handleClose = useCallback(() => {
    setIsViewerOpen(false)
    setSelectedImageIndex(null)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (e.key === "/" && mode === "results") {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]')
        if (searchInput instanceof HTMLInputElement) {
          searchInput.focus()
        }
      }

      if (e.key === "Escape" && mode === "results") {
        const searchInput = document.querySelector('input[type="text"]')
        if (
          searchInput instanceof HTMLInputElement &&
          searchInput === document.activeElement
        ) {
          searchInput.blur()
        }
      }

      if (isViewerOpen && selectedImageIndex !== null) {
        if (e.key === "ArrowRight" || e.key === "l") {
          e.preventDefault()
          handleNext()
        }
        if (e.key === "ArrowLeft" || e.key === "h") {
          e.preventDefault()
          handlePrevious()
        }
        if (e.key === "Escape") {
          e.preventDefault()
          handleClose()
        }
      }

      if (e.key === "1") {
        e.preventDefault()
        void setCategory("general")
      } else if (e.key === "2") {
        e.preventDefault()
        void setCategory("images")
      } else if (e.key === "3") {
        e.preventDefault()
        void setCategory("videos")
      } else if (e.key === "4") {
        e.preventDefault()
        void setCategory("news")
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    mode,
    isViewerOpen,
    selectedImageIndex,
    setCategory,
    handleNext,
    handlePrevious,
    handleClose,
  ])

  if (mode === "home") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 pt-20">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-24 w-auto" />
          <h1 className="text-4xl font-semibold">Yopem</h1>
          <p className="text-muted-foreground max-w-md text-center">
            Search the web without being tracked.
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <SearchAutocomplete
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            placeholder="Search without being tracked"
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <SearchHeader
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        category={category}
        onCategoryChange={handleCategoryChange}
        onCategoryHover={handleCategoryHover}
        session={session ?? null}
      />

      <div className="pt-[120px]">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <div
              className={
                category === "images" ? "w-full" : "w-full max-w-[650px]"
              }
            >
              <SearchFilters
                timeRange={timeRange}
                region={region}
                safeSearch={safeSearch}
                onTimeRangeChange={(value) => void setTimeRange(value)}
                onRegionChange={(value) => void setRegion(value)}
                onSafeSearchChange={(value) => void setSafeSearch(value)}
                onClearFilters={() => {
                  void setTimeRange("")
                  void setRegion("")
                  void setSafeSearch("1")
                }}
              />

              {!isLoading &&
                !error &&
                allResults.length > 0 &&
                data?.pages[0] && (
                  <div className="text-muted-foreground mb-4 text-sm">
                    {allResults.length.toLocaleString()}+ results (
                    {(data.pages[0]._meta.responseTime / 1000).toFixed(2)}{" "}
                    seconds)
                  </div>
                )}

              {instantAnswer?.type === "calculator" && (
                <CalculatorWidget initialExpression={instantAnswer.data} />
              )}

              {instantAnswer?.type === "unitConverter" && (
                <UnitConverterWidget initialQuery={instantAnswer.data} />
              )}

              {instantAnswer?.type === "weather" && (
                <WeatherWidget initialQuery={instantAnswer.data} />
              )}

              {error && <SearchError error={error} onRetry={() => refetch()} />}

              {isLoading && <SearchSkeleton category={category} />}

              {!isLoading && !error && allResults.length === 0 && (
                <SearchEmpty query={initialQuery} />
              )}

              {!isLoading && !error && allResults.length > 0 && (
                <>
                  <div
                    role="feed"
                    aria-busy={isFetchingNextPage}
                    aria-label={`Search results for ${initialQuery}`}
                  >
                    {category === "general" && (
                      <div className="space-y-4">
                        {allResults.map(
                          (result: SearchResult, index: number) => (
                            <article
                              key={index}
                              aria-posinset={index + 1}
                              aria-setsize={allResults.length}
                            >
                              <WebResultCard result={result} />
                            </article>
                          ),
                        )}
                      </div>
                    )}

                    {category === "images" && (
                      <div className="flex flex-wrap gap-2 after:flex-auto after:content-['']">
                        {allResults.map(
                          (result: SearchResult, index: number) => (
                            <ImageResultCard
                              key={index}
                              result={result}
                              onImageClick={() => handleImageClick(index)}
                            />
                          ),
                        )}
                      </div>
                    )}

                    {category === "videos" && (
                      <div className="space-y-4">
                        {allResults.map(
                          (result: SearchResult, index: number) => (
                            <article
                              key={index}
                              aria-posinset={index + 1}
                              aria-setsize={allResults.length}
                            >
                              <VideoResultCard result={result} />
                            </article>
                          ),
                        )}
                      </div>
                    )}

                    {category === "news" && (
                      <div className="space-y-4">
                        {allResults.map(
                          (result: SearchResult, index: number) => (
                            <article
                              key={index}
                              aria-posinset={index + 1}
                              aria-setsize={allResults.length}
                            >
                              <NewsResultCard result={result} />
                            </article>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  {isFetchingNextPage && (
                    <div
                      className="flex justify-center py-8"
                      aria-live="polite"
                      aria-busy="true"
                    >
                      <Spinner className="h-6 w-6" />
                      <span className="text-muted-foreground ml-2">
                        Loading more results...
                      </span>
                    </div>
                  )}

                  <div
                    ref={loadMoreRef}
                    className="h-20 w-full"
                    aria-live="polite"
                    aria-busy={isFetchingNextPage}
                  />

                  {!hasNextPage && allResults.length > 0 && (
                    <div className="flex justify-center py-8">
                      <span className="text-muted-foreground">
                        No more results
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {category !== "images" && (
              <div className="hidden w-[300px] shrink-0 lg:block">
                {!isLoading && !error && allResults.length > 0 && (
                  <div className="sticky top-[140px]">
                    <RelatedSearches query={initialQuery} category={category} />
                  </div>
                )}
              </div>
            )}

            {category === "images" && (
              <div className="hidden flex-1 lg:block" />
            )}
          </div>
        </div>
      </div>

      {selectedImageIndex !== null && (
        <ImageViewer
          isOpen={isViewerOpen}
          onClose={handleClose}
          currentIndex={selectedImageIndex}
          totalImages={allResults.length}
          image={allResults[selectedImageIndex]}
          nextImage={
            selectedImageIndex < allResults.length - 1
              ? allResults[selectedImageIndex + 1]
              : undefined
          }
          previousImage={
            selectedImageIndex > 0
              ? allResults[selectedImageIndex - 1]
              : undefined
          }
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </>
  )
}

export default SearchInterface
