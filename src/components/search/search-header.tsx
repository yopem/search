"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { LogInIcon } from "lucide-react"

import UserMenu from "@/components/auth/user-menu"
import Logo from "@/components/logo"
import SearchAutocomplete from "@/components/search/search-autocomplete"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

  const visibleCategories = [
    { value: "general", label: "All", visible: true },
    {
      value: "images",
      label: "Images",
      visible: userSettings?.showImagesCategory ?? true,
    },
    {
      value: "news",
      label: "News",
      visible: userSettings?.showNewsCategory ?? true,
    },
    {
      value: "videos",
      label: "Videos",
      visible: userSettings?.showVideosCategory ?? true,
    },
    {
      value: "music",
      label: "Music",
      visible: userSettings?.showMusicCategory ?? true,
    },
    {
      value: "map",
      label: "Map",
      visible: userSettings?.showMapCategory ?? false,
    },
    {
      value: "science",
      label: "Science",
      visible: userSettings?.showScienceCategory ?? false,
    },
    {
      value: "tech",
      label: "Tech",
      visible: userSettings?.showTechCategory ?? false,
    },
    {
      value: "files",
      label: "Files",
      visible: userSettings?.showFilesCategory ?? false,
    },
    {
      value: "social_media",
      label: "Social Media",
      visible: userSettings?.showSocialMediaCategory ?? false,
    },
  ]

  return (
    <div className="bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="hidden font-semibold sm:inline">Yopem</span>
          </Link>

          <form
            action="/search"
            method="get"
            onSubmit={(e) => {
              e.preventDefault()
              onSearch()
            }}
            className="max-w-2xl flex-1"
          >
            <SearchAutocomplete
              value={query}
              onChange={onQueryChange}
              onSubmit={onSearch}
              showKbdHint={true}
              alwaysShowKbd={true}
              language={language}
            />
          </form>

          <div className="flex shrink-0 items-center gap-2">
            {session && (
              <UserMenu
                user={{
                  id: session.id,
                  email: session.email,
                  name: session.name ?? undefined,
                }}
              />
            )}
            {!session && (
              <Button
                variant="ghost"
                size="icon"
                render={<Link href="/auth/login" />}
              >
                <LogInIcon className="size-4" />
                <span className="sr-only">Login</span>
              </Button>
            )}
          </div>
        </div>

        <div className="scrollbar-hide overflow-x-auto pb-2">
          <Tabs value={category} onValueChange={onCategoryChange}>
            <TabsList className="h-9 !w-fit">
              {visibleCategories
                .filter((cat) => cat.visible)
                .map((cat) => (
                  <TabsTrigger
                    key={cat.value}
                    value={cat.value}
                    onMouseEnter={() => onCategoryHover(cat.value)}
                    className="shrink-0 !grow-0 px-3 py-1.5 text-sm"
                  >
                    {cat.label}
                  </TabsTrigger>
                ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default SearchHeader
