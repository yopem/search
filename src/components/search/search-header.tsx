"use client"

import { useQuery } from "@tanstack/react-query"

import SearchHeaderCategories from "@/components/search/search-header-categories"
import SearchHeaderNavigation from "@/components/search/search-header-navigation"
import { queryApi } from "@/lib/orpc/query"

interface SearchHeaderProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
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
  onCategoryChange: (category: string) => void
  onCategoryHover: (category: string) => void
  session: {
    id: string
    email: string
    name: string | null
  } | null
  language?: string
}

const SearchHeader = ({
  query,
  onQueryChange,
  onSearch,
  category,
  onCategoryChange,
  onCategoryHover,
  session,
  language,
}: SearchHeaderProps) => {
  const { data: userSettings } = useQuery({
    ...queryApi.userSettings.get.queryOptions({
      input: {},
    }),
    enabled: !!session,
  })

  return (
    <div className="bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <SearchHeaderNavigation
          query={query}
          onQueryChange={onQueryChange}
          onSearch={onSearch}
          session={session}
          language={language}
        />

        <SearchHeaderCategories
          category={category}
          onCategoryChange={onCategoryChange}
          onCategoryHover={onCategoryHover}
          userSettings={userSettings ?? null}
        />
      </div>
    </div>
  )
}

export default SearchHeader
