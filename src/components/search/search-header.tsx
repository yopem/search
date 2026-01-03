"use client"

import Link from "next/link"
import { LogInIcon } from "lucide-react"

import UserMenu from "@/components/auth/user-menu"
import Logo from "@/components/logo"
import SearchAutocomplete from "@/components/search/search-autocomplete"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SearchHeaderProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  category: "general" | "images" | "videos" | "news"
  onCategoryChange: (category: string) => void
  onCategoryHover: (category: string) => void
  session: {
    id: string
    email: string
    name: string | null
  } | null
}

const SearchHeader = ({
  query,
  onQueryChange,
  onSearch,
  category,
  onCategoryChange,
  onCategoryHover,
  session,
}: SearchHeaderProps) => {
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

        <div className="pb-2">
          <Tabs value={category} onValueChange={onCategoryChange}>
            <TabsList className="h-9">
              <TabsTrigger
                value="general"
                onMouseEnter={() => onCategoryHover("general")}
                className="px-3 py-1.5 text-sm"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="images"
                onMouseEnter={() => onCategoryHover("images")}
                className="px-3 py-1.5 text-sm"
              >
                Images
              </TabsTrigger>
              <TabsTrigger
                value="videos"
                onMouseEnter={() => onCategoryHover("videos")}
                className="px-3 py-1.5 text-sm"
              >
                Videos
              </TabsTrigger>
              <TabsTrigger
                value="news"
                onMouseEnter={() => onCategoryHover("news")}
                className="px-3 py-1.5 text-sm"
              >
                News
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default SearchHeader
