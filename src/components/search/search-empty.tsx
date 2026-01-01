"use client"

import { Search } from "lucide-react"

const SearchEmpty = ({ query }: { query: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Search className="text-muted-foreground mb-4 h-12 w-12" />
      <h3 className="mb-2 text-lg font-semibold">No results found</h3>
      <p className="text-muted-foreground text-sm">
        No results found for &quot;{query}&quot;. Try different keywords.
      </p>
    </div>
  )
}

export default SearchEmpty
