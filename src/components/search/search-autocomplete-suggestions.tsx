"use client"

import { SearchIcon } from "lucide-react"

import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchAutocompleteSuggestionsProps {
  suggestions: string[]
  highlightedIndex: number
  onSelect: (suggestion: string) => void
  suggestionRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>
}

const SearchAutocompleteSuggestions = ({
  suggestions,
  highlightedIndex,
  onSelect,
  suggestionRefs,
}: SearchAutocompleteSuggestionsProps) => {
  if (suggestions.length === 0) return null

  return (
    <div className="bg-popover absolute top-full right-0 left-0 z-50 mt-1 rounded-md border shadow-md">
      <ScrollArea className="h-[20vh]">
        <div className="p-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              ref={(el) => {
                suggestionRefs.current[index] = el
              }}
              onClick={() => onSelect(suggestion)}
              className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm ${
                index === highlightedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <SearchIcon className="text-muted-foreground h-4 w-4" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default SearchAutocompleteSuggestions
