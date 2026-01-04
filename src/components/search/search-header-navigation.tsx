"use client"

import Link from "next/link"
import { LogInIcon } from "lucide-react"

import UserMenu from "@/components/auth/user-menu"
import Logo from "@/components/logo"
import SearchAutocomplete from "@/components/search/search-autocomplete"
import { Button } from "@/components/ui/button"

interface SearchHeaderNavigationProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  session: {
    id: string
    email: string
    name: string | null
  } | null
  language?: string
}

const SearchHeaderNavigation = ({
  query,
  onQueryChange,
  onSearch,
  session,
  language,
}: SearchHeaderNavigationProps) => {
  return (
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
  )
}

export default SearchHeaderNavigation
