"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import InfoboxPanel from "@/components/search/infobox-panel"
import RelatedSearches from "@/components/search/related-searches"
import SearchEmpty from "@/components/search/search-empty"
import SearchError from "@/components/search/search-error"
import SearchFilters from "@/components/search/search-filters"
import SearchHeader from "@/components/search/search-header"
import SearchInstantAnswers from "@/components/search/search-instant-answers"
import SearchPagination from "@/components/search/search-pagination"
import SearchResultsList from "@/components/search/search-results-list"
import SearchSkeleton from "@/components/search/search-skeleton"
import { useImageViewer } from "@/hooks/use-image-viewer"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { useMediaQuery } from "@/hooks/use-media-query"
import { queryApi } from "@/lib/orpc/query"
import { detectLanguage } from "@/lib/utils/language-detection"

const ImageViewer = dynamic(() => import("@/components/search/image-viewer"), {
  ssr: false,
})

interface SearchInterfaceResultsProps {
  initialQuery: string
  category:
    | "general"
    | "images"
    | "videos"
    | "news"
    | "music"
    | "map"
    | "science"
    | "files"
    | "social_media"
    | "tech"
  timeRange: string
  region: string
  safeSearch: string
  language: string
  page: string | null
  session?: {
    id: string
    email: string
    name: string | null
  } | null
  openInNewTab?: boolean
  hasWeatherApi?: boolean
  onCategoryChange: (category: string) => void
  onTimeRangeChange: (value: string) => void
  onRegionChange: (value: string) => void
  onSafeSearchChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onClearFilters: () => void
  onSearch: (query?: string) => void
  query: string
  onQueryChange: (query: string) => void
  setPage: (page: string, options?: { history: string }) => void
}

const detectInstantAnswer = (
  query: string,
  hasWeatherApi: boolean,
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

const SearchInterfaceResults = ({
  initialQuery,
  category,
  timeRange,
  region,
  safeSearch,
  language,
  page,
  session,
  openInNewTab = true,
  hasWeatherApi = false,
  onCategoryChange,
  onTimeRangeChange,
  onRegionChange,
  onSafeSearchChange,
  onLanguageChange,
  onClearFilters,
  onSearch,
  query,
  onQueryChange,
  setPage,
}: SearchInterfaceResultsProps) => {
  const queryClient = useQueryClient()
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const pageObserversRef = useRef<IntersectionObserver[]>([])
  const lastObserverPageRef = useRef<string | null>(null)

  const instantAnswer = detectInstantAnswer(initialQuery, hasWeatherApi)

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
      enabled: !!initialQuery,
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
    enabled: !!initialQuery && category === "general",
  })

  const {
    selectedImageIndex,
    isViewerOpen,
    handleImageClick,
    handleNext,
    handlePrevious,
    handleClose,
  } = useImageViewer()

  const { loadMoreRef, isInfiniteScrollEnabled, setIsInfiniteScrollEnabled } =
    useInfiniteScroll({
      category,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage: () => void fetchNextPage(),
    })

  const allResults = data?.pages.flatMap((page) => page.results) ?? []
  const detectedLanguage = detectLanguage(query)
  const autocompleteLanguage = detectedLanguage ?? (language || undefined)

  useEffect(() => {
    if (category !== "images") {
      setIsInfiniteScrollEnabled(false)
    }
  }, [category, setIsInfiniteScrollEnabled])

  useEffect(() => {
    if (!data?.pages) {
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
  }, [data?.pages, setPage, page])

  useEffect(() => {
    if (!page || !data?.pages) {
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

    if (pageNumber === 1) {
      return
    }

    const currentPagesLoaded = data.pages.length

    if (pageNumber > currentPagesLoaded && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
      return
    }

    if (isInfiniteScrollEnabled) {
      return
    }

    const targetPage = document.querySelector(`[data-page="${pageNumber}"]`)

    if (targetPage) {
      const yOffset = -140
      const y =
        targetPage.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
    }
  }, [
    page,
    data?.pages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isInfiniteScrollEnabled,
  ])

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

  const handleCarouselImageClick = (index: number) => {
    handleImageClick(index)
  }

  const handleLoadMore = () => {
    void fetchNextPage()
    setIsInfiniteScrollEnabled(true)
  }

  return (
    <>
      <SearchHeader
        query={query}
        onQueryChange={onQueryChange}
        onSearch={onSearch}
        category={category}
        onCategoryChange={onCategoryChange}
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
                onTimeRangeChange={onTimeRangeChange}
                onRegionChange={onRegionChange}
                onSafeSearchChange={onSafeSearchChange}
                onLanguageChange={onLanguageChange}
                onClearFilters={onClearFilters}
              />

              {!isLoading &&
                !error &&
                allResults.length > 0 &&
                data?.pages[0] && (
                  <div className="text-muted-foreground mb-4 text-sm">
                    {allResults.length.toLocaleString()}+ results
                  </div>
                )}

              <SearchInstantAnswers
                instantAnswer={instantAnswer}
                showCalculator={userSettings?.showCalculator ?? true}
                showUnitConverter={userSettings?.showUnitConverter ?? true}
                showWeather={userSettings?.showWeather ?? true}
              />

              {error && <SearchError error={error} onRetry={() => refetch()} />}

              {isLoading && <SearchSkeleton category={category} />}

              {!isLoading && !error && allResults.length === 0 && (
                <SearchEmpty query={initialQuery} />
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

              {!isLoading && !error && allResults.length > 0 && data?.pages && (
                <>
                  <SearchResultsList
                    category={category}
                    pages={data.pages as never}
                    carouselImages={carouselImages}
                    isLoadingImages={isLoadingImages}
                    initialQuery={initialQuery}
                    openInNewTab={openInNewTab}
                    onImageClick={handleImageClick}
                    onCarouselImageClick={handleCarouselImageClick}
                  />

                  <SearchPagination
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    isInfiniteScrollEnabled={isInfiniteScrollEnabled}
                    loadMoreRef={loadMoreRef as React.RefObject<HTMLDivElement>}
                    allResultsCount={allResults.length}
                    onLoadMore={handleLoadMore}
                  />
                </>
              )}

              {!isDesktop && category !== "images" && !error && (
                <RelatedSearches
                  query={initialQuery}
                  category={category}
                  timeRange={timeRange}
                  region={region}
                  safeSearch={safeSearch}
                  language={language}
                />
              )}
            </div>

            {isDesktop && category !== "images" && (
              <div className="w-100 shrink-0">
                <div className="sticky top-35 space-y-6">
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
                  {!error && (
                    <RelatedSearches
                      query={initialQuery}
                      category={category}
                      timeRange={timeRange}
                      region={region}
                      safeSearch={safeSearch}
                      language={language}
                    />
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
            onNext={() => handleNext(carouselImages.length)}
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
          onNext={() => handleNext(allResults.length)}
          onPrevious={handlePrevious}
          openInNewTab={openInNewTab}
        />
      )}
    </>
  )
}

export default SearchInterfaceResults
