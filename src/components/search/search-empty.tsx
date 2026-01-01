"use client"

import { LightbulbIcon, SearchIcon } from "lucide-react"

import { Card } from "@/components/ui/card"

const SearchEmpty = ({ query }: { query: string }) => {
  const suggestions = [
    "Try using different or more general keywords",
    "Check your spelling",
    "Use fewer keywords",
    "Try searching in a different category (Images, Videos, News)",
    "Use bang syntax to search other sites (e.g., !g for Google)",
  ]

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="mb-6 text-center">
        <SearchIcon className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No results found</h3>
        <p className="text-muted-foreground text-sm">
          No results found for &quot;{query}&quot;
        </p>
      </div>

      <Card className="w-full max-w-md p-4">
        <div className="mb-3 flex items-center gap-2">
          <LightbulbIcon className="h-4 w-4 text-yellow-500" />
          <h4 className="text-sm font-semibold">Suggestions</h4>
        </div>
        <ul className="text-muted-foreground space-y-2 text-sm">
          {suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-current" />
              <span>{suggestion}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export default SearchEmpty
