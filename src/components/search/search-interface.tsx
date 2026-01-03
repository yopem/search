"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs"

import Logo from "@/components/logo"
import AddSearchEngineButton from "@/components/search/add-search-engine-button"
import ImageCarousel from "@/components/search/image-carousel"
import ImageResultCard from "@/components/search/image-result-card"
import ImageViewer from "@/components/search/image-viewer"
import InfoboxPanel, {
  InfoboxPanelSkeleton,
} from "@/components/search/infobox-panel"
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
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { queryApi } from "@/lib/orpc/query"
import { detectLanguage } from "@/lib/utils/language-detection"

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
  openInNewTab?: boolean
  hasWeatherApi?: boolean
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

const SearchInterface = ({
  mode,
  session,
  openInNewTab = true,
  hasWeatherApi = false,
}: SearchInterfaceProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const pageObserversRef = useRef<IntersectionObserver[]>([])
  const lastObserverPageRef = useRef<string | null>(null)
  const manualPageChangeRef = useRef<boolean>(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const initialQuery = mode === "results" ? (searchParams.get("q") ?? "") : ""

  const [query, setQuery] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  )
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isInfiniteScrollEnabled, setIsInfiniteScrollEnabled] =
    useState<boolean>(false)

  const [page, setPage] = useQueryState("page", parseAsString)

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

    if (hasWeatherApi) {
      const weatherRegex = /weather\s+(?:in\s+)?(.+)|(.+)\s+weather/i
      if (weatherRegex.test(query)) {
        return { type: "weather", data: query }
      }
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
    parseAsString.withDefault("2"),
  )

  const [language, setLanguage] = useQueryState(
    "lang",
    parseAsString.withDefault(""),
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
        language: language || undefined,
      }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.results.length > 0 ? allPages.length + 1 : undefined
      },
      enabled: mode === "results" && !!initialQuery,
    }),
  )

  const { data: userSettings } = useQuery({
    ...queryApi.userSettings.get.queryOptions({
      input: {},
    }),
    enabled: !!session,
  })

  const { data: carouselImages, isLoading: isLoadingImages } = useQuery({
    ...queryApi.search.getImages.queryOptions({
      input: {
        query: initialQuery || "",
        region: region || undefined,
        safeSearch: safeSearch || undefined,
        language: language || undefined,
      },
    }),
    enabled: mode === "results" && !!initialQuery && category === "general",
  })

  const allResults = data?.pages.flatMap((page) => page.results) ?? []

  const detectedLanguage = detectLanguage(query)
  const autocompleteLanguage = detectedLanguage ?? (language || undefined)

  useEffect(() => {
    if (mode === "results") {
      setQuery(initialQuery)
      if (category !== "images") {
        setIsInfiniteScrollEnabled(false)
      }
    }
  }, [initialQuery, mode, category])

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

  useEffect(() => {
    if (category === "images") {
      setIsInfiniteScrollEnabled(true)
    }
  }, [category])

  useEffect(() => {
    if (!isInfiniteScrollEnabled) {
      return
    }

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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isInfiniteScrollEnabled])

  useEffect(() => {
    if (!data?.pages || mode !== "results" || isInfiniteScrollEnabled) {
      return
    }

    pageObserversRef.current.forEach((observer) => observer.disconnect())
    pageObserversRef.current = []

    const timeout = setTimeout(() => {
      data.pages.forEach((_, pageIndex) => {
        const pageNumber = pageIndex + 1
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                const currentPageParam = parseInt(page ?? "1")
                const pagesLoaded = data.pages.length

                if (currentPageParam > pagesLoaded) {
                  return
                }

                lastObserverPageRef.current = pageNumber.toString()
                void setPage(pageNumber.toString())
              }
            })
          },
          { threshold: [0.1, 0.3, 0.5], rootMargin: "-100px 0px -100px 0px" },
        )

        const pageElement = document.querySelector(
          `[data-page="${pageNumber}"]`,
        )

        if (pageElement) {
          observer.observe(pageElement)
          pageObserversRef.current.push(observer)
        }
      })
    }, 100)

    return () => {
      clearTimeout(timeout)
      pageObserversRef.current.forEach((observer) => observer.disconnect())
      pageObserversRef.current = []
    }
  }, [data?.pages, mode, setPage, page, isInfiniteScrollEnabled])

  useEffect(() => {
    if (
      !page ||
      mode !== "results" ||
      !data?.pages ||
      isInfiniteScrollEnabled
    ) {
      return
    }

    if (lastObserverPageRef.current === page) {
      lastObserverPageRef.current = null
      return
    }

    const pageNumber = parseInt(page)
    if (isNaN(pageNumber) || pageNumber < 1) {
      return
    }

    const currentPagesLoaded = data.pages.length

    if (pageNumber > currentPagesLoaded && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
      return
    }

    const targetPage = document.querySelector(`[data-page="${pageNumber}"]`)

    if (targetPage) {
      manualPageChangeRef.current = true
      const yOffset = -140
      const y =
        targetPage.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })

      setTimeout(() => {
        manualPageChangeRef.current = false
      }, 1000)
    }
  }, [
    page,
    mode,
    data?.pages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isInfiniteScrollEnabled,
  ])

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

  const handleSearch = (searchQuery?: string) => {
    const trimmedQuery = (searchQuery ?? query).trim()

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

  const handleCarouselImageClick = (index: number) => {
    setSelectedImageIndex(index)
    setIsViewerOpen(true)
  }

  const handleNext = useCallback(() => {
    if (selectedImageIndex !== null) {
      const totalImages =
        category === "general" && carouselImages
          ? carouselImages.length
          : allResults.length
      if (selectedImageIndex < totalImages - 1) {
        setSelectedImageIndex(selectedImageIndex + 1)
      }
    }
  }, [selectedImageIndex, allResults.length, category, carouselImages])

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

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        const searchInput = document.querySelector(
          'input[type="search"], input[type="text"]',
        )
        if (searchInput instanceof HTMLInputElement) {
          searchInput.focus()
        }
      }

      if (e.key === "/" && mode === "results") {
        e.preventDefault()
        const searchInput = document.querySelector('input[type="text"]')
        if (searchInput instanceof HTMLInputElement) {
          searchInput.focus()
        }
      }

      if (e.key === "Escape") {
        const searchInput = document.querySelector(
          'input[type="search"], input[type="text"]',
        )
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

      if (mode === "results") {
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
        </div>

        <div className="w-full max-w-2xl space-y-4">
          <form
            action="/search"
            method="get"
            onSubmit={(e) => {
              e.preventDefault()
              handleSearch()
            }}
          >
            <SearchAutocomplete
              value={query}
              onChange={setQuery}
              onSubmit={handleSearch}
              placeholder="Search without being tracked"
              showKbdHint={true}
              language={autocompleteLanguage}
            />
          </form>
          <AddSearchEngineButton />
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
        language={autocompleteLanguage}
      />

      <div className="pt-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <div
              className={
                category === "images" ? "w-full" : "w-full max-w-162.5"
              }
            >
              <SearchFilters
                timeRange={timeRange}
                region={region}
                safeSearch={safeSearch}
                language={language}
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
              />

              {!isLoading &&
                !error &&
                allResults.length > 0 &&
                data?.pages[0] && (
                  <div className="text-muted-foreground mb-4 text-sm">
                    {allResults.length.toLocaleString()}+ results
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

              {!isDesktop &&
                isLoading &&
                category === "general" &&
                (userSettings?.showInfoboxPanels ?? true) && (
                  <div className="mb-4">
                    <InfoboxPanelSkeleton />
                  </div>
                )}

              {!isDesktop &&
                !isLoading &&
                !error &&
                category === "general" &&
                (userSettings?.showInfoboxPanels ?? true) &&
                data?.pages[0]?.infobox && (
                  <div className="mb-4">
                    <InfoboxPanel
                      type={data.pages[0].infobox.type}
                      title={data.pages[0].infobox.title}
                      image={data.pages[0].infobox.image}
                      summary={data.pages[0].infobox.summary}
                      attributes={data.pages[0].infobox.attributes}
                      source={data.pages[0].infobox.source}
                      sourceUrl={data.pages[0].infobox.sourceUrl}
                    />
                  </div>
                )}

              {!isLoading && !error && allResults.length > 0 && (
                <>
                  <div
                    role="feed"
                    aria-busy={isFetchingNextPage}
                    aria-label={`Search results for ${initialQuery}`}
                  >
                    {category === "general" &&
                      data?.pages.map((pageData, pageIndex) => (
                        <div
                          key={pageIndex}
                          data-page={pageIndex + 1}
                          className="mb-4 space-y-4 last:mb-0"
                        >
                          {pageData.results.map(
                            (result: SearchResult, resultIndex: number) => {
                              const globalIndex =
                                pageIndex *
                                  (data.pages[0]?.results.length || 10) +
                                resultIndex
                              const shouldShowCarousel =
                                pageIndex === 0 &&
                                resultIndex === 2 &&
                                carouselImages &&
                                carouselImages.length >= 6

                              return (
                                <div key={globalIndex}>
                                  <article
                                    aria-posinset={globalIndex + 1}
                                    aria-setsize={allResults.length}
                                  >
                                    <WebResultCard
                                      result={result}
                                      openInNewTab={openInNewTab}
                                    />
                                  </article>
                                  {pageIndex === 0 &&
                                    resultIndex === 2 &&
                                    (isLoadingImages ? (
                                      <div className="my-4 flex gap-2 overflow-hidden">
                                        {Array.from({ length: 6 }).map(
                                          (_, i) => (
                                            <div
                                              key={i}
                                              className="bg-muted h-32 w-48 flex-shrink-0 animate-pulse rounded-lg"
                                            />
                                          ),
                                        )}
                                      </div>
                                    ) : (
                                      shouldShowCarousel && (
                                        <ImageCarousel
                                          images={carouselImages}
                                          query={initialQuery}
                                          onImageClick={
                                            handleCarouselImageClick
                                          }
                                        />
                                      )
                                    ))}
                                </div>
                              )
                            },
                          )}
                        </div>
                      ))}

                    {category === "images" &&
                      data?.pages.map((pageData, pageIndex) => (
                        <div
                          key={pageIndex}
                          data-page={pageIndex + 1}
                          className="mb-2 flex flex-wrap gap-2 after:flex-auto after:content-[''] last:mb-0"
                        >
                          {pageData.results.map(
                            (result: SearchResult, resultIndex: number) => {
                              const globalIndex =
                                pageIndex *
                                  (data.pages[0]?.results.length || 10) +
                                resultIndex
                              return (
                                <ImageResultCard
                                  key={globalIndex}
                                  result={result}
                                  onImageClick={() =>
                                    handleImageClick(globalIndex)
                                  }
                                />
                              )
                            },
                          )}
                        </div>
                      ))}

                    {category === "videos" &&
                      data?.pages.map((pageData, pageIndex) => (
                        <div
                          key={pageIndex}
                          data-page={pageIndex + 1}
                          className="mb-4 space-y-4 last:mb-0"
                        >
                          {pageData.results.map(
                            (result: SearchResult, resultIndex: number) => {
                              const globalIndex =
                                pageIndex *
                                  (data.pages[0]?.results.length || 10) +
                                resultIndex
                              return (
                                <article
                                  key={globalIndex}
                                  aria-posinset={globalIndex + 1}
                                  aria-setsize={allResults.length}
                                >
                                  <VideoResultCard
                                    result={result}
                                    openInNewTab={openInNewTab}
                                  />
                                </article>
                              )
                            },
                          )}
                        </div>
                      ))}

                    {category === "news" &&
                      data?.pages.map((pageData, pageIndex) => (
                        <div
                          key={pageIndex}
                          data-page={pageIndex + 1}
                          className="mb-4 space-y-4 last:mb-0"
                        >
                          {pageData.results.map(
                            (result: SearchResult, resultIndex: number) => {
                              const globalIndex =
                                pageIndex *
                                  (data.pages[0]?.results.length || 10) +
                                resultIndex
                              return (
                                <article
                                  key={globalIndex}
                                  aria-posinset={globalIndex + 1}
                                  aria-setsize={allResults.length}
                                >
                                  <NewsResultCard
                                    result={result}
                                    openInNewTab={openInNewTab}
                                  />
                                </article>
                              )
                            },
                          )}
                        </div>
                      ))}
                  </div>

                  {!isInfiniteScrollEnabled && hasNextPage && (
                    <div className="flex justify-center py-8">
                      <Button
                        onClick={() => {
                          void fetchNextPage()
                          setIsInfiniteScrollEnabled(true)
                        }}
                        disabled={isFetchingNextPage}
                      >
                        {isFetchingNextPage ? (
                          <>
                            <Spinner className="h-4 w-4" />
                            <span className="ml-2">Loading...</span>
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
                    </div>
                  )}

                  {isFetchingNextPage && isInfiniteScrollEnabled && (
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

                  {isInfiniteScrollEnabled && (
                    <div
                      ref={loadMoreRef}
                      className="h-20 w-full"
                      aria-live="polite"
                      aria-busy={isFetchingNextPage}
                    />
                  )}

                  {!hasNextPage && allResults.length > 0 && (
                    <div className="flex justify-center py-8">
                      <span className="text-muted-foreground">
                        No more results
                      </span>
                    </div>
                  )}
                </>
              )}

              {!isDesktop &&
                category !== "images" &&
                !isLoading &&
                !error &&
                allResults.length > 0 && (
                  <RelatedSearches query={initialQuery} category={category} />
                )}
            </div>

            {isDesktop && category !== "images" && (
              <div className="w-100 shrink-0">
                <div className="sticky top-35 space-y-6">
                  {isLoading &&
                    category === "general" &&
                    (userSettings?.showInfoboxPanels ?? true) && (
                      <InfoboxPanelSkeleton />
                    )}
                  {!isLoading &&
                    !error &&
                    category === "general" &&
                    (userSettings?.showInfoboxPanels ?? true) &&
                    data?.pages[0]?.infobox && (
                      <InfoboxPanel
                        type={data.pages[0].infobox.type}
                        title={data.pages[0].infobox.title}
                        image={data.pages[0].infobox.image}
                        summary={data.pages[0].infobox.summary}
                        attributes={data.pages[0].infobox.attributes}
                        source={data.pages[0].infobox.source}
                        sourceUrl={data.pages[0].infobox.sourceUrl}
                      />
                    )}
                  {!isLoading && !error && allResults.length > 0 && (
                    <RelatedSearches query={initialQuery} category={category} />
                  )}
                </div>
              </div>
            )}

            {category === "images" && (
              <div className="hidden flex-1 lg:block" />
            )}
          </div>
        </div>
      </div>

      {selectedImageIndex !== null &&
        category === "general" &&
        carouselImages && (
          <ImageViewer
            isOpen={isViewerOpen}
            onClose={handleClose}
            currentIndex={selectedImageIndex}
            totalImages={carouselImages.length}
            image={carouselImages[selectedImageIndex]}
            nextImage={
              selectedImageIndex < carouselImages.length - 1
                ? carouselImages[selectedImageIndex + 1]
                : undefined
            }
            previousImage={
              selectedImageIndex > 0
                ? carouselImages[selectedImageIndex - 1]
                : undefined
            }
            onNext={handleNext}
            onPrevious={handlePrevious}
            openInNewTab={openInNewTab}
          />
        )}

      {selectedImageIndex !== null && category !== "general" && (
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
          openInNewTab={openInNewTab}
        />
      )}
    </>
  )
}

export default SearchInterface
