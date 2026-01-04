"use client"

import Logo from "@/components/logo"
import AddSearchEngineButton from "@/components/search/add-search-engine-button"
import SearchAutocomplete from "@/components/search/search-autocomplete"

interface SearchInterfaceHomeProps {
  query: string
  onQueryChange: (query: string) => void
  onSearch: (query?: string) => void
  language?: string
}

const SearchInterfaceHome = ({
  query,
  onQueryChange,
  onSearch,
  language,
}: SearchInterfaceHomeProps) => {
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
            onSearch()
          }}
        >
          <SearchAutocomplete
            value={query}
            onChange={onQueryChange}
            onSubmit={onSearch}
            placeholder="Search without being tracked"
            showKbdHint={true}
            language={language}
          />
        </form>
        <AddSearchEngineButton />
      </div>
    </div>
  )
}

export default SearchInterfaceHome
