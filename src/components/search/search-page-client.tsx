"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"

import { ImageResultCard } from "@/components/search/image-result-card"
import { NewsResultCard } from "@/components/search/news-result-card"
import { SearchEmpty } from "@/components/search/search-empty"
import { SearchError } from "@/components/search/search-error"
import { SearchSkeleton } from "@/components/search/search-skeleton"
import { VideoResultCard } from "@/components/search/video-result-card"
import { WebResultCard } from "@/components/search/web-result-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export function SearchPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialQuery = searchParams.get("q") ?? ""
  const initialCategory = (searchParams.get("category") ?? "general") as
    | "general"
    | "images"
    | "videos"
    | "news"
  const initialPage = Number(searchParams.get("page")) || 1

  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [page, setPage] = useState(initialPage)

  const { data, isLoading, error, refetch } = useQuery({
    ...queryApi.search.query.queryOptions({
      input: {
        query: initialQuery || "placeholder",
        category,
        page,
      },
    }),
    enabled: !!initialQuery,
  })

  const shouldShowResults = !!initialQuery

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const params = new URLSearchParams()
    params.set("q", query)
    params.set("category", category)
    params.set("page", "1")
    router.push(`/search?${params.toString()}`)
    setPage(1)
  }

  const handleCategoryChange = (newCategory: string) => {
    const cat = newCategory as "general" | "images" | "videos" | "news"
    setCategory(cat)

    const params = new URLSearchParams()
    params.set("q", initialQuery)
    params.set("category", cat)
    params.set("page", "1")
    router.push(`/search?${params.toString()}`)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)

    const params = new URLSearchParams()
    params.set("q", initialQuery)
    params.set("category", category)
    params.set("page", newPage.toString())
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Search the web..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {!initialQuery ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="text-muted-foreground mb-4 h-16 w-16" />
          <h2 className="mb-2 text-2xl font-semibold">Start Searching</h2>
          <p className="text-muted-foreground">
            Enter a query to search the web
          </p>
        </div>
      ) : (
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

            {isLoading && shouldShowResults && <SearchSkeleton />}

            {!isLoading && !error && data && data.results.length === 0 && (
              <SearchEmpty query={initialQuery} />
            )}

            {!isLoading && !error && data && data.results.length > 0 && (
              <>
                <TabsContent value="general" className="space-y-4">
                  {data.results.map((result: SearchResult, index: number) => (
                    <WebResultCard key={index} result={result} />
                  ))}
                </TabsContent>

                <TabsContent value="images">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {data.results.map((result: SearchResult, index: number) => (
                      <ImageResultCard key={index} result={result} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="space-y-4">
                  {data.results.map((result: SearchResult, index: number) => (
                    <VideoResultCard key={index} result={result} />
                  ))}
                </TabsContent>

                <TabsContent value="news" className="space-y-4">
                  {data.results.map((result: SearchResult, index: number) => (
                    <NewsResultCard key={index} result={result} />
                  ))}
                </TabsContent>

                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-muted-foreground text-sm">
                    Page {page}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </Tabs>
      )}
    </div>
  )
}
