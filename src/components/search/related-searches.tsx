"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { SearchIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { queryApi } from "@/lib/orpc/query"

interface RelatedSearchesProps {
  query: string
  category: string
}

const RelatedSearches = ({ query, category }: RelatedSearchesProps) => {
  const { data: suggestions = [] } = useQuery({
    ...queryApi.search.autocomplete.queryOptions({
      input: { query },
    }),
    enabled: query.length > 0,
  })

  const filtered = suggestions
    .filter((s: string) => s.toLowerCase() !== query.toLowerCase())
    .slice(0, 12)

  if (filtered.length === 0) {
    return null
  }

  return (
    <div className="mt-8">
      <h2 className="text-muted-foreground mb-3 text-sm font-medium">
        Related Searches
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {filtered.map((suggestion) => (
          <Link
            key={suggestion}
            href={`/search?q=${encodeURIComponent(suggestion)}&category=${category}`}
            prefetch={false}
          >
            <Card className="hover:bg-accent/50 cursor-pointer p-3 transition-colors">
              <div className="flex items-center gap-2">
                <SearchIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RelatedSearches
