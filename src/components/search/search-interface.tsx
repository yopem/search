"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useInfiniteQuery } from "@tanstack/react-query"
import { parseAsStringLiteral, useQueryState } from "nuqs"

import Logo from "@/components/logo"
import ImageResultCard from "@/components/search/image-result-card"
import NewsResultCard from "@/components/search/news-result-card"
import SearchAutocomplete from "@/components/search/search-autocomplete"
import SearchEmpty from "@/components/search/search-empty"
import SearchError from "@/components/search/search-error"
import SearchSkeleton from "@/components/search/search-skeleton"
import VideoResultCard from "@/components/search/video-result-card"
import WebResultCard from "@/components/search/web-result-card"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
}

interface SearchInterfaceProps {
  mode: "home" | "results"
}

const SearchInterface = ({ mode }: SearchInterfaceProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const initialQuery = mode === "results" ? (searchParams.get("q") ?? "") : ""

  const [query, setQuery] = useState("")

  const [category, setCategory] = useQueryState(
    "category",
    parseAsStringLiteral(["general", "images", "videos", "news"] as const)
      .withDefault("general")
      .withOptions({
        shallow: false,
      }),
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

  const handleSearch = () => {
    if (!query.trim()) return

    const params = new URLSearchParams()
    params.set("q", query)
    params.set("category", category)
    params.set("page", "1")
    router.push(`/search?${params.toString()}`)
  }

  const handleCategoryChange = (newCategory: string) => {
    void setCategory(newCategory as "general" | "images" | "videos" | "news")
  }

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
    <div className="container mx-auto max-w-7xl px-4 py-8 pt-20">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
        className="mb-8"
      >
        <SearchAutocomplete
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
        />
      </form>

      <Tabs value={category} onValueChange={handleCategoryChange}>
        <TabsList>
          <TabsTrigger value="general">All</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="news">News</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {error && (
            <SearchError
              message="Failed to fetch search results"
              onRetry={() => refetch()}
            />
          )}

          {isLoading && <SearchSkeleton />}

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
                <TabsContent value="general" className="space-y-4">
                  {allResults.map((result: SearchResult, index: number) => (
                    <article
                      key={index}
                      aria-posinset={index + 1}
                      aria-setsize={allResults.length}
                    >
                      <WebResultCard result={result} />
                    </article>
                  ))}
                </TabsContent>

                <TabsContent value="images">
                  <div className="flex flex-wrap gap-2 after:flex-auto after:content-['']">
                    {allResults.map((result: SearchResult, index: number) => (
                      <ImageResultCard key={index} result={result} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="space-y-4">
                  {allResults.map((result: SearchResult, index: number) => (
                    <article
                      key={index}
                      aria-posinset={index + 1}
                      aria-setsize={allResults.length}
                    >
                      <VideoResultCard result={result} />
                    </article>
                  ))}
                </TabsContent>

                <TabsContent value="news" className="space-y-4">
                  {allResults.map((result: SearchResult, index: number) => (
                    <article
                      key={index}
                      aria-posinset={index + 1}
                      aria-setsize={allResults.length}
                    >
                      <NewsResultCard result={result} />
                    </article>
                  ))}
                </TabsContent>
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
                  <span className="text-muted-foreground">No more results</span>
                </div>
              )}
            </>
          )}
        </div>
      </Tabs>
    </div>
  )
}

export default SearchInterface
